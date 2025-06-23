const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    city: {
        type: String,
        required: [true, 'city is required']
    },
    address: {
        type: String,
        required: [true, 'address is required']
    },
    phone: {
        type: String,
        required: [true, 'phone is required']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const branchModel = mongoose.model("branches", branchSchema);

module.exports = branchModel;
