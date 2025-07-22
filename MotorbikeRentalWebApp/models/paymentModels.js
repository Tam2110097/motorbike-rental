const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    paymentType: {
        type: String,
        enum: ['preDeposit', 'remainingPayment', 'other'],
        required: [true, 'paymentType is required']
    },
    amount: {
        type: Number,
        required: [true, 'amount is required'],
        min: [0, 'amount cannot be negative']
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer'],
        required: [true, 'paymentMethod is required']
    },
    paymentDate: {
        type: Date,
        required: [true, 'paymentDate is required'],
        default: Date.now
    },
    transactionCode: {
        type: String,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending'
    },
    note: {
        type: String,
        trim: true
    },
    // Relationships
    rentalOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rentalOrders',
        required: [true, 'rentalOrderId is required']
    },
}, {
    timestamps: true
});

// Pre-save middleware to generate transactionCode automatically
paymentSchema.pre('save', async function (next) {
    if (!this.transactionCode) {
        try {
            const now = new Date();
            const dateStr = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0');

            // Find the highest existing transaction code for today
            const todayPrefix = `TXN${dateStr}-`;
            const highestPayment = await this.constructor.findOne({
                transactionCode: { $regex: `^${todayPrefix}` }
            }).sort({ transactionCode: -1 });

            let nextNumber = 1;
            if (highestPayment && highestPayment.transactionCode) {
                // Extract the number from the highest transaction code (e.g., "TXN20240618-001" -> "001" -> 1)
                const numberPart = highestPayment.transactionCode.split('-')[1];
                nextNumber = parseInt(numberPart) + 1;
            }

            // Generate the new transaction code with date and sequential number (e.g., TXN20240618-001)
            this.transactionCode = `${todayPrefix}${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const paymentModel = mongoose.model("payments", paymentSchema);

module.exports = paymentModel; 