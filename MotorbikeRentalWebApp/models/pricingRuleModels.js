const mongoose = require('mongoose');

const pricingRuleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        unique: true,
        trim: true
    },
    sameBranchPrice: {
        type: Number,
        required: [true, 'sameBranchPrice is required'],
        min: [0, 'sameBranchPrice cannot be negative']
    },
    differentBranchPrice: {
        type: Number,
        required: [true, 'differentBranchPrice is required'],
        min: [0, 'differentBranchPrice cannot be negative']
    },
    discountDay: {
        type: Number,
        required: [true, 'discountDay is required'],
        min: [0, 'discountDay cannot be negative']
    },
    discountPercent: {
        type: Number,
        required: [true, 'discountPercent is required'],
        min: [0, 'discountPercent cannot be negative'],
        max: [100, 'discountPercent cannot be more than 100']
    }
}, {
    timestamps: true
});

const pricingRuleModel = mongoose.model('pricingRules', pricingRuleSchema);

module.exports = pricingRuleModel; 