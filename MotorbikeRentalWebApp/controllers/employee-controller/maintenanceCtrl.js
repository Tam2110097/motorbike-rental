const maintenanceModel = require('../../models/maintenanceModels');
const rentalOrderModel = require('../../models/rentalOrderModels');
const motorbikeModel = require('../../models/motorbikeModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');
const dayjs = require('dayjs');
const fs = require('fs');
const path = require('path');

// Maintenance level configurations
const MAINTENANCE_LEVELS = {
    normal: {
        name: 'Bảo dưỡng thường',
        duration: 1, // days
        feePercentage: 0, // 0% of vehicle value
        description: 'Bảo dưỡng định kỳ, thay dầu, kiểm tra tổng thể'
    },
    light: {
        name: 'Bảo dưỡng nhẹ',
        duration: 2, // days
        feePercentage: 5, // 5% of vehicle value
        description: 'Thay phụ tùng nhỏ, điều chỉnh hệ thống'
    },
    medium: {
        name: 'Bảo dưỡng trung bình',
        duration: 5, // days
        feePercentage: 15, // 15% of vehicle value
        description: 'Thay phụ tùng chính, sửa chữa hệ thống'
    },
    heavy: {
        name: 'Bảo dưỡng nặng',
        duration: 10, // days
        feePercentage: 30, // 30% of vehicle value
        description: 'Đại tu, thay động cơ hoặc phụ tùng lớn'
    }
};

// Get maintenance levels configuration
const getMaintenanceLevels = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách cấp độ bảo dưỡng thành công',
            maintenanceLevels: MAINTENANCE_LEVELS
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách cấp độ bảo dưỡng',
            error: error.message
        });
    }
};

// Get motorbikes from completed order for maintenance selection
const getOrderMotorbikesForMaintenance = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await rentalOrderModel.findById(orderId)
            .populate('motorbikes.motorbikeTypeId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (order.status !== 'active' && order.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể bảo dưỡng xe từ đơn hàng đang hoạt động hoặc đã hoàn thành'
            });
        }

        // Get motorbike types with pricing information
        const motorbikesWithDetails = await Promise.all(order.motorbikes.map(async (mb) => {
            const motorbike = await motorbikeModel.findById(mb.motorbikeId);
            const motorbikeType = await motorbikeTypeModel.findById(mb.motorbikeTypeId)
                .populate('pricingRule');

            return {
                motorbikeId: mb.motorbikeId.toString(),
                motorbikeTypeId: mb.motorbikeTypeId,
                quantity: mb.quantity,
                code: motorbike.code,
                motorbikeTypeName: motorbikeType.name,
                vehicleValue: motorbikeType.price || 0, // Use price as vehicle value
                hasDamageWaiver: mb.hasDamageWaiver || false, // Include damage waiver status
                maintenanceLevels: Object.keys(MAINTENANCE_LEVELS).map(level => ({
                    level,
                    ...MAINTENANCE_LEVELS[level],
                    estimatedFee: Math.round((motorbikeType.price || 0) * MAINTENANCE_LEVELS[level].feePercentage / 100)
                }))
            };
        }));

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe để bảo dưỡng thành công',
            order: {
                orderCode: order.orderCode,
                checkOutDate: order.checkOutDate || null
            },
            motorbikes: motorbikesWithDetails
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách xe để bảo dưỡng',
            error: error.message
        });
    }
};

