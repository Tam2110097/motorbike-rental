const mongoose = require('mongoose');
const userModel = require('./userModels');

const adminSchema = new mongoose.Schema({
    lastLoginAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Inherit from user schema
adminSchema.add(userModel.schema);

const adminModel = mongoose.model("admins", adminSchema);

module.exports = adminModel;
