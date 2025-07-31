const motorbikeModel = require('../../models/motorbikeModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');
const branchModel = require('../../models/branchModels');
const { startSimulationForRentedMotorbike, stopSimulationForNonRentedMotorbike } = require('../../jobs/gpsSimulationJob');

// Create motorbike controller
const createMotorbike = async (req, res) => {
    try {
        console.log('Creating motorbike:', req.body);
        const { motorbikeType, branchId, licensePlateImage, status } = req.body;

        // Validate required fields
        if (!motorbikeType || !branchId || !licensePlateImage) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc',
                missingFields: {
                    motorbikeType: !motorbikeType,
                    branchId: !branchId,
                    licensePlateImage: !licensePlateImage,
                }
            });
        }

        // Check if motorbike type exists
        const existingMotorbikeType = await motorbikeTypeModel.findById(motorbikeType);
        if (!existingMotorbikeType) {
            return res.status(400).json({
                success: false,
                message: 'Loại xe không tồn tại trong hệ thống'
            });
        }

        // Check if branch exists
        const existingBranch = await branchModel.findById(branchId);
        if (!existingBranch) {
            return res.status(400).json({
                success: false,
                message: 'Chi nhánh không tồn tại trong hệ thống'
            });
        }

        // Create new motorbike
        const newMotorbike = new motorbikeModel({
            motorbikeType,
            branchId,
            licensePlateImage,
            status: status || 'available'
        });

        await newMotorbike.save();

        res.status(201).json({
            success: true,
            message: 'Tạo xe máy thành công',
            motorbike: newMotorbike
        });

    } catch (error) {
        console.error('Error creating motorbike:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get all motorbikes controller
const getAllMotorbikes = async (req, res) => {
    try {
        const motorbikes = await motorbikeModel.find({})
            .populate('motorbikeType')
            .populate('branchId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe máy thành công',
            motorbikes
        });

    } catch (error) {
        console.error('Error getting motorbikes:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get motorbike by ID controller
const getMotorbikeById = async (req, res) => {
    try {
        const { id } = req.params;
        const motorbike = await motorbikeModel.findById(id)
            .populate('motorbikeType')
            .populate('branchId');

        if (!motorbike) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe máy'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin xe máy thành công',
            motorbike
        });

    } catch (error) {
        console.error('Error getting motorbike:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update motorbike controller
const updateMotorbike = async (req, res) => {
    try {
        const { id } = req.params;
        const { motorbikeType, branchId, licensePlateImage, status } = req.body;

        // Check if motorbike exists
        const existingMotorbike = await motorbikeModel.findById(id);
        if (!existingMotorbike) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe máy'
            });
        }

        // Check if motorbike type exists if being updated
        if (motorbikeType) {
            const existingMotorbikeType = await motorbikeTypeModel.findById(motorbikeType);
            if (!existingMotorbikeType) {
                return res.status(400).json({
                    success: false,
                    message: 'Loại xe không tồn tại trong hệ thống'
                });
            }
        }

        // Check if branch exists if being updated
        if (branchId) {
            const existingBranch = await branchModel.findById(branchId);
            if (!existingBranch) {
                return res.status(400).json({
                    success: false,
                    message: 'Chi nhánh không tồn tại trong hệ thống'
                });
            }
        }

        // Update motorbike
        const updatedMotorbike = await motorbikeModel.findByIdAndUpdate(
            id,
            {
                motorbikeType,
                branchId,
                licensePlateImage,
                status
            },
            { new: true }
        ).populate('motorbikeType').populate('branchId');

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin xe máy thành công',
            motorbike: updatedMotorbike
        });

    } catch (error) {
        console.error('Error updating motorbike:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Delete motorbike controller
const deleteMotorbike = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if motorbike exists
        const existingMotorbike = await motorbikeModel.findById(id);
        if (!existingMotorbike) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe máy'
            });
        }

        // Check if motorbike is currently rented
        if (existingMotorbike.status === 'rented') {
            return res.status(400).json({
                success: false,
                message: 'Không thể xóa xe máy đang được thuê'
            });
        }

        // Delete motorbike
        await motorbikeModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa xe máy thành công'
        });

    } catch (error) {
        console.error('Error deleting motorbike:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get motorbikes by type controller
const getMotorbikesByType = async (req, res) => {
    try {
        const { motorbikeTypeId } = req.params;

        // Check if motorbike type exists
        const existingMotorbikeType = await motorbikeTypeModel.findById(motorbikeTypeId);
        if (!existingMotorbikeType) {
            return res.status(404).json({
                success: false,
                message: 'Loại xe không tồn tại'
            });
        }

        const motorbikes = await motorbikeModel.find({ motorbikeType: motorbikeTypeId })
            .populate('motorbikeType')
            .populate('branchId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe máy theo loại thành công',
            motorbikes
        });

    } catch (error) {
        console.error('Error getting motorbikes by type:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get available motorbikes controller
const getAvailableMotorbikes = async (req, res) => {
    try {
        const motorbikes = await motorbikeModel.find({ status: 'available' })
            .populate('motorbikeType')
            .populate('branchId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe máy có sẵn thành công',
            motorbikes
        });

    } catch (error) {
        console.error('Error getting available motorbikes:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get motorbikes by branch controller
const getMotorbikesByBranch = async (req, res) => {
    try {
        const { branchId } = req.params;

        // Check if branch exists
        const existingBranch = await branchModel.findById(branchId);
        if (!existingBranch) {
            return res.status(404).json({
                success: false,
                message: 'Chi nhánh không tồn tại'
            });
        }

        const motorbikes = await motorbikeModel.find({ branchId })
            .populate('motorbikeType')
            .populate('branchId')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách xe máy theo chi nhánh thành công',
            motorbikes
        });

    } catch (error) {
        console.error('Error getting motorbikes by branch:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update motorbike status controller
const updateMotorbikeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái là bắt buộc'
            });
        }

        const validStatuses = ['available', 'rented', 'maintenance', 'out_of_service', 'reserved'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Trạng thái không hợp lệ'
            });
        }

        // Check if motorbike exists
        const existingMotorbike = await motorbikeModel.findById(id);
        if (!existingMotorbike) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe máy'
            });
        }

        // Update status
        const updatedMotorbike = await motorbikeModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('motorbikeType').populate('branchId');

        // Handle GPS simulation based on status change
        if (status === 'rented') {
            // Start GPS simulation for newly rented motorbike
            await startSimulationForRentedMotorbike(id);
        } else if (existingMotorbike.status === 'rented' && status !== 'rented') {
            // Stop GPS simulation for motorbike that's no longer rented
            await stopSimulationForNonRentedMotorbike(id);
        }

        res.status(200).json({
            success: true,
            message: 'Cập nhật trạng thái xe máy thành công',
            motorbike: updatedMotorbike
        });

    } catch (error) {
        console.error('Error updating motorbike status:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

module.exports = {
    createMotorbike,
    getAllMotorbikes,
    getMotorbikeById,
    updateMotorbike,
    deleteMotorbike,
    getMotorbikesByType,
    getAvailableMotorbikes,
    getMotorbikesByBranch,
    updateMotorbikeStatus
};
