const mongoose = require('mongoose');

const rentalOrderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'customerId is required']
    },
    branchReceive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branches',
        required: [true, 'branchReceive is required']
    },
    branchReturn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branches',
        required: [true, 'branchReturn is required']
    },
    receiveDate: {
        type: Date,
        required: [true, 'receiveDate is required']
    },
    returnDate: {
        type: Date,
        required: [false, 'returnDate is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    preDepositTotal: {
        type: Number,
        default: 0
    },
    orderCode: {
        type: String,
        unique: true,
        trim: true
    },
    grandTotal: {
        type: Number,
        required: [true, 'grandTotal is required'],
        min: [0, 'grandTotal cannot be negative']
    },
    motorbikes: [{
        motorbikeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'motorbikes',
            required: true
        },
        motorbikeTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'motorbikeTypes',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        hasDamageWaiver: {
            type: Boolean,
            default: false
        },
        pricePerDay: Number,
        discountedPricePerDay: Number
    }],
    depositTotal: {
        type: Number,
        default: 0
    },
    isPaidFully: {
        type: Boolean,
        default: false
    },
    checkInDate: {
        type: Date,
        default: null
    },
    checkOutDate: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate orderCode automatically
rentalOrderSchema.pre('save', async function (next) {
    if (!this.orderCode) {
        try {
            const now = new Date();
            const dateStr = now.getFullYear().toString() +
                (now.getMonth() + 1).toString().padStart(2, '0') +
                now.getDate().toString().padStart(2, '0');

            // Find the highest existing order code for today
            const todayPrefix = `ORD${dateStr}-`;
            const highestOrder = await this.constructor.findOne({
                orderCode: { $regex: `^${todayPrefix}` }
            }).sort({ orderCode: -1 });

            let nextNumber = 1;
            if (highestOrder && highestOrder.orderCode) {
                // Extract the number from the highest order code (e.g., "ORD20240618-001" -> "001" -> 1)
                const numberPart = highestOrder.orderCode.split('-')[1];
                nextNumber = parseInt(numberPart) + 1;
            }

            // Generate the new order code with date and sequential number (e.g., ORD20240618-001)
            const timestamp = Date.now(); // ví dụ: 1721399182345
            this.orderCode = `${todayPrefix}${nextNumber.toString().padStart(3, '0')}-${timestamp}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const rentalOrderModel = mongoose.model("rentalOrders", rentalOrderSchema);

module.exports = rentalOrderModel; 