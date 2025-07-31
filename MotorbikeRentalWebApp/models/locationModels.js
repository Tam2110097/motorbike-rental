const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    motorbikeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'motorbikes',
        required: [true, 'Motorbike ID is required']
    },
    latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: -180,
        max: 180
    },
    speed: {
        type: Number,
        default: 0,
        min: 0
    },
    heading: {
        type: Number,
        default: 0,
        min: 0,
        max: 360
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
locationSchema.index({ motorbikeId: 1, timestamp: -1 });
locationSchema.index({ motorbikeId: 1, isActive: 1 });

const locationModel = mongoose.model("locations", locationSchema);

module.exports = locationModel; 