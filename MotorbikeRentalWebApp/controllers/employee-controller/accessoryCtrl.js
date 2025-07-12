const accessoryModel = require('../../models/accessoryModels');

// Create accessory controller
const createAccessory = async (req, res) => {
    try {
        console.log('Creating accessory:', req.body);
        const { name, price, quantity, image, description } = req.body;

        // Validate required fields
        if (name === undefined || name === null || name === '' ||
            price === undefined || price === null ||
            quantity === undefined || quantity === null ||
            image === undefined || image === null || image === '') {
            return res.status(400).json({
                success: false,
                message: 'Tất cả các trường là bắt buộc',
                missingFields: {
                    name: !name?.trim(),
                    price: price === undefined || price === null,
                    quantity: quantity === undefined || quantity === null,
                    image: !image?.trim()
                }
            });
        }

        // Validate price
        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá không thể âm'
            });
        }

        // Validate quantity
        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không thể âm'
            });
        }

        // Check if accessory with same name already exists
        const existingAccessory = await accessoryModel.findOne({ name });
        if (existingAccessory) {
            return res.status(400).json({
                success: false,
                message: 'Phụ kiện với tên này đã tồn tại trong hệ thống'
            });
        }

        // Create new accessory
        const newAccessory = new accessoryModel({
            name,
            price,
            quantity,
            image,
            description
        });

        await newAccessory.save();

        res.status(201).json({
            success: true,
            message: 'Tạo phụ kiện thành công',
            accessory: newAccessory
        });

    } catch (error) {
        console.error('Error creating accessory:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get all accessories controller
const getAllAccessories = async (req, res) => {
    try {
        const accessories = await accessoryModel.find({}).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách phụ kiện thành công',
            accessories
        });

    } catch (error) {
        console.error('Error getting accessories:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Get accessory by ID controller
const getAccessoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const accessory = await accessoryModel.findById(id);

        if (!accessory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ kiện'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy thông tin phụ kiện thành công',
            accessory
        });

    } catch (error) {
        console.error('Error getting accessory:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update accessory controller
const updateAccessory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, quantity, image } = req.body;

        // Check if accessory exists
        const existingAccessory = await accessoryModel.findById(id);
        if (!existingAccessory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ kiện'
            });
        }

        // Validate price if provided
        if (price !== undefined && price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Giá không thể âm'
            });
        }

        // Validate quantity if provided
        if (quantity !== undefined && quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không thể âm'
            });
        }

        // Check if name is being changed and if it already exists
        if (name && name !== existingAccessory.name) {
            const nameExists = await accessoryModel.findOne({ name });
            if (nameExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Phụ kiện với tên này đã tồn tại trong hệ thống'
                });
            }
        }

        // Update accessory
        const updatedAccessory = await accessoryModel.findByIdAndUpdate(
            id,
            {
                name,
                price,
                quantity,
                image
            },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật thông tin phụ kiện thành công',
            accessory: updatedAccessory
        });

    } catch (error) {
        console.error('Error updating accessory:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Delete accessory controller
const deleteAccessory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if accessory exists
        const existingAccessory = await accessoryModel.findById(id);
        if (!existingAccessory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ kiện'
            });
        }

        // Delete accessory
        await accessoryModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Xóa phụ kiện thành công'
        });

    } catch (error) {
        console.error('Error deleting accessory:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Search accessories by name controller
const searchAccessories = async (req, res) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Tên phụ kiện là bắt buộc để tìm kiếm'
            });
        }

        const accessories = await accessoryModel.find({
            name: { $regex: name, $options: 'i' }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: 'Tìm kiếm phụ kiện thành công',
            accessories
        });

    } catch (error) {
        console.error('Error searching accessories:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

// Update accessory quantity controller (for inventory management)
const updateAccessoryQuantity = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (quantity === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng là bắt buộc'
            });
        }

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Số lượng không thể âm'
            });
        }

        // Check if accessory exists
        const existingAccessory = await accessoryModel.findById(id);
        if (!existingAccessory) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy phụ kiện'
            });
        }

        // Update quantity
        const updatedAccessory = await accessoryModel.findByIdAndUpdate(
            id,
            { quantity },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Cập nhật số lượng phụ kiện thành công',
            accessory: updatedAccessory
        });

    } catch (error) {
        console.error('Error updating accessory quantity:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra, vui lòng thử lại',
            error: error.message
        });
    }
};

module.exports = {
    createAccessory,
    getAllAccessories,
    getAccessoryById,
    updateAccessory,
    deleteAccessory,
    searchAccessories,
    updateAccessoryQuantity
};

