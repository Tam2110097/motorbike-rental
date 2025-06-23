const mongoose = require('mongoose');

const motorbikeSchema = new mongoose.Schema({
    licensePlate: {
        type: String,
        required: [true, 'licensePlate is required'],
        unique: true,
        trim: true
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
    status: {
        type: String,
        enum: ['available', 'rented', 'maintenance', 'out_of_service', 'reserved'],
        default: 'available'
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
            this.code = `${motorbikeType.prefixCode}${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const motorbikeModel = mongoose.model("motorbikes", motorbikeSchema);

module.exports = motorbikeModel; 