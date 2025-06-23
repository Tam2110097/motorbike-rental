const mongoose = require('mongoose');

const accessoryDetailSchema = new mongoose.Schema({
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
    accessoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'accessories',
        required: [true, 'accessoryId is required']
    }
}, {
    timestamps: true
});

// Compound index to ensure unique combination of rentalOrder and accessory
accessoryDetailSchema.index({ rentalOrderId: 1, accessoryId: 1 }, { unique: true });

const accessoryDetailModel = mongoose.model("accessoryDetails", accessoryDetailSchema);

module.exports = accessoryDetailModel; 