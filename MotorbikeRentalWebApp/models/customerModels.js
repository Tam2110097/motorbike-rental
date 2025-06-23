const mongoose = require('mongoose');
const userModel = require('./userModels');

const customerSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Inherit from user schema
customerSchema.add(userModel.schema);

const customerModel = mongoose.model("customers", customerSchema);

module.exports = customerModel;
