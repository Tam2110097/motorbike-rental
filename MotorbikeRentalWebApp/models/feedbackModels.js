const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    comment: {
        type: String,
        required: [true, 'comment is required'],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers'
    },
    rentalOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rentalOrders',
        required: [true, 'rentalOrderId is required']
    }
}, {
    timestamps: true
});

const feedbackModel = mongoose.model("feedbacks", feedbackSchema);

module.exports = feedbackModel; 