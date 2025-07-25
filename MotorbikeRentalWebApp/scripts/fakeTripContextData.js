const mongoose = require('mongoose');
const tripContextModel = require('../models/tripContextModels');
const rentalOrderModel = require('../models/rentalOrderModels');
const motorbikeTypeModel = require('../models/motorbikeTypeModels');

const MONGO_URI = 'mongodb://localhost:27017/motorbike_rental'; // Change if needed

async function main() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get some motorbike types
    const types = await motorbikeTypeModel.find({}).limit(3);
    if (types.length < 2) {
        console.error('Please create at least 2 motorbike types in the DB first.');
        process.exit(1);
    }

    // Remove old test data
    await tripContextModel.deleteMany({ purpose: { $in: ['test1', 'test2', 'test3'] } });

    // Create rental orders and trip contexts
    const combos = [
        {
            purpose: 'tour', distanceCategory: 'long', numPeople: 2, terrain: 'mountain', luggage: 'heavy', preferredFeatures: ['fuel-saving'], types: [types[0]._id]
        },
        {
            purpose: 'work', distanceCategory: 'short', numPeople: 1, terrain: 'urban', luggage: 'light', preferredFeatures: ['easy-to-ride'], types: [types[1]._id]
        },
        {
            purpose: 'delivery', distanceCategory: 'medium', numPeople: 1, terrain: 'urban', luggage: 'heavy', preferredFeatures: [], types: [types[0]._id, types[1]._id]
        },
        {
            purpose: 'tour', distanceCategory: 'medium', numPeople: 2, terrain: 'mountain', luggage: 'light', preferredFeatures: ['fuel-saving', 'easy-to-ride'], types: [types[2]._id]
        }
    ];

    for (const combo of combos) {
        const order = await rentalOrderModel.create({
            customerId: new mongoose.Types.ObjectId(),
            branchReceive: new mongoose.Types.ObjectId(),
            branchReturn: new mongoose.Types.ObjectId(),
            receiveDate: new Date(),
            returnDate: new Date(Date.now() + 86400000),
            grandTotal: 1000000,
            motorbikes: combo.types.map(tid => ({ motorbikeTypeId: tid, motorbikeId: new mongoose.Types.ObjectId(), quantity: 1 })),
        });
        await tripContextModel.create({
            orderId: order._id,
            purpose: combo.purpose,
            distanceCategory: combo.distanceCategory,
            numPeople: combo.numPeople,
            terrain: combo.terrain,
            luggage: combo.luggage,
            preferredFeatures: combo.preferredFeatures
        });
        console.log('Inserted test tripContext and order for:', combo.purpose, combo.distanceCategory, combo.numPeople);
    }
    console.log('Done!');
    process.exit(0);
}

main(); 