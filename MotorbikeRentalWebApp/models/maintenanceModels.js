const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
    motorbikeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'motorbikes',
        required: true,
    },
    rentalOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rentalOrders',
    },
    level: {
        type: String,
        enum: ['normal', 'light', 'medium', 'heavy'],
        required: true,
    },
    description: {
        type: String,
    },
    descriptionImage: {
        type: String,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    estimatedEndDate: {
        type: Date,
    },
    actualEndDate: {
        type: Date,
    },
    feeIfNoInsurance: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed'],
        default: 'in_progress',
    }
});

module.exports = mongoose.model('maintenances', maintenanceSchema);