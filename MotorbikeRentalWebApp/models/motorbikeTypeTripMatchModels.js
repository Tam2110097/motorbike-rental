const mongoose = require('mongoose');

const motorbikeTypeTripMatchSchema = new mongoose.Schema({
    motorbikeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'motorbikeTypes',
        required: [true, 'motorbikeType is required']
    },
    tripPurpose: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tripPurposes',
        required: [true, 'tripPurpose is required']
    },
    score: {
        type: Number,
        required: [true, 'score is required'],
        min: 0,
        max: 10,
        default: 5
    }
}, {
    timestamps: true
});

// Create compound index to ensure unique combinations
motorbikeTypeTripMatchSchema.index({ motorbikeType: 1, tripPurpose: 1 }, { unique: true });

const motorbikeTypeTripMatchModel = mongoose.model("motorbikeTypeTripMatches", motorbikeTypeTripMatchSchema);

module.exports = motorbikeTypeTripMatchModel; 