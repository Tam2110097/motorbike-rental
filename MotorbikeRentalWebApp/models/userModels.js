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
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'roles',
        required: [true, 'role is required']
    }
}, {
    timestamps: true
});

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;