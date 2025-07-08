const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'rentalOrders',
        required: true
    },
    receiveDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    }
}, { _id: false });

const motorbikeSchema = new mongoose.Schema({
    licensePlateImage: {
        type: String,
        required: [true, 'License plate image is required']
    },
    motorbikeType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'motorbikeTypes',
        required: [true, 'motorbikeType is required']
    },
    code: {
        type: String,
        unique: true,
        trim: true
    },
    branchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'branches',
        required: [true, 'branchId is required']
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance', 'out_of_service', 'reserved'],
        default: 'available'
    },
    booking: {
        type: [bookingSchema],
        required: false
    }
}, {
    timestamps: true
});

// Pre-save middleware to generate code automatically
motorbikeSchema.pre('save', async function (next) {
    if (!this.code) {
        try {
            // Get the motorbike type to access prefixCode
            const MotorbikeType = mongoose.model('motorbikeTypes');
            const motorbikeType = await MotorbikeType.findById(this.motorbikeType);

            if (!motorbikeType) {
                return next(new Error('Motorbike type not found'));
            }

            // Use a more robust approach to generate unique codes
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
                // Find the highest existing code for this prefix
                const highestCode = await this.constructor.findOne({
                    code: { $regex: `^${motorbikeType.prefixCode}` }
                }).sort({ code: -1 });

                let nextNumber = 1;
                if (highestCode) {
                    // Extract the number from the highest code (e.g., "AB001" -> "001" -> 1)
                    const numberPart = highestCode.code.replace(motorbikeType.prefixCode, '');
                    nextNumber = parseInt(numberPart) + 1;
                }

                // Generate the new code with leading zeros (e.g., AB001, AB002)
                const newCode = `${motorbikeType.prefixCode}${nextNumber.toString().padStart(3, '0')}`;

                // Check if this code already exists (race condition check)
                const existingCode = await this.constructor.findOne({ code: newCode });
                if (!existingCode) {
                    this.code = newCode;
                    break;
                }

                attempts++;
                // Small delay to avoid infinite loop
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            if (attempts >= maxAttempts) {
                return next(new Error('Unable to generate unique code after multiple attempts'));
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Sau khi thêm một xe mới -> cập nhật totalQuantity của loại xe tương ứng
motorbikeSchema.post('save', async function (doc, next) {
    try {
        await mongoose.model('motorbikeTypes').findByIdAndUpdate(
            doc.motorbikeType,
            { $inc: { totalQuantity: 1 } }
        );
        next();
    } catch (error) {
        next(error);
    }
});

// Ghi nhớ thông tin trước khi xóa
motorbikeSchema.pre('findOneAndDelete', async function (next) {
    this._docToDelete = await this.model.findOne(this.getFilter());
    next();
});

motorbikeSchema.post('findOneAndDelete', async function (_, next) {
    try {
        const doc = this._docToDelete;
        if (doc) {
            await mongoose.model('motorbikeTypes').findByIdAndUpdate(
                doc.motorbikeType,
                { $inc: { totalQuantity: -1 } }
            );
        }
        next();
    } catch (error) {
        next(error);
    }
});


const motorbikeModel = mongoose.model("motorbikes", motorbikeSchema);

module.exports = motorbikeModel; 