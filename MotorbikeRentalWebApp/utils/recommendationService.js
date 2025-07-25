const motorbikeTypeModel = require('../models/motorbikeTypeModels');
const tripContextModel = require('../models/tripContextModels');
const rentalOrderModel = require('../models/rentalOrderModels');

function tripContextSimilarity(tc1, tc2) {
    let score = 0;
    if (tc1.purpose === tc2.purpose) score++;
    if (tc1.distanceCategory === tc2.distanceCategory) score++;
    if (tc1.numPeople === tc2.numPeople) score++;
    if (tc1.terrain === tc2.terrain) score++;
    if (tc1.luggage === tc2.luggage) score++;
    // preferredFeatures: count overlap
    if (Array.isArray(tc1.preferredFeatures) && Array.isArray(tc2.preferredFeatures)) {
        const overlap = tc1.preferredFeatures.filter(f => tc2.preferredFeatures.includes(f)).length;
        score += overlap;
    }
    return score;
}

async function suggestMotorbikeTypesFromTripContext(tripContext, branchReceiveId) {
    // 1. Find all tripContexts in DB
    const allTripContexts = await tripContextModel.find({});
    if (allTripContexts.length === 0) return [];

    // 2. Find all tripContexts with similarity >= 4
    const similarTripContexts = [];
    for (const tc of allTripContexts) {
        const sim = tripContextSimilarity(tripContext, tc);
        if (sim >= 4) {
            similarTripContexts.push(tc);
        }
    }
    if (similarTripContexts.length === 0) return [];

    // 3. Get all unique motorbike type IDs from the similar orders
    const orderIds = similarTripContexts.map(tc => tc.orderId);
    const orders = await rentalOrderModel.find({ _id: { $in: orderIds } }).lean();
    const typeIdSet = new Set();
    for (const order of orders) {
        if (order.motorbikes && order.motorbikes.length > 0) {
            order.motorbikes.forEach(mb => typeIdSet.add(String(mb.motorbikeTypeId)));
        }
    }
    if (typeIdSet.size === 0) return [];
    const typeIds = Array.from(typeIdSet);
    const types = await motorbikeTypeModel.find({ _id: { $in: typeIds }, isActive: true });
    return types;
}

module.exports = { suggestMotorbikeTypesFromTripContext };
