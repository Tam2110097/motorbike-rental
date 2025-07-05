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
        const types = await motorbikeTypeModel.find().populate('pricingRule');
        res.status(200).json({ success: true, motorbikeTypes: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Motorbike Type By ID
const getMotorbikeTypeById = async (req, res) => {
    try {
        const type = await motorbikeTypeModel.findById(req.params.id).populate('pricingRule');
        if (!type) return res.status(404).json({ success: false, message: 'Motorbike type not found' });
        res.status(200).json({ success: true, motorbikeType: type });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Motorbike Type
const updateMotorbikeType = async (req, res) => {
    try {
        const updatedType = await motorbikeTypeModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedType) return res.status(404).json({ success: false, message: 'Motorbike type not found' });
        res.status(200).json({ success: true, message: 'Motorbike type updated', motorbikeType: updatedType });
    } catch (error) {
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
    getMotorbikeTypesWithoutSpec
}; 