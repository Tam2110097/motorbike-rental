const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'name is required'],
        unique: true,
        trim: true,
        enum: ['admin', 'employee', 'customer']
    }
}, {
    timestamps: true
});

const roleModel = mongoose.model("roles", roleSchema);

module.exports = roleModel; 