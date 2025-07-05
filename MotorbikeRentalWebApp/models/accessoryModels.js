const mongoose = require('mongoose');

const accessorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required']
    },
    price: {
        type: Number,
        required: [true, 'price is required'],
        min: [0, 'price cannot be negative']
    },
    quantity: {
        type: Number,
        required: [true, 'quantity is required'],
        min: [0, 'quantity cannot be negative'],
        default: 0
    },
    image: {
        type: String,
        required: [true, 'image is required']
    },
    description: {
        type: String,
        required: false,
        default: ''
    },
}, {
    timestamps: true
});

const accessoryModel = mongoose.model("accessories", accessorySchema);

module.exports = accessoryModel;
