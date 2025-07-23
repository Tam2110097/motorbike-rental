const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: [true, 'amount is required'],
        min: [0, 'amount cannot be negative']
    },
    refundDate: {
        type: Date,
        required: [true, 'refundDate is required'],
        default: Date.now
    },
    reason: {
        type: String,
        required: [false, 'reason is required'],
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'completed', 'rejected'],
        default: 'pending'
    },
    // Relationships
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'payments',
        required: [true, 'paymentId is required']
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'processedBy is required']
    },
    invoiceImage: {
        type: String,
        required: [false, 'invoiceImage is required']
    }
}, {
    timestamps: true
});

const refundModel = mongoose.model("refunds", refundSchema);

module.exports = refundModel;