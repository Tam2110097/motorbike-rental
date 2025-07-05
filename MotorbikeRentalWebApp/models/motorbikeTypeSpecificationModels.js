const mongoose = require('mongoose');

const motorbikeTypeSpecificationSchema = new mongoose.Schema({
    motorbikeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'motorbikeTypes',
        required: true,
        unique: true
    },
    transmission: {
        type: String,
        required: true
    },
    gears: {
        type: String,
        required: true
    },
    engineSize: {
        type: String,
        required: true
    },
    seatHeight: {
        type: String,
        required: true
    },
    weight: {
        type: String,
        required: true
    },
    horsePower: {
        type: String,
        required: true
    },
    tankSize: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('motorbikeTypeSpecifications', motorbikeTypeSpecificationSchema);
