const motorbikeModel = require('../../models/motorbikeModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');

// Create motorbike controller
const createMotorbike = async (req, res) => {
    try {
        const { licensePlate, motorbikeType, fuelEfficiency } = req.body;

        // Validate required fields
        if (!licensePlate || !motorbikeType || !fuelEfficiency) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc',
                missingFields: {
                    licensePlate: !licensePlate,
                    motorbikeType: !motorbikeType,
                    fuelEfficiency: !fuelEfficiency
                }
            });
        }

        // Validate fuel efficiency
        if (fuelEfficiency < 0) {
            return res.status(400).json({
                success: false,
                message: 'Hiệu suất nhiên liệu không thể âm'
            });
        }

        // Check if motorbike type exists
        const existingMotorbikeType = await motorbikeTypeModel.findById(motorbikeType);
        if (!existingMotorbikeType) {
            return res.status(400).json({
                success: false,
                message: 'Loại xe máy không tồn tại'
            });
        }

        // Check if license plate already exists
        const existingMotorbike = await motorbikeModel.findOne({ licensePlate });
        if (existingMotorbike) {
            return res.status(400).json({
                success: false,
                message: 'Biển số xe đã tồn tại trong hệ thống'
            });
        }

        // Create new motorbike
        const newMotorbike = new motorbikeModel({
            licensePlate,
            motorbikeType,
            fuelEfficiency
        });

        await newMotorbike.save();

        // Populate motorbike type for response
        await newMotorbike.populate('motorbikeType');

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
        const motorbikes = await motorbikeModel.find({}).populate('motorbikeType');

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
        const motorbike = await motorbikeModel.findById(id).populate('motorbikeType');

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
        const { licensePlate, motorbikeType, fuelEfficiency, status } = req.body;

        // Check if motorbike exists
        const existingMotorbike = await motorbikeModel.findById(id);
        if (!existingMotorbike) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy xe máy'
            });
        }

        // Check if license plate is being changed and if it already exists
        if (licensePlate && licensePlate !== existingMotorbike.licensePlate) {
            const licensePlateExists = await motorbikeModel.findOne({ licensePlate });
            if (licensePlateExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Biển số xe đã tồn tại trong hệ thống'
                });
            }
        }

        // Check if motorbike type exists (if being updated)
        if (motorbikeType) {
            const motorbikeTypeExists = await motorbikeTypeModel.findById(motorbikeType);
            if (!motorbikeTypeExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Loại xe máy không tồn tại'
                });
            }
        }

        // Validate fuel efficiency
        if (fuelEfficiency !== undefined && fuelEfficiency < 0) {
            return res.status(400).json({
                success: false,
                message: 'Hiệu suất nhiên liệu không thể âm'
            });
        }

        // Update motorbike
        const updatedMotorbike = await motorbikeModel.findByIdAndUpdate(
            id,
            {
                licensePlate,
                motorbikeType,
                fuelEfficiency,
                status
            },
            { new: true }
        ).populate('motorbikeType');

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
        const motorbikes = await motorbikeModel.find({ motorbikeType: motorbikeTypeId }).populate('motorbikeType');

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
        const motorbikes = await motorbikeModel.find({ status: 'available' }).populate('motorbikeType');

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

module.exports = {
    createMotorbike,
    getAllMotorbikes,
    getMotorbikeById,
    updateMotorbike,
    deleteMotorbike,
    getMotorbikesByType,
    getAvailableMotorbikes
}; 