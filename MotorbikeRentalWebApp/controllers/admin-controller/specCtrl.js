const SpecModel = require('../../models/motorbikeTypeSpecificationModels');
const MotorbikeType = require('../../models/motorbikeTypeModels');
const motorbikeTypeModel = require('../../models/motorbikeTypeModels');

// CREATE
const createSpec = async (req, res) => {
    try {
        const { motorbikeType, transmission, gears, engineSize, seatHeight, weight, horsePower, tankSize } = req.body;
        // Ensure motorbikeType exists
        const type = await MotorbikeType.findById(motorbikeType);
        if (!type) return res.status(400).json({ success: false, message: 'Motorbike type not found' });
        // Create
        const spec = await SpecModel.create({ motorbikeType, transmission, gears, engineSize, seatHeight, weight, horsePower, tankSize });
        res.status(201).json({ success: true, data: spec });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// READ (get by id)
const getSpecById = async (req, res) => {
    try {
        const { id } = req.params;
        const spec = await SpecModel.findById(id).populate('motorbikeType');
        if (!spec) return res.status(404).json({ success: false, message: 'Spec not found' });
        res.status(200).json({ success: true, data: spec });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// LIST (all)
const getAllSpecs = async (req, res) => {
    try {
        const specs = await SpecModel.find().populate('motorbikeType');
        res.status(200).json({ success: true, data: specs });
    } catch (error) {
        console.error('Lỗi khi lấy thông số kỹ thuật:', error); // log chi tiết
        res.status(500).json({ success: false, message: error.message });
    }
};

// UPDATE
const updateSpec = async (req, res) => {
    try {
        const { id } = req.params;
        const { motorbikeType, transmission, gears, engineSize, seatHeight, weight, horsePower, tankSize } = req.body;
        // Ensure motorbikeType exists
        const type = await MotorbikeType.findById(motorbikeType);
        if (!type) return res.status(400).json({ success: false, message: 'Motorbike type not found' });
        const spec = await SpecModel.findByIdAndUpdate(
            id,
            { motorbikeType, transmission, gears, engineSize, seatHeight, weight, horsePower, tankSize },
            { new: true, runValidators: true }
        );
        if (!spec) return res.status(404).json({ success: false, message: 'Spec not found' });
        res.status(200).json({ success: true, data: spec });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE
const deleteSpec = async (req, res) => {
    try {
        const { id } = req.params;
        const spec = await SpecModel.findByIdAndDelete(id);
        if (!spec) return res.status(404).json({ success: false, message: 'Spec not found' });
        res.status(200).json({ success: true, message: 'Spec deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET BY MOTORBIKETYPE
const getSpecByMotorbikeType = async (req, res) => {
    try {
        const { motorbikeTypeId } = req.params;
        const spec = await SpecModel.findOne({ motorbikeType: motorbikeTypeId }).populate('motorbikeType');
        if (!spec) return res.status(404).json({ success: false, message: 'Spec not found' });
        res.status(200).json({ success: true, data: spec });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createSpec,
    getSpecById,
    getAllSpecs,
    updateSpec,
    deleteSpec,
    getSpecByMotorbikeType
}