// Create maintenance records for motorbikes
const createMaintenanceForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        let maintenanceSelections;

        console.log('=== MAINTENANCE CREATE REQUEST ===');
        console.log('Order ID:', orderId);
        console.log('Request body:', req.body);
        console.log('Request files:', req.files ? req.files.map(f => f.originalname) : 'No files');

        // Handle both JSON and FormData
        if (req.body.maintenanceSelections) {
            maintenanceSelections = typeof req.body.maintenanceSelections === 'string'
                ? JSON.parse(req.body.maintenanceSelections)
                : req.body.maintenanceSelections;
        } else {
            maintenanceSelections = req.body;
        }

        console.log('Parsed maintenance selections:', maintenanceSelections);

        const order = await rentalOrderModel.findById(orderId);
        if (!order) {
            console.log('Order not found:', orderId);
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        console.log('Order status:', order.status);
        if (order.status !== 'active' && order.status !== 'completed') {
            console.log('Invalid order status for maintenance:', order.status);
            return res.status(400).json({
                success: false,
                message: 'Chỉ có thể bảo dưỡng xe từ đơn hàng đang hoạt động hoặc đã hoàn thành'
            });
        }

        // Validate maintenance selections
        console.log('Validating maintenance selections:', maintenanceSelections);
        if (!Array.isArray(maintenanceSelections) || maintenanceSelections.length === 0) {
            console.log('Invalid maintenance selections - empty or not array');
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ít nhất một xe để bảo dưỡng'
            });
        }

        let totalMaintenanceFee = 0;
        let additionalFeeToAdd = 0;
        const maintenanceRecords = [];

        // Process each maintenance selection
        for (const selection of maintenanceSelections) {
            const { motorbikeId, level, description } = selection;
            console.log('Processing selection:', { motorbikeId, level, description });

            if (!MAINTENANCE_LEVELS[level]) {
                console.log('Invalid maintenance level:', level);
                return res.status(400).json({
                    success: false,
                    message: `Cấp độ bảo dưỡng '${level}' không hợp lệ`
                });
            }

            // Get motorbike and its type
            const motorbike = await motorbikeModel.findById(motorbikeId)
                .populate('motorbikeType');

            if (!motorbike) {
                console.log('Motorbike not found:', motorbikeId);
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy xe với ID: ${motorbikeId}`
                });
            }

            const motorbikeType = await motorbikeTypeModel.findById(motorbike.motorbikeType);
            const vehicleValue = motorbikeType.price || 0;
            const maintenanceFee = Math.round(vehicleValue * MAINTENANCE_LEVELS[level].feePercentage / 100);
            const duration = MAINTENANCE_LEVELS[level].duration;

            totalMaintenanceFee += maintenanceFee;

            // Check if this motorbike has damage waiver in the order
            const orderMotorbike = order.motorbikes.find(mb => mb.motorbikeId.toString() === motorbikeId);
            const hasDamageWaiver = orderMotorbike ? orderMotorbike.hasDamageWaiver : false;

            // Only add to additionalFee if customer didn't choose damage waiver
            if (!hasDamageWaiver) {
                additionalFeeToAdd += maintenanceFee;
            }

            // Handle image upload if present
            let descriptionImage = null;
            if (req.files && req.files.length > 0) {
                const imageIndexes = req.body.imageIndexes ?
                    (Array.isArray(req.body.imageIndexes) ? req.body.imageIndexes : [req.body.imageIndexes]) : [];

                console.log('Image indexes received:', imageIndexes);
                console.log('Files received:', req.files.map(f => f.originalname));

                const currentIndex = maintenanceSelections.findIndex(s => s.motorbikeId === motorbikeId);
                console.log(`Current index for motorbike ${motorbikeId}:`, currentIndex);

                // Find the image file for this specific motorbike
                const imageIndex = imageIndexes.indexOf(currentIndex.toString());
                if (imageIndex !== -1 && req.files[imageIndex]) {
                    const imageFile = req.files[imageIndex];
                    console.log(`Found image file for motorbike ${motorbikeId}:`, imageFile.originalname);
                    console.log('Image file object:', imageFile);

                    // Since we're using diskStorage, the file is already saved
                    // We just need to use the filename that multer generated
                    descriptionImage = imageFile.filename;
                    console.log(`Using saved image: ${descriptionImage}`);
                } else {
                    console.log(`No image found for motorbike ${motorbikeId} at index ${currentIndex}`);
                }
            }

            // Create maintenance record
            const maintenance = await maintenanceModel.create({
                motorbikeId,
                rentalOrderId: orderId,
                level,
                description: description || MAINTENANCE_LEVELS[level].description,
                descriptionImage,
                startDate: new Date(),
                estimatedEndDate: dayjs().add(duration, 'day').toDate(),
                feeIfNoInsurance: maintenanceFee,
                status: 'in_progress'
            });

            maintenanceRecords.push(maintenance);

            // Update motorbike status to maintenance
            await motorbikeModel.findByIdAndUpdate(motorbikeId, {
                status: 'maintenance'
            });
        }

        // Update rental order with maintenance fee only if no damage waiver
        if (additionalFeeToAdd > 0) {
            order.additionalFee = (order.additionalFee || 0) + additionalFeeToAdd;
            await order.save();
        }

        res.status(201).json({
            success: true,
            message: 'Tạo bảo dưỡng thành công',
            maintenanceRecords: maintenanceRecords.map(record => ({
                id: record._id,
                motorbikeId: record.motorbikeId,
                level: record.level,
                description: record.description,
                estimatedEndDate: record.estimatedEndDate,
                fee: record.feeIfNoInsurance
            })),
            totalMaintenanceFee,
            additionalFeeAdded: additionalFeeToAdd,
            updatedOrderFee: order.additionalFee,
            damageWaiverApplied: additionalFeeToAdd < totalMaintenanceFee
        });
    } catch (error) {
        console.error('=== MAINTENANCE CREATE ERROR ===');
        console.error('Error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo bảo dưỡng',
            error: error.message
        });
    }
};

// Get all maintenance records
const getAllMaintenance = async (req, res) => {
    try {
        const maintenanceRecords = await maintenanceModel.find()
            .populate('motorbikeId')
            .populate('rentalOrderId')
            .sort({ startDate: -1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách bảo dưỡng thành công',
            maintenanceRecords
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách bảo dưỡng',
            error: error.message
        });
    }
};

// Schedule maintenance for motorbikes (direct scheduling)
const scheduleMaintenance = async (req, res) => {
    try {
        const { motorbikeIds, level, description, startDate, estimatedEndDate, feeIfNoInsurance } = req.body;

        console.log('=== SCHEDULE MAINTENANCE REQUEST ===');
        console.log('Request body:', req.body);

        // Validate required fields
        if (!motorbikeIds || !Array.isArray(motorbikeIds) || motorbikeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ít nhất một xe máy'
            });
        }

        if (!level || !MAINTENANCE_LEVELS[level]) {
            return res.status(400).json({
                success: false,
                message: 'Cấp độ bảo dưỡng không hợp lệ'
            });
        }

        if (!description) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập mô tả bảo dưỡng'
            });
        }

        if (!startDate || !estimatedEndDate) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng chọn ngày bắt đầu và dự kiến hoàn thành'
            });
        }

        const maintenanceRecords = [];

        // Process each motorbike
        for (const motorbikeId of motorbikeIds) {
            // Check if motorbike exists and is available for maintenance
            const motorbike = await motorbikeModel.findById(motorbikeId);
            if (!motorbike) {
                return res.status(404).json({
                    success: false,
                    message: `Không tìm thấy xe máy với ID: ${motorbikeId}`
                });
            }

            if (motorbike.status === 'maintenance' || motorbike.status === 'out_of_service') {
                return res.status(400).json({
                    success: false,
                    message: `Xe máy ${motorbike.code} đã trong trạng thái bảo dưỡng hoặc hỏng`
                });
            }

            // Get motorbike type for fee calculation
            const motorbikeType = await motorbikeTypeModel.findById(motorbike.motorbikeType);
            const vehicleValue = motorbikeType?.price || 0;
            const calculatedFee = Math.round(vehicleValue * MAINTENANCE_LEVELS[level].feePercentage / 100);
            const finalFee = feeIfNoInsurance || calculatedFee;

            // Create maintenance record
            const maintenance = await maintenanceModel.create({
                motorbikeId,
                level,
                description,
                startDate: new Date(startDate),
                estimatedEndDate: new Date(estimatedEndDate),
                feeIfNoInsurance: finalFee,
                status: 'in_progress'
            });

            maintenanceRecords.push(maintenance);

            // Update motorbike status to maintenance
            await motorbikeModel.findByIdAndUpdate(motorbikeId, {
                status: 'maintenance'
            });

            console.log(`Created maintenance for motorbike ${motorbike.code}:`, maintenance._id);
        }

        res.status(201).json({
            success: true,
            message: 'Lên lịch bảo dưỡng thành công',
            maintenanceRecords: maintenanceRecords.map(record => ({
                id: record._id,
                motorbikeId: record.motorbikeId,
                level: record.level,
                description: record.description,
                startDate: record.startDate,
                estimatedEndDate: record.estimatedEndDate,
                fee: record.feeIfNoInsurance
            })),
            totalScheduled: maintenanceRecords.length
        });
    } catch (error) {
        console.error('=== SCHEDULE MAINTENANCE ERROR ===');
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lên lịch bảo dưỡng',
            error: error.message
        });
    }
};

// Complete maintenance
const completeMaintenance = async (req, res) => {
    try {
        const { maintenanceId } = req.params;

        const maintenance = await maintenanceModel.findById(maintenanceId);
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy bảo dưỡng'
            });
        }

        if (maintenance.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Bảo dưỡng đã hoàn thành'
            });
        }

        // Update maintenance status
        maintenance.status = 'completed';
        maintenance.actualEndDate = new Date();
        await maintenance.save();

        // Update motorbike status back to available
        await motorbikeModel.findByIdAndUpdate(maintenance.motorbikeId, {
            status: 'available'
        });

        res.status(200).json({
            success: true,
            message: 'Hoàn thành bảo dưỡng thành công',
            maintenance
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hoàn thành bảo dưỡng',
            error: error.message
        });
    }
};

module.exports = {
    getMaintenanceLevels,
    getOrderMotorbikesForMaintenance,
    createMaintenanceForOrder,
    getAllMaintenance,
    completeMaintenance,
    scheduleMaintenance
};
