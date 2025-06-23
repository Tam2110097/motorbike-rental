const mongoose = require('mongoose');
const userModel = require('./userModels');

const employeeSchema = new mongoose.Schema({
    workAt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branches',
        required: [true, 'workAt branch is required']
    }
}, {
    timestamps: true
});

// Inherit from user schema
employeeSchema.add(userModel.schema);

const employeeModel = mongoose.model("employees", employeeSchema);

module.exports = employeeModel;
