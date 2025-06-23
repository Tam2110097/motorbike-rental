const mongoose = require('mongoose');

const rentalOrderSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'customers',
        required: [true, 'customerId is required']
    },
    processedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'employees',
        required: [true, 'processedBy is required']
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
        required: [true, 'returnDate is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    accessories: [{
        accessory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'accessories'
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],
    evidenceImage: {
        type: String,
        required: [true, 'evidenceImage is required']
    },
    orderCode: {
        type: String,
        unique: true,
        trim: true
    },
    hasDamageWaiver: {
        type: Boolean,
        default: false
    },
    grandTotal: {
        type: Number,
        required: [true, 'grandTotal is required'],
        min: [0, 'grandTotal cannot be negative']
    },
    motorbikes: [{
        motorbike: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'motorbikes',
            required: true
        },
        rentalFee: {
            type: Number,
            required: true,
            min: 0
        }
    }],
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
            this.orderCode = `${todayPrefix}${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const rentalOrderModel = mongoose.model("rentalOrders", rentalOrderSchema);

module.exports = rentalOrderModel; 