const mongoose = require('mongoose');

const rentalOrderMotorbikeDetailSchema = new mongoose.Schema({
    unitPrice: {
        type: Number,
        required: [true, 'unitPrice is required'],
        min: [0, 'unitPrice cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'quantity is required'],
        min: [1, 'quantity must be at least 1']
    },
    rentalOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rentalOrders',
        required: [true, 'rentalOrderId is required']
    },
    motorbikeTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'motorbikeTypes',
        required: [true, 'motorbikeTypeId is required']
    },
    damageWaiverFee: {
        type: Number,
        required: [false, 'damageWaiverFee is required'],
        min: [0, 'damageWaiverFee cannot be negative']
    },
    duration: {
        type: Number,
        required: [true, 'duration is required'],
        min: [1, 'duration must be at least 1']
    }
}, {
    timestamps: true
});

// Compound index to ensure unique combination of rentalOrder and motorbikeType
rentalOrderMotorbikeDetailSchema.index({ rentalOrderId: 1, motorbikeTypeId: 1 }, { unique: true });

const rentalOrderMotorbikeDetailModel = mongoose.model("rentalOrderMotorbikeDetails", rentalOrderMotorbikeDetailSchema);

module.exports = rentalOrderMotorbikeDetailModel; 