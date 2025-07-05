const distanceSuggestionModel = require('../../models/distanceSuggestionModels');

// Create distance suggestion controller
const createDistanceSuggestion = async (req, res) => {
    try {
        const { minKm, maxKm, comment } = req.body;

        // Validate required fields
        if (minKm === undefined || maxKm === undefined || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc',
                missingFields: {
                    minKm: minKm === undefined,
                    maxKm: maxKm === undefined,
                    comment: !comment
                }
            });
        }

        // Validate minKm and maxKm
        if (minKm < 0 || maxKm < 0) {
            return res.status(400).json({
                success: false,
                message: 'Số km không thể âm'
            });
        }
        if (minKm > maxKm) {
            return res.status(400).json({
                success: false,
                message: 'minKm phải nhỏ hơn hoặc bằng maxKm'
            });
        }

        // Check for overlapping ranges
        const overlap = await distanceSuggestionModel.findOne({
            $or: [
                { minKm: { $lte: maxKm }, maxKm: { $gte: minKm } }
            ]
        });
        if (overlap) {
            return res.status(400).json({
                success: false,
                message: 'Khoảng cách này đã tồn tại hoặc bị chồng lắp với một khoảng khác'
            });
        }

        // Create new distance suggestion
        const newDistanceSuggestion = new distanceSuggestionModel({
            minKm,
            maxKm,
            comment
        });

        await newDistanceSuggestion.save();

        res.status(201).json({
            success: true,
            message: 'Tạo gợi ý khoảng cách thành công',
            distanceSuggestion: newDistanceSuggestion
        });

    } catch (error) {
        console.error('Error creating distance suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get all distance suggestions controller
const getAllDistanceSuggestions = async (req, res) => {
    try {
        const distanceSuggestions = await distanceSuggestionModel.find({}).sort({ minKm: 1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách gợi ý khoảng cách thành công',
            distanceSuggestions
        });

    } catch (error) {
        console.error('Error getting distance suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get distance suggestion by ID controller
const getDistanceSuggestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const distanceSuggestion = await distanceSuggestionModel.findById(id);

        if (!distanceSuggestion) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy gợi ý khoảng cách'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin gợi ý khoảng cách thành công',
            distanceSuggestion
        });

    } catch (error) {
        console.error('Error getting distance suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update distance suggestion controller
const updateDistanceSuggestion = async (req, res) => {
    try {
        const { id } = req.params;
        const { minKm, maxKm, comment } = req.body;

        // Check if distance suggestion exists
        const existingDistanceSuggestion = await distanceSuggestionModel.findById(id);
        if (!existingDistanceSuggestion) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy gợi ý khoảng cách'
            });
        }

        // Validate minKm and maxKm
        if (minKm !== undefined && minKm < 0) {
            return res.status(400).json({
                success: false,
                message: 'minKm không thể âm'
            });
        }
        if (maxKm !== undefined && maxKm < 0) {
            return res.status(400).json({
                success: false,
                message: 'maxKm không thể âm'
            });
        }
        if (minKm !== undefined && maxKm !== undefined && minKm > maxKm) {
            return res.status(400).json({
                success: false,
                message: 'minKm phải nhỏ hơn hoặc bằng maxKm'
            });
        }

        // Check for overlapping ranges (excluding current)
        const overlap = await distanceSuggestionModel.findOne({
            _id: { $ne: id },
            $or: [
                { minKm: { $lte: maxKm }, maxKm: { $gte: minKm } }
            ]
        });
        if (overlap) {
            return res.status(400).json({
                success: false,
                message: 'Khoảng cách này đã tồn tại hoặc bị chồng lắp với một khoảng khác'
            });
        }

        // Update distance suggestion
        const updatedDistanceSuggestion = await distanceSuggestionModel.findByIdAndUpdate(
            id,
            {
                minKm,
                maxKm,
                comment
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật gợi ý khoảng cách thành công',
            distanceSuggestion: updatedDistanceSuggestion
        });

    } catch (error) {
        console.error('Error updating distance suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Delete distance suggestion controller
const deleteDistanceSuggestion = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if distance suggestion exists
        const existingDistanceSuggestion = await distanceSuggestionModel.findById(id);
        if (!existingDistanceSuggestion) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy gợi ý khoảng cách'
            });
        }

        // Delete distance suggestion
        await distanceSuggestionModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa gợi ý khoảng cách thành công'
        });

    } catch (error) {
        console.error('Error deleting distance suggestion:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

module.exports = {
    createDistanceSuggestion,
    getAllDistanceSuggestions,
    getDistanceSuggestionById,
    updateDistanceSuggestion,
    deleteDistanceSuggestion
}; 