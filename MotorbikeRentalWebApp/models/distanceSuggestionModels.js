const mongoose = require('mongoose');

const distanceSuggestionSchema = new mongoose.Schema({
    minKm: {
        type: Number,
        required: [true, 'minKm is required'],
        min: 0,
        default: 0
    },
    maxKm: {
        type: Number,
        required: [true, 'maxKm is required'],
        min: 0,
        default: 0
    },
    comment: {
        type: String,
        required: [true, 'comment is required'],
        trim: true
    }
}, {
    timestamps: true
});

const distanceSuggestionModel = mongoose.model("distanceSuggestions", distanceSuggestionSchema);

module.exports = distanceSuggestionModel; 