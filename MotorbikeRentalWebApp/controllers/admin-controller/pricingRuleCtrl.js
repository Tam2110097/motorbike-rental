const pricingRuleModel = require('../../models/pricingRuleModels');

// Create Pricing Rule
const createPricingRule = async (req, res) => {
    try {
        const newRule = new pricingRuleModel(req.body);
        await newRule.save();
        res.status(201).json({ success: true, message: 'Pricing rule created successfully', pricingRule: newRule });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All Pricing Rules
const getAllPricingRules = async (req, res) => {
    try {
        const rules = await pricingRuleModel.find();
        res.status(200).json({ success: true, pricingRules: rules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Pricing Rule By ID
const getPricingRuleById = async (req, res) => {
    try {
        const rule = await pricingRuleModel.findById(req.params.id);
        if (!rule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
        res.status(200).json({ success: true, pricingRule: rule });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Pricing Rule
const updatePricingRule = async (req, res) => {
    try {
        const updatedRule = await pricingRuleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedRule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
        res.status(200).json({ success: true, message: 'Pricing rule updated', pricingRule: updatedRule });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Pricing Rule
const deletePricingRule = async (req, res) => {
    try {
        const deletedRule = await pricingRuleModel.findByIdAndDelete(req.params.id);
        if (!deletedRule) return res.status(404).json({ success: false, message: 'Pricing rule not found' });
        res.status(200).json({ success: true, message: 'Pricing rule deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createPricingRule,
    getAllPricingRules,
    getPricingRuleById,
    updatePricingRule,
    deletePricingRule
};
