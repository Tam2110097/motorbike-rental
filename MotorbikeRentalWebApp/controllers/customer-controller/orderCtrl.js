const rentalOrderModel = require('../../models/rentalOrderModels');
const rentalOrderMotorbikeDetailModel = require('../../models/rentalOrderMotorbikeDetailModels');
const motorbikeModel = require('../../models/motorbikeModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');
const userModel = require('../../models/userModels');
const branchModel = require('../../models/branchModels');
const accessoryDetailModel = require('../../models/accessoryDetailModels');
const accessoryModel = require('../../models/accessoryModels');
const tripContextModel = require('../../models/tripContextModels');
const orderDocumentModel = require('../../models/orderDocumentModels');
const mongoose = require('mongoose');
const paymentModel = require('../../models/paymentModels');
const refundModel = require('../../models/refundModels');
const feedbackModel = require('../../models/feedbackModels');
const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');

// Create rental order controller
const createRentalOrder = async (req, res) => {
    try {
        const customerId = req.user.id;
        const {
            branchReceive,
            branchReturn,
            receiveDate,
            returnDate,
            grandTotal,
            preDepositTotal,
            depositTotal,
            motorbikeDetails, // Array of {motorbikeTypeId, quantity, unitPrice}
            accessoryDetails, // Array of {accessoryId, quantity}
            receiveAddress, // String: address for receiving motorbike
            tripContext // Object: {purpose, distanceCategory, numPeople, terrain, luggage, preferredFeatures}
        } = req.body;

        if (!branchReceive || !branchReturn || !receiveDate || !returnDate || !grandTotal || !motorbikeDetails || !receiveAddress) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc'
            });
        }

        const receiveDateTime = new Date(receiveDate);
        const returnDateTime = new Date(returnDate);
        const now = new Date();

        if (receiveDateTime <= now) {
            return res.status(400).json({ success: false, message: 'Ngày nhận xe phải lớn hơn hiện tại' });
        }

        if (returnDateTime <= receiveDateTime) {
            return res.status(400).json({ success: false, message: 'Ngày trả xe phải lớn hơn ngày nhận xe' });
        }

        if (!receiveAddress || receiveAddress.trim() === '') {
            return res.status(400).json({ success: false, message: 'Địa chỉ nhận xe không được để trống' });
        }

        // Kiểm tra người dùng
        const customer = await userModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({ success: false, message: 'Khách hàng không tồn tại' });
        }

        // Kiểm tra chi nhánh
        const branchReceiveExists = await branchModel.findById(branchReceive);
        const branchReturnExists = await branchModel.findById(branchReturn);

        if (!branchReceiveExists || !branchReturnExists) {
            return res.status(404).json({ success: false, message: 'Chi nhánh không hợp lệ' });
        }

        // Kiểm tra chi tiết loại xe
        for (const detail of motorbikeDetails) {
            const motorbikeType = await motorbikeTypeModel.findById(detail.motorbikeTypeId);
            if (!motorbikeType) {
                return res.status(404).json({
                    success: false,
                    message: `Loại xe ${detail.motorbikeTypeId} không tồn tại`
                });
            }

            if (detail.quantity < 1 || detail.unitPrice < 0) {
                return res.status(400).json({ success: false, message: 'Thông tin loại xe không hợp lệ' });
            }
        }

        // Kiểm tra phụ kiện (nếu có)
        if (accessoryDetails && Array.isArray(accessoryDetails)) {
            for (const detail of accessoryDetails) {
                if (!detail.accessoryId || detail.quantity < 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Thông tin phụ kiện không hợp lệ'
                    });
                }
            }
        }

        // Kiểm tra tripContext (nếu có)
        if (tripContext) {
            const requiredFields = ['purpose', 'distanceCategory', 'numPeople', 'terrain', 'luggage'];
            for (const field of requiredFields) {
                if (!tripContext[field]) {
                    return res.status(400).json({
                        success: false,
                        message: `Trường ${field} là bắt buộc trong tripContext`
                    });
                }
            }
        }

        // Tính số ngày thuê
        // const rentalDays = Math.ceil((returnDateTime - receiveDateTime) / (1000 * 60 * 60 * 24));
        // const rentalDays = dayjs(returnDateTime).diff(dayjs(receiveDateTime), 'day') + 1;
        const startDate = dayjs(receiveDateTime);
        const endDate = dayjs(returnDateTime);
        const durationInDays = endDate.diff(startDate, 'day', true);
        const roundedDuration = Math.ceil(durationInDays);
        const rentalDays = roundedDuration <= 0 ? 1 : roundedDuration;
        // const rentalDays1 = roundedDuration <= 0 ? 1 : roundedDuration;
        console.log('>>> BE: rentalDays', rentalDays);

        // Tính tiền xe
        const motorbikeTotal = motorbikeDetails.reduce((total, detail) => {
            const unitPrice = Number(detail.unitPrice) || 0;
            const waiverFee = Number(detail.damageWaiverFee) || 0;

            return total + (unitPrice + waiverFee) * detail.quantity * rentalDays;
        }, 0);

        // Tính tiền phụ kiện
        let accessoryTotal = 0;
        if (accessoryDetails && Array.isArray(accessoryDetails)) {
            const accessoryIds = accessoryDetails.map(item => item.accessoryId);
            const accessories = await accessoryModel.find({ _id: { $in: accessoryIds } });

            accessoryTotal = accessoryDetails.reduce((sum, item) => {
                const matched = accessories.find(a => a._id.toString() === item.accessoryId);
                const price = matched ? matched.price : 0;
                return sum + item.quantity * price;
            }, 0);
        }

        // Tổng cuối cùng
        const calculatedTotal = Math.round((motorbikeTotal + accessoryTotal) * 100) / 100;


        console.log('>>> BE: motorbikeTotal', motorbikeTotal);
        console.log('>>> BE: accessoryTotal', accessoryTotal);
        console.log('>>> BE: calculatedTotal', calculatedTotal);
        console.log('>>> BE: grandTotal từ FE gửi lên', grandTotal);

        if (Math.abs(calculatedTotal - grandTotal) > 0.01) {
            return res.status(400).json({
                success: false,
                message: 'Tổng tiền không khớp với chi tiết đơn hàng'
            });
        }



        // 🔥 Tự động chọn xe máy khả dụng theo từng loại
        let selectedMotorbikes = [];

        for (const detail of motorbikeDetails) {
            const { motorbikeTypeId, quantity } = detail;

            // Ensure ObjectId type for query
            const typeId = typeof motorbikeTypeId === 'string' ? new mongoose.Types.ObjectId(motorbikeTypeId) : motorbikeTypeId;
            const branchObjId = typeof branchReceive === 'string' ? new mongoose.Types.ObjectId(branchReceive) : branchReceive;

            // Lấy tất cả xe khả dụng của loại này tại chi nhánh nhận
            const availableMotorbikes = await motorbikeModel.find({
                motorbikeType: typeId,
                branchId: branchObjId,
                status: 'available'
            }).sort({ createdAt: 1 });

            console.log(`>>> Checking motorbikeType ${motorbikeTypeId}`);
            console.log(`- Available: ${availableMotorbikes.length}, Needed: ${quantity}`);

            if (availableMotorbikes.length < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Không đủ xe loại ${motorbikeTypeId} trong chi nhánh nhận xe (có ${availableMotorbikes.length}, cần ${quantity})`
                });
            }

            // Lấy đúng số lượng xe cần thiết và gộp vào mảng motorbikes
            const selected = availableMotorbikes.slice(0, quantity);
            const formatted = selected.map(mb => ({
                motorbikeId: mb._id,
                motorbikeTypeId: typeId,
                quantity: 1,
                hasDamageWaiver: detail.hasDamageWaiver || false // Include damage waiver status
            }));
            selectedMotorbikes.push(...formatted);
        }

        const newRentalOrder = new rentalOrderModel({
            customerId,
            branchReceive,
            branchReturn,
            receiveDate: receiveDateTime,
            returnDate: returnDateTime,
            grandTotal,
            preDepositTotal,
            depositTotal,
            receiveAddress,
            motorbikes: selectedMotorbikes
        });


        await newRentalOrder.save();

        // Create order document record
        const newOrderDocument = new orderDocumentModel({
            rentalOrderId: newRentalOrder._id,
            cccdImages: [],
            driverLicenseImages: [],
            isCompleted: false
        });
        await newOrderDocument.save();

        const newPayment = new paymentModel({
            paymentType: 'preDeposit',
            amount: preDepositTotal,
            paymentMethod: 'bank_transfer',
            paymentDate: new Date(),
            transactionCode: newRentalOrder.orderCode,
            status: 'pending',
            note: 'Thanh toán tiền đặt cọc',
            rentalOrderId: newRentalOrder._id
        });
        await newPayment.save();

        // Tạo tripContext nếu có
        if (tripContext) {
            await tripContextModel.create({
                orderId: newRentalOrder._id,
                ...tripContext
            });
        }

        // Tạo chi tiết loại xe
        const motorbikeDetailPromises = motorbikeDetails.map(detail => {
            return new rentalOrderMotorbikeDetailModel({
                rentalOrderId: newRentalOrder._id,
                motorbikeTypeId: detail.motorbikeTypeId,
                quantity: detail.quantity,
                unitPrice: detail.unitPrice,
                damageWaiverFee: detail.damageWaiverFee,
                duration: detail.duration || rentalDays
            }).save();
        });
        await Promise.all(motorbikeDetailPromises);

        // Tạo chi tiết phụ kiện (nếu có)
        if (accessoryDetails && accessoryDetails.length > 0) {
            const accessoryDetailPromises = accessoryDetails.map(detail => {
                return new accessoryDetailModel({
                    rentalOrderId: newRentalOrder._id,
                    accessoryId: detail.accessoryId,
                    quantity: detail.quantity
                }).save();
            });
            await Promise.all(accessoryDetailPromises);
        }

        await Promise.all(
            selectedMotorbikes.map(item =>
                motorbikeModel.findByIdAndUpdate(item.motorbikeId, { status: 'reserved' })
            )
        );


        // Populate dữ liệu trả về
        await newRentalOrder.populate([
            { path: 'customerId' },
            { path: 'branchReceive' },
            { path: 'branchReturn' },
            { path: 'motorbikes' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Tạo đơn hàng thuê xe thành công',
            rentalOrder: newRentalOrder
        });

    } catch (error) {
        console.error('Error creating rental order:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};


// Get all rental orders for a customer
const getCustomerRentalOrders = async (req, res) => {
    try {
        const customerId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        // Validate customer exists
        const customer = await userModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Khách hàng không tồn tại'
            });
        }

        // Build query
        const query = { customerId };
        if (status) {
            query.status = status;
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get rental orders with pagination
        const rentalOrders = await rentalOrderModel.find(query)
            .populate([
                { path: 'customerId' },
                { path: 'branchReceive' },
                { path: 'branchReturn' },
                { path: 'motorbikes' }
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await rentalOrderModel.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách đơn hàng thành công',
            rentalOrders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Error getting customer rental orders:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get rental order by ID
const getRentalOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const rentalOrder = await rentalOrderModel.findById(id)
            .populate([
                { path: 'customerId' },
                { path: 'branchReceive' },
                { path: 'branchReturn' },
                {
                    path: 'motorbikes.motorbikeId',
                    select: 'code motorbikeType branchId status'
                },
                {
                    path: 'motorbikes.motorbikeTypeId',
                    select: 'name prefixCode'
                }
            ]);

        if (!rentalOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Only allow the owner to view the order
        if (
            rentalOrder.customerId &&
            (rentalOrder.customerId._id ? rentalOrder.customerId._id.toString() : rentalOrder.customerId.toString()) !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền xem đơn hàng này.'
            });
        }

        // Get motorbike details
        const motorbikeDetails = await rentalOrderMotorbikeDetailModel.find({
            rentalOrderId: id
        }).populate({
            path: 'motorbikeTypeId',
            select: 'name price' // add more fields if needed
        });

        // Get accessory details
        const accessoryDetails = await accessoryDetailModel.find({
            rentalOrderId: id
        }).populate({
            path: 'accessoryId',
            select: 'name price' // add more fields if needed
        });

        // Group motorbikes by type and include codes
        const motorbikesByType = {};
        if (rentalOrder.motorbikes && rentalOrder.motorbikes.length > 0) {
            rentalOrder.motorbikes.forEach(mb => {
                const typeId = mb.motorbikeTypeId._id.toString();
                if (!motorbikesByType[typeId]) {
                    motorbikesByType[typeId] = {
                        motorbikeTypeId: mb.motorbikeTypeId,
                        quantity: 0,
                        codes: []
                    };
                }
                motorbikesByType[typeId].quantity += mb.quantity || 1;
                if (mb.motorbikeId && mb.motorbikeId.code) {
                    motorbikesByType[typeId].codes.push(mb.motorbikeId.code);
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin đơn hàng thành công',
            rentalOrder,
            motorbikeDetails,
            motorbikesByType,
            accessoryDetails
        });

    } catch (error) {
        console.error('Error getting rental order:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update rental order status
const updateRentalOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        // Check if rental order exists
        const rentalOrder = await rentalOrderModel.findById(id);
        if (!rentalOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Update status
        rentalOrder.status = status;

        // If cancelling, update motorbike status back to available
        if (status === 'cancelled') {
            const updateMotorbikePromises = rentalOrder.motorbikes.map(motorbikeId => {
                return motorbikeModel.findByIdAndUpdate(motorbikeId, { status: 'available' });
            });
            await Promise.all(updateMotorbikePromises);
        }

        // If completing, update motorbike status back to available
        if (status === 'completed') {
            const updateMotorbikePromises = rentalOrder.motorbikes.map(motorbikeId => {
                return motorbikeModel.findByIdAndUpdate(motorbikeId, { status: 'available' });
            });
            await Promise.all(updateMotorbikePromises);
        }

        await rentalOrder.save();

        // Populate references for response
        await rentalOrder.populate([
            { path: 'customerId' },
            { path: 'branchReceive' },
            { path: 'branchReturn' },
            { path: 'motorbikes' }
        ]);

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái đơn hàng thành công',
            rentalOrder
        });

    } catch (error) {
        console.error('Error updating rental order status:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Cancel rental order
const cancelRentalOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        // const userId = req.user.id;
        // Check if rental order exists
        const rentalOrder = await rentalOrderModel.findById(id);
        if (!rentalOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        // Check if order can be cancelled
        if (rentalOrder.status === 'completed' || rentalOrder.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đã hoàn thành hoặc đã hủy'
            });
        }
        // If cancellation is at least 8 hours before receiveDate, create refund
        const now = new Date();
        const receiveDate = new Date(rentalOrder.receiveDate);
        const hoursDiff = (receiveDate - now) / (1000 * 60 * 60);
        if (hoursDiff >= 8) {
            // Find payment for this order
            const payment = await paymentModel.findOne({ rentalOrderId: id });
            if (payment) {
                await refundModel.create({
                    amount: rentalOrder.preDepositTotal,
                    reason: 'Hủy đơn trước 8 tiếng',
                    status: 'pending',
                    paymentId: payment._id,
                    // processedBy: '', // Do not set to empty string
                    invoiceImage: ''
                });
            }
        }
        // Update status to cancelled
        rentalOrder.status = 'cancelled';
        await rentalOrder.save();
        // Update motorbike status back to available
        const updateMotorbikePromises = rentalOrder.motorbikes.map(async (motorbikeItem) => {
            const motorbike = await motorbikeModel.findById(motorbikeItem.motorbikeId);
            if (motorbike) {
                if (motorbike.booking && motorbike.booking.length > 0) {
                    return motorbikeModel.findByIdAndUpdate(
                        motorbike._id,
                        { status: 'available', booking: [] }
                    );
                } else {
                    return motorbikeModel.findByIdAndUpdate(
                        motorbike._id,
                        { status: 'available' }
                    );
                }
            }
        });
        // Create refund for preDepositTotal if payment exists
        const payment = await paymentModel.findOne({ rentalOrderId: rentalOrder._id });
        if (payment && rentalOrder.preDepositTotal > 0) {
            await refundModel.create({
                amount: rentalOrder.preDepositTotal,
                reason: 'Hủy đơn hàng',
                status: 'pending',
                paymentId: payment._id,
                // processedBy: '', // Do not set to empty string
                invoiceImage: ''
            });
        }
        // Populate references for response
        await rentalOrder.populate([
            { path: 'customerId' },
            { path: 'branchReceive' },
            { path: 'branchReturn' },
            { path: 'motorbikes' }
        ]);
        res.status(200).json({
            success: true,
            message: 'Hủy đơn hàng thành công',
            rentalOrder
        });
    } catch (error) {
        console.error('Error cancelling rental order:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// POST /api/v1/customer/order/:orderId/feedback
const createOrderFeedback = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { comment, satisfactionScore } = req.body;
        const customerId = req.user.id;
        if (!comment || typeof satisfactionScore !== 'number' || satisfactionScore < 1 || satisfactionScore > 5) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập nhận xét và điểm hài lòng (1-5).' });
        }
        // Check order exists, belongs to customer, and is completed
        const order = await rentalOrderModel.findById(orderId);
        if (!order || String(order.customerId) !== String(customerId) || order.status !== 'completed') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể đánh giá đơn hàng đã hoàn thành của bạn.' });
        }
        // Prevent duplicate feedback
        const existing = await feedbackModel.findOne({ rentalOrderId: orderId, customerId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Bạn đã đánh giá đơn hàng này rồi.' });
        }
        const feedback = await feedbackModel.create({
            comment,
            satisfactionScore,
            customerId,
            rentalOrderId: orderId
        });
        res.status(201).json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/v1/customer/order/:orderId/feedback
const getOrderFeedback = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.id;
        const feedback = await feedbackModel.findOne({ rentalOrderId: orderId, customerId });
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Chưa có đánh giá cho đơn hàng này.' });
        }
        res.status(200).json({ success: true, feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get rental order statistics for customer
const getCustomerOrderStatistics = async (req, res) => {
    try {
        const { customerId } = req.params;

        // Validate customer exists
        const customer = await userModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Khách hàng không tồn tại'
            });
        }

        // Get statistics
        const totalOrders = await rentalOrderModel.countDocuments({ customerId });
        const pendingOrders = await rentalOrderModel.countDocuments({ customerId, status: 'pending' });
        const activeOrders = await rentalOrderModel.countDocuments({ customerId, status: 'active' });
        const completedOrders = await rentalOrderModel.countDocuments({ customerId, status: 'completed' });
        const cancelledOrders = await rentalOrderModel.countDocuments({ customerId, status: 'cancelled' });

        // Calculate total spent
        const completedRentalOrders = await rentalOrderModel.find({
            customerId,
            status: 'completed'
        });
        const totalSpent = completedRentalOrders.reduce((total, order) => total + order.grandTotal, 0);

        res.status(200).json({
            success: true,
            message: 'Lấy thống kê đơn hàng thành công',
            statistics: {
                totalOrders,
                pendingOrders,
                activeOrders,
                completedOrders,
                cancelledOrders,
                totalSpent
            }
        });

    } catch (error) {
        console.error('Error getting customer order statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Upload order documents
const uploadOrderDocuments = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.id;

        // Check if order exists and belongs to customer
        const order = await rentalOrderModel.findById(orderId);
        if (!order || String(order.customerId) !== String(customerId)) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn'
            });
        }

        // Check if order is in pending status
        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể tải lên giấy tờ cho đơn hàng đang chờ thanh toán'
            });
        }

        // Get uploaded files
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);
        console.log('req.files.cccdImages:', req.files?.cccdImages);
        console.log('req.files.driverLicenseImages:', req.files?.driverLicenseImages);

        const cccdImages = req.files?.cccdImages || [];
        const driverLicenseImages = req.files?.driverLicenseImages || [];

        console.log('cccdImages array length:', cccdImages.length);
        console.log('driverLicenseImages array length:', driverLicenseImages.length);

        if (cccdImages.length === 0 && driverLicenseImages.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng tải lên ít nhất một loại giấy tờ'
            });
        }

        // Calculate total motorbike quantity from order
        const totalMotorbikeQuantity = order.motorbikes.reduce((total, motorbike) => total + motorbike.quantity, 0);

        // Process and save images
        const cccdImageUrls = [];
        const driverLicenseImageUrls = [];

        // Process CCCD images
        if (Array.isArray(cccdImages)) {
            for (const file of cccdImages) {
                console.log('CCCD file object:', file);
                console.log('CCCD filename:', file.filename);
                console.log('CCCD path:', file.path);
                // Use the actual filename that multer saved
                if (file.filename) {
                    // Check if file actually exists on disk
                    const filePath = path.join(__dirname, '../../uploads', file.filename);
                    if (fs.existsSync(filePath)) {
                        console.log('CCCD file exists on disk:', filePath);
                        cccdImageUrls.push(file.filename);
                    } else {
                        console.error('CCCD file does not exist on disk:', filePath);
                    }
                } else {
                    console.error('CCCD file has no filename:', file);
                }
            }
        } else if (cccdImages) {
            console.log('Single CCCD file object:', cccdImages);
            console.log('Single CCCD filename:', cccdImages.filename);
            console.log('Single CCCD path:', cccdImages.path);
            if (cccdImages.filename) {
                // Check if file actually exists on disk
                const filePath = path.join(__dirname, '../../uploads', cccdImages.filename);
                if (fs.existsSync(filePath)) {
                    console.log('Single CCCD file exists on disk:', filePath);
                    cccdImageUrls.push(cccdImages.filename);
                } else {
                    console.error('Single CCCD file does not exist on disk:', filePath);
                }
            } else {
                console.error('Single CCCD file has no filename:', cccdImages);
            }
        }

        // Process driver license images
        if (Array.isArray(driverLicenseImages)) {
            for (const file of driverLicenseImages) {
                console.log('Driver license file object:', file);
                console.log('Driver license filename:', file.filename);
                console.log('Driver license path:', file.path);
                // Use the actual filename that multer saved
                if (file.filename) {
                    // Check if file actually exists on disk
                    const filePath = path.join(__dirname, '../../uploads', file.filename);
                    if (fs.existsSync(filePath)) {
                        console.log('Driver license file exists on disk:', filePath);
                        driverLicenseImageUrls.push(file.filename);
                    } else {
                        console.error('Driver license file does not exist on disk:', filePath);
                    }
                } else {
                    console.error('Driver license file has no filename:', file);
                }
            }
        } else if (driverLicenseImages) {
            console.log('Single driver license file object:', driverLicenseImages);
            console.log('Single driver license filename:', driverLicenseImages.filename);
            console.log('Single driver license path:', driverLicenseImages.path);
            if (driverLicenseImages.filename) {
                // Check if file actually exists on disk
                const filePath = path.join(__dirname, '../../uploads', driverLicenseImages.filename);
                if (fs.existsSync(filePath)) {
                    console.log('Single driver license file exists on disk:', filePath);
                    driverLicenseImageUrls.push(driverLicenseImages.filename);
                } else {
                    console.error('Single driver license file does not exist on disk:', filePath);
                }
            } else {
                console.error('Single driver license file has no filename:', driverLicenseImages);
            }
        }

        // Calculate total images after processing
        const totalCccdImages = cccdImageUrls.length;
        const totalDriverLicenseImages = driverLicenseImageUrls.length;

        // Check if we have existing documents to add to
        const existingDocument = await orderDocumentModel.findOne({ rentalOrderId: orderId });

        let finalCccdImages = [];
        let finalDriverLicenseImages = [];
        let isCompleted = false;

        if (existingDocument) {
            // Add new images to existing ones
            finalCccdImages = [...existingDocument.cccdImages, ...cccdImageUrls];
            finalDriverLicenseImages = [...existingDocument.driverLicenseImages, ...driverLicenseImageUrls];
        } else {
            // Use only new images
            finalCccdImages = cccdImageUrls;
            finalDriverLicenseImages = driverLicenseImageUrls;
        }

        // Validate that the total images match the motorbike quantity
        const totalFinalCccd = finalCccdImages.length;
        const totalFinalDriverLicense = finalDriverLicenseImages.length;

        // Set isCompleted to true only if all quantities match
        if (totalFinalCccd === totalMotorbikeQuantity &&
            totalFinalDriverLicense === totalMotorbikeQuantity) {
            isCompleted = true;
        }

        // Update or create order document record
        console.log('Final CCCD images to save:', finalCccdImages);
        console.log('Final driver license images to save:', finalDriverLicenseImages);

        if (existingDocument) {
            // Update existing document
            existingDocument.cccdImages = finalCccdImages;
            existingDocument.driverLicenseImages = finalDriverLicenseImages;
            existingDocument.isCompleted = isCompleted;
            await existingDocument.save();
            console.log('Updated existing document');
        } else {
            // Create new document record
            const newDoc = await orderDocumentModel.create({
                rentalOrderId: orderId,
                cccdImages: finalCccdImages,
                driverLicenseImages: finalDriverLicenseImages,
                isCompleted: isCompleted
            });
            console.log('Created new document:', newDoc);
        }

        const responseMessage = isCompleted
            ? 'Tải lên giấy tờ thành công! Đã đủ số lượng giấy tờ cần thiết.'
            : `Tải lên giấy tờ thành công! Cần thêm ${totalMotorbikeQuantity - totalFinalCccd} CCCD và ${totalMotorbikeQuantity - totalFinalDriverLicense} bằng lái xe.`;

        res.status(200).json({
            success: true,
            message: responseMessage,
            documentInfo: {
                cccdCount: totalFinalCccd,
                licenseCount: totalFinalDriverLicense,
                requiredCount: totalMotorbikeQuantity,
                isCompleted: isCompleted
            }
        });

    } catch (error) {
        console.error('Error uploading order documents:', error);

        // Handle multer errors specifically
        if (error.name === 'MulterError') {
            return res.status(400).json({
                success: false,
                message: 'Lỗi tải lên file: ' + error.message
            });
        }

        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi tải lên giấy tờ',
            error: error.message
        });
    }
};

// Get document completion status
const getDocumentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.id;

        // Check if order exists and belongs to customer
        const order = await rentalOrderModel.findById(orderId);
        if (!order || String(order.customerId) !== String(customerId)) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn'
            });
        }

        // Find document record
        const documentRecord = await orderDocumentModel.findOne({ rentalOrderId: orderId });

        res.status(200).json({
            success: true,
            isCompleted: documentRecord ? documentRecord.isCompleted : false
        });

    } catch (error) {
        console.error('Error getting document status:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi kiểm tra trạng thái giấy tờ',
            error: error.message
        });
    }
};

// Clean up duplicate documents
const cleanupDuplicateDocuments = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.id;

        // Check if order exists and belongs to customer
        const order = await rentalOrderModel.findById(orderId);
        if (!order || String(order.customerId) !== String(customerId)) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn'
            });
        }

        // Find and delete document record
        const documentRecord = await orderDocumentModel.findOneAndDelete({ rentalOrderId: orderId });

        if (documentRecord) {
            console.log('Deleted duplicate document record:', documentRecord);
            res.status(200).json({
                success: true,
                message: 'Đã xóa giấy tờ trùng lặp. Vui lòng tải lên lại.'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Không tìm thấy giấy tờ để xóa'
            });
        }

    } catch (error) {
        console.error('Error cleaning up duplicate documents:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xóa giấy tờ trùng lặp',
            error: error.message
        });
    }
};

// Test file access
const testFileAccess = async (req, res) => {
    try {
        const testFile = '1753696498582-hondablade110cc.png';
        const filePath = path.join(__dirname, '../../uploads', testFile);

        if (fs.existsSync(filePath)) {
            res.status(200).json({
                success: true,
                message: 'File exists on disk',
                filePath: filePath,
                fileUrl: `http://localhost:8080/uploads/${testFile}`
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'File does not exist on disk',
                filePath: filePath
            });
        }
    } catch (error) {
        console.error('Error testing file access:', error);
        res.status(500).json({
            success: false,
            message: 'Error testing file access',
            error: error.message
        });
    }
};

