const tripPurposeModel = require('../../models/tripPurposeModels');

// Create trip purpose controller
const createTripPurpose = async (req, res) => {
    try {
        const { name, description } = req.body;

        // Validate required fields
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc',
                missingFields: {
                    name: !name,
                    description: !description
                }
            });
        }

        // Check if trip purpose already exists
        const existingTripPurpose = await tripPurposeModel.findOne({ name });
        if (existingTripPurpose) {
            return res.status(400).json({
                success: false,
                message: 'Mục đích chuyến đi đã tồn tại trong hệ thống'
            });
        }

        // Create new trip purpose
        const newTripPurpose = new tripPurposeModel({
            name,
            description
        });

        await newTripPurpose.save();

        res.status(201).json({
            success: true,
            message: 'Tạo mục đích chuyến đi thành công',
            tripPurpose: newTripPurpose
        });

    } catch (error) {
        console.error('Error creating trip purpose:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get all trip purposes controller
const getAllTripPurposes = async (req, res) => {
    try {
        const tripPurposes = await tripPurposeModel.find({});

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách mục đích chuyến đi thành công',
            tripPurposes
        });

    } catch (error) {
        console.error('Error getting trip purposes:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get trip purpose by ID controller
const getTripPurposeById = async (req, res) => {
    try {
        const { id } = req.params;
        const tripPurpose = await tripPurposeModel.findById(id);

        if (!tripPurpose) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục đích chuyến đi'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin mục đích chuyến đi thành công',
            tripPurpose
        });

    } catch (error) {
        console.error('Error getting trip purpose:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update trip purpose controller
const updateTripPurpose = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Check if trip purpose exists
        const existingTripPurpose = await tripPurposeModel.findById(id);
        if (!existingTripPurpose) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục đích chuyến đi'
            });
        }

        // Check if name is being changed and if it already exists
        if (name && name !== existingTripPurpose.name) {
            const nameExists = await tripPurposeModel.findOne({ name });
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên mục đích chuyến đi đã tồn tại trong hệ thống'
                });
            }
        }

        // Update trip purpose
        const updatedTripPurpose = await tripPurposeModel.findByIdAndUpdate(
            id,
            {
                name,
                description
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật mục đích chuyến đi thành công',
            tripPurpose: updatedTripPurpose
        });

    } catch (error) {
        console.error('Error updating trip purpose:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Delete trip purpose controller
const deleteTripPurpose = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if trip purpose exists
        const existingTripPurpose = await tripPurposeModel.findById(id);
        if (!existingTripPurpose) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy mục đích chuyến đi'
            });
        }

        // Delete trip purpose
        await tripPurposeModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa mục đích chuyến đi thành công'
        });

    } catch (error) {
        console.error('Error deleting trip purpose:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

module.exports = {
    createTripPurpose,
    getAllTripPurposes,
    getTripPurposeById,
    updateTripPurpose,
    deleteTripPurpose
}; 