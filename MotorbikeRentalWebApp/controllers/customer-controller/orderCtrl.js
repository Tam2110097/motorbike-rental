const rentalOrderModel = require('../../models/rentalOrderModels');
const rentalOrderMotorbikeDetailModel = require('../../models/rentalOrderMotorbikeDetailModels');
const motorbikeModel = require('../../models/motorbikeModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');
const customerModel = require('../../models/customerModels');
const branchModel = require('../../models/branchModels');

// Create rental order controller
const createRentalOrder = async (req, res) => {
    try {
        const {
            customerId,
            branchReceive,
            branchReturn,
            receiveDate,
            returnDate,
            evidenceImage,
            hasDamageWaiver,
            grandTotal,
            motorbikes,
            motorbikeDetails // Array of {motorbikeTypeId, quantity, unitPrice}
        } = req.body;

        // Validate required fields
        if (!customerId || !branchReceive || !branchReturn || !receiveDate || !returnDate || !evidenceImage || !grandTotal || !motorbikes || !motorbikeDetails) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc',
                missingFields: {
                    customerId: !customerId,
                    branchReceive: !branchReceive,
                    branchReturn: !branchReturn,
                    receiveDate: !receiveDate,
                    returnDate: !returnDate,
                    evidenceImage: !evidenceImage,
                    grandTotal: !grandTotal,
                    motorbikes: !motorbikes,
                    motorbikeDetails: !motorbikeDetails
                }
            });
        }

        // Validate dates
        const receiveDateTime = new Date(receiveDate);
        const returnDateTime = new Date(returnDate);
        const now = new Date();

        if (receiveDateTime <= now) {
            return res.status(400).json({
                success: false,
                message: 'Ngày nhận xe phải lớn hơn ngày hiện tại'
            });
        }

        if (returnDateTime <= receiveDateTime) {
            return res.status(400).json({
                success: false,
                message: 'Ngày trả xe phải lớn hơn ngày nhận xe'
            });
        }

        // Check if customer exists
        const customer = await customerModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Khách hàng không tồn tại'
            });
        }

        // Check if branches exist
        const branchReceiveExists = await branchModel.findById(branchReceive);
        const branchReturnExists = await branchModel.findById(branchReturn);

        if (!branchReceiveExists) {
            return res.status(404).json({
                success: false,
                message: 'Chi nhánh nhận xe không tồn tại'
            });
        }

        if (!branchReturnExists) {
            return res.status(404).json({
                success: false,
                message: 'Chi nhánh trả xe không tồn tại'
            });
        }

        // Validate motorbikes availability
        for (const motorbikeId of motorbikes) {
            const motorbike = await motorbikeModel.findById(motorbikeId);
            if (!motorbike) {
                return res.status(404).json({
                    success: false,
                    message: `Xe máy với ID ${motorbikeId} không tồn tại`
                });
            }

            if (motorbike.status !== 'available') {
                return res.status(400).json({
                    success: false,
                    message: `Xe máy ${motorbike.licensePlate} không khả dụng`
                });
            }
        }

        // Validate motorbike details
        for (const detail of motorbikeDetails) {
            const motorbikeType = await motorbikeTypeModel.findById(detail.motorbikeTypeId);
            if (!motorbikeType) {
                return res.status(404).json({
                    success: false,
                    message: `Loại xe máy với ID ${detail.motorbikeTypeId} không tồn tại`
                });
            }

            if (detail.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng xe phải lớn hơn 0'
                });
            }

            if (detail.unitPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Đơn giá không thể âm'
                });
            }
        }

        // Calculate total to validate grandTotal
        const calculatedTotal = motorbikeDetails.reduce((total, detail) => {
            return total + (detail.unitPrice * detail.quantity);
        }, 0);

        if (Math.abs(calculatedTotal - grandTotal) > 0.01) { // Allow small floating point differences
            return res.status(400).json({
                success: false,
                message: 'Tổng tiền không khớp với chi tiết đơn hàng'
            });
        }

        // Create rental order
        const newRentalOrder = new rentalOrderModel({
            customerId,
            branchReceive,
            branchReturn,
            receiveDate: receiveDateTime,
            returnDate: returnDateTime,
            evidenceImage,
            hasDamageWaiver,
            grandTotal,
            motorbikes
        });

        await newRentalOrder.save();

        // Create motorbike details
        const motorbikeDetailPromises = motorbikeDetails.map(detail => {
            return new rentalOrderMotorbikeDetailModel({
                rentalOrderId: newRentalOrder._id,
                motorbikeTypeId: detail.motorbikeTypeId,
                quantity: detail.quantity,
                unitPrice: detail.unitPrice
            }).save();
        });

        await Promise.all(motorbikeDetailPromises);

        // Update motorbike status to reserved
        const updateMotorbikePromises = motorbikes.map(motorbikeId => {
            return motorbikeModel.findByIdAndUpdate(motorbikeId, { status: 'reserved' });
        });

        await Promise.all(updateMotorbikePromises);

        // Populate references for response
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
        const { customerId } = req.params;
        const { status, page = 1, limit = 10 } = req.query;

        // Validate customer exists
        const customer = await customerModel.findById(customerId);
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
        const customer = await customerModel.findById(customerId);
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
