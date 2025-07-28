const mongoose = require('mongoose');
const motorbikeTypeModel = require('../models/motorbikeTypeModels');
const rentalOrderModel = require('../models/rentalOrderModels');

/**
 * Get top 3 most popular motorbike types (by usage in orders) that are available in a given branch.
 * @param {string} branchReceiveId - The ObjectId string of the branch to check availability.
 * @returns {Promise<Array>} - Array of motorbikeType documents with availableCount field.
 */
async function getTopPopularMotorbikeTypes(branchReceiveId) {
    // 1. Count usage of each motorbike type in all orders
    const allOrders = await rentalOrderModel.find({}).lean();
    const globalTypeStats = {};
    for (const order of allOrders) {
        if (!order.motorbikes) continue;
        for (const mb of order.motorbikes) {
            const typeId = String(mb.motorbikeTypeId);
            if (!globalTypeStats[typeId]) globalTypeStats[typeId] = 0;
            globalTypeStats[typeId] += mb.quantity || 1;
        }
    }
    // 2. Get top 10 most popular type IDs
    const topTypeIds = Object.entries(globalTypeStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([typeId]) => typeId);
    if (topTypeIds.length === 0) return [];
    // 3. Filter to types available in the given branch
    const availableTypes = await motorbikeTypeModel.aggregate([
        { $match: { _id: { $in: topTypeIds.map(id => new mongoose.Types.ObjectId(id)) }, isActive: true } },
        {
            $lookup: {
                from: 'motorbikes',
                localField: '_id',
                foreignField: 'motorbikeType',
                as: 'motorbikes'
            }
        },
        {
            $addFields: {
                availableCount: {
                    $size: {
                        $filter: {
                            input: '$motorbikes',
                            as: 'mb',
                            cond: {
                                $and: [
                                    { $eq: ['$$mb.branchId', new mongoose.Types.ObjectId(branchReceiveId)] },
                                    { $eq: ['$$mb.status', 'available'] }
                                ]
                            }
                        }
                    }
                }
            }
        },
        { $match: { availableCount: { $gt: 0 } } },
        { $limit: 3 }
    ]);
    return availableTypes;
}

module.exports = { getTopPopularMotorbikeTypes }; 