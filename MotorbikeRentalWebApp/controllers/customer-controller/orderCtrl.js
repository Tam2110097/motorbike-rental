const rentalOrderModel = require('../../models/rentalOrderModels');
const rentalOrderMotorbikeDetailModel = require('../../models/rentalOrderMotorbikeDetailModels');
const motorbikeModel = require('../../models/motorbikeModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');
const userModel = require('../../models/userModels');
const branchModel = require('../../models/branchModels');
const accessoryDetailModel = require('../../models/accessoryDetailModels');
const accessoryModel = require('../../models/accessoryModels');
const tripContextModel = require('../../models/tripContextModels');
const mongoose = require('mongoose');

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
            motorbikeDetails, // Array of {motorbikeTypeId, quantity, unitPrice}
            accessoryDetails, // Array of {accessoryId, quantity}
            tripContext // Object: {purpose, distanceCategory, numPeople, terrain, luggage, preferredFeatures}
        } = req.body;

        if (!branchReceive || !branchReturn || !receiveDate || !returnDate || !grandTotal || !motorbikeDetails) {
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
        const rentalDays = Math.ceil((returnDateTime - receiveDateTime) / (1000 * 60 * 60 * 24));

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
                quantity: 1
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
            motorbikes: selectedMotorbikes
        });


        await newRentalOrder.save();

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
                damageWaiverFee: detail.damageWaiverFee
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
                { path: 'motorbikes' }
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
        }).populate('motorbikeTypeId');

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin đơn hàng thành công',
            rentalOrder,
            motorbikeDetails
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

        // Update status to cancelled
        rentalOrder.status = 'cancelled';
        await rentalOrder.save();

        // Update motorbike status back to available
        const updateMotorbikePromises = rentalOrder.motorbikes.map(motorbikeId => {
            return motorbikeModel.findByIdAndUpdate(motorbikeId, { status: 'available' });
        });
        await Promise.all(updateMotorbikePromises);

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

module.exports = {
    createRentalOrder,
    getCustomerRentalOrders,
    getRentalOrderById,
    updateRentalOrderStatus,
    cancelRentalOrder,
    getCustomerOrderStatistics
};