// Get existing documents
const getExistingDocuments = async (req, res) => {
    try {
        const { orderId } = req.params;
        const customerId = req.user.id;

        // Check if order exists and belongs to customer
        const order = await rentalOrderModel.findById(orderId);
        if (!order || String(order.customerId) !== String(customerId)) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại hoặc không thuộc về bạn'
            });
        }

        // Find document record
        const documentRecord = await orderDocumentModel.findOne({ rentalOrderId: orderId });

        if (!documentRecord) {
            return res.status(404).json({
                success: false,
                message: 'Chưa có giấy tờ được tải lên'
            });
        }

        console.log('Retrieved document record:', documentRecord);
        console.log('CCCD images from DB:', documentRecord.cccdImages);
        console.log('Driver license images from DB:', documentRecord.driverLicenseImages);

        res.status(200).json({
            success: true,
            documents: {
                cccdImages: documentRecord.cccdImages || [],
                driverLicenseImages: documentRecord.driverLicenseImages || [],
                isCompleted: documentRecord.isCompleted,
                uploadedAt: documentRecord.uploadedAt
            }
        });

    } catch (error) {
        console.error('Error getting existing documents:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin giấy tờ',
            error: error.message
        });
    }
};

module.exports = {
    createRentalOrder,
    getCustomerRentalOrders,
    getRentalOrderById,
    updateRentalOrderStatus,
    cancelRentalOrder,
    getCustomerOrderStatistics,
    createOrderFeedback,
    getOrderFeedback,
    uploadOrderDocuments,
    getDocumentStatus,
    getExistingDocuments,
    testFileAccess,
    cleanupDuplicateDocuments
};
