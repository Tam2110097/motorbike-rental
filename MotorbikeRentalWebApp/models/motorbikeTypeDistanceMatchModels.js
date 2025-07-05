const mongoose = require('mongoose');

const motorbikeTypeDistanceMatchSchema = new mongoose.Schema({
    motorbikeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'motorbikeTypes',
        required: [true, 'motorbikeType is required']
    },
    distanceSuggestion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'distanceSuggestions',
        required: [true, 'distanceSuggestion is required']
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
motorbikeTypeDistanceMatchSchema.index({ motorbikeType: 1, distanceSuggestion: 1 }, { unique: true });

const motorbikeTypeDistanceMatchModel = mongoose.model("motorbikeTypeDistanceMatches", motorbikeTypeDistanceMatchSchema);

module.exports = motorbikeTypeDistanceMatchModel; 