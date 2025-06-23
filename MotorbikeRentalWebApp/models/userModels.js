const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'fullName is required']
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    phone: {
        type: String,
        required: [true, 'phone is required']
    },
    address: {
        type: String,
        required: [true, 'address is required']
    },
    userType: {
        type: String,
        enum: ['customer', 'admin', 'employee'],
        default: 'customer'
    }
}, {
    timestamps: true
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;