const motorbikeTypeModel = require('../../models/motorbikeTypeModels');
const SpecModel = require('../../models/motorbikeTypeSpecificationModels');

// Create Motorbike Type
const createMotorbikeType = async (req, res) => {
    try {

        const newType = new motorbikeTypeModel({ ...req.body });
        await newType.save();
        res.status(201).json({ success: true, message: 'Motorbike type created successfully', motorbikeType: newType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All Motorbike Types
const getAllMotorbikeTypes = async (req, res) => {
    try {
        const types = await motorbikeTypeModel.find()
            .populate('pricingRule')
            .populate('specifications');
        res.status(200).json({ success: true, motorbikeTypes: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Motorbike Type By ID
const getMotorbikeTypeById = async (req, res) => {
    try {
        const type = await motorbikeTypeModel
            .findById(req.params.id)
            .populate('pricingRule')
            .populate('specifications');

        if (!type) return res.status(404).json({ success: false, message: 'Motorbike type not found' });

        res.status(200).json({ success: true, motorbikeType: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Update Motorbike Type
const updateMotorbikeType = async (req, res) => {
    try {
        console.log('Update request body:', req.body); // Debug log

        // Xử lý URL ảnh - chuyển từ URL đầy đủ về đường dẫn tương đối
        let updateData = { ...req.body };
        if (updateData.image && updateData.image.startsWith('http://localhost:8080')) {
            updateData.image = updateData.image.replace('http://localhost:8080', '');
        }

        console.log('Processed update data:', updateData); // Debug log

        const updatedType = await motorbikeTypeModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('pricingRule').populate('specifications');

        if (!updatedType) return res.status(404).json({ success: false, message: 'Motorbike type not found' });

        console.log('Updated motorbike type:', updatedType); // Debug log
        res.status(200).json({ success: true, message: 'Motorbike type updated', motorbikeType: updatedType });
    } catch (error) {
        console.error('Error updating motorbike type:', error); // Debug log
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Motorbike Type
const deleteMotorbikeType = async (req, res) => {
    try {
        const deletedType = await motorbikeTypeModel.findByIdAndDelete(req.params.id);
        if (!deletedType) return res.status(404).json({ success: false, message: 'Motorbike type not found' });
        res.status(200).json({ success: true, message: 'Motorbike type deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getMotorbikeTypesWithoutSpec = async (req, res) => {
    try {
        // Lấy danh sách tất cả motorbikeTypeId đã có trong bảng Specification
        const specMotorbikeTypeIds = await SpecModel.find().distinct('motorbikeType');

        // Lấy những motorbikeType mà _id KHÔNG nằm trong danh sách trên
        const types = await motorbikeTypeModel.find({
            _id: { $nin: specMotorbikeTypeIds },
        });

        res.status(200).json({ success: true, motorbikeTypes: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createMotorbikeType,
    getAllMotorbikeTypes,
    getMotorbikeTypeById,
    updateMotorbikeType,
    deleteMotorbikeType,
    getMotorbikeTypesWithoutSpec,
}; 