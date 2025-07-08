const mongoose = require('mongoose');

const motorbikeTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    price: {
        type: Number,
        required: [true, 'price is required'],
        min: [0, 'price cannot be negative']
    },
    description: {
        type: String,
        required: [false, 'description is not required']
    },
    totalQuantity: {
        type: Number,
        required: [true, 'totalQuantity is required'],
        min: [0, 'totalQuantity cannot be negative'],
        default: 0
    },
    deposit: {
        type: Number,
        required: [true, 'deposit is required'],
        min: [0, 'deposit cannot be negative']
    },
    image: {
        type: String,
        required: [true, 'image is required']
    },
    prefixCode: {
        type: String,
        required: [true, 'prefixCode is required'],
        unique: true
    },
    preDeposit: {
        type: Number,
        required: [true, 'preDeposit is required'],
        min: [0, 'preDeposit cannot be negative'],
        validate: {
            validator: function (val) {
                return val <= this.deposit;
            },
            message: 'preDeposit must be less than or equal to deposit'
        }
    },
    dailyDamageWaiver: {
        type: Number,
        required: [true, 'dailyDamageWaiver is required'],
        min: [0, 'dailyDamageWaiver cannot be negative']
    },
    pricingRule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'pricingRules',
        required: [true, 'pricingRule is required'],
        index: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

motorbikeTypeSchema.virtual('specifications', {
    ref: 'motorbikeTypeSpecifications',
    localField: '_id',
    foreignField: 'motorbikeType',
    justOne: false
});

motorbikeTypeSchema.set('toObject', { virtuals: true });
motorbikeTypeSchema.set('toJSON', { virtuals: true });

const motorbikeTypeModel = mongoose.model("motorbikeTypes", motorbikeTypeSchema);

module.exports = motorbikeTypeModel; 