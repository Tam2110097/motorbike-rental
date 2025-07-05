const mongoose = require('mongoose');

const tripContextSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rentalOrders',
        required: true,
    },
    purpose: {
        type: String,
        enum: ['leisure', 'tour', 'work', 'delivery', 'other'],
        required: true,
    },
    distanceCategory: {
        type: String,
        enum: ['short', 'medium', 'long'],
        required: true,
    },
    numPeople: {
        type: Number,
        enum: [1, 2],
        required: true,
    },
    terrain: {
        type: String,
        enum: ['mountain', 'urban', 'mixed'],
        required: true,
    },
    luggage: {
        type: String,
        enum: ['heavy', 'light'],
        required: true,
    },
    preferredFeatures: [{
        type: String,
        enum: ['fuel-saving', 'easy-to-ride'],
    }],
}, { timestamps: true });

module.exports = mongoose.model('tripContexts', tripContextSchema);
