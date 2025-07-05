const mongoose = require('mongoose');

const tripPurposeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'description is required'],
        trim: true
    }
}, {
    timestamps: true
});

const tripPurposeModel = mongoose.model("tripPurposes", tripPurposeSchema);

module.exports = tripPurposeModel; 