const mongoose = require('mongoose');

const orderDocumentSchema = new mongoose.Schema({
    rentalOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rentalOrders',
        required: true,
    },
    cccdImages: {
        type: [String],
        required: false,
    },
    driverLicenseImages: {
        type: [String],
        required: false,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
    isValid: {
        type: Boolean,
        default: false,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('orderDocuments', orderDocumentSchema);
