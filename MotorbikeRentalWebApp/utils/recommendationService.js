const feedbackModel = require('../models/feedbackModels');
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
    if (Array.isArray(tc1.preferredFeatures) && Array.isArray(tc2.preferredFeatures)) {
        const overlap = tc1.preferredFeatures.filter(f => tc2.preferredFeatures.includes(f)).length;
        score += overlap;
    }
    return score;
}

async function suggestMotorbikeTypesFromTripContext(tripContext, branchReceiveId) {
    // 1. Tìm tất cả tripContext từ DB
    const allTripContexts = await tripContextModel.find({});
    if (allTripContexts.length === 0) return [];

    // 2. Lọc các TripContext có độ tương đồng >= 4
    const similarTripContexts = [];
    for (const tc of allTripContexts) {
        const sim = tripContextSimilarity(tripContext, tc);
        if (sim >= 4) {
            similarTripContexts.push(tc);
        }
    }
    if (similarTripContexts.length === 0) return [];

    // 3. Lấy orderId từ các TripContext
    const orderIds = similarTripContexts.map(tc => tc.orderId);

    // 4. Lấy đơn hàng từ các orderId đó
    const orders = await rentalOrderModel.find({ _id: { $in: orderIds } }).lean();

    // 5. Lấy feedback tương ứng
    const feedbacks = await feedbackModel.find({ rentalOrderId: { $in: orderIds } }).lean();

    // 6. Gom dữ liệu từng loại xe
    const typeStats = {}; // motorbikeTypeId => { usedCount, totalSatisfaction }

    for (const order of orders) {
        if (!order.motorbikes) continue;
        const feedback = feedbacks.find(fb => String(fb.rentalOrderId) === String(order._id));
        for (const mb of order.motorbikes) {
            const typeId = String(mb.motorbikeTypeId);
            if (!typeStats[typeId]) {
                typeStats[typeId] = { usedCount: 0, totalSatisfaction: 0 };
            }
            typeStats[typeId].usedCount += mb.quantity || 1;
            if (feedback) {
                typeStats[typeId].totalSatisfaction += feedback.satisfactionScore;
            }
        }
    }

    // 7. Tính điểm score
    const scoredTypes = Object.entries(typeStats).map(([typeId, stats]) => {
        const avgSatisfaction = stats.totalSatisfaction / stats.usedCount || 0;
        const score = stats.usedCount * avgSatisfaction;
        return { typeId, usedCount: stats.usedCount, avgSatisfaction, score };
    });

    // 8. Sắp xếp theo score giảm dần
    scoredTypes.sort((a, b) => b.score - a.score);

    // 9. Lấy thông tin MotorbikeType tương ứng
    const typeIds = scoredTypes.map(item => item.typeId);
    const types = await motorbikeTypeModel.find({ _id: { $in: typeIds }, isActive: true }).lean();

    // 10. Gắn điểm vào object
    const result = types.map(type => {
        const scoreData = scoredTypes.find(t => t.typeId === String(type._id));
        return {
            ...type,
            usedCount: scoreData.usedCount,
            avgSatisfaction: scoreData.avgSatisfaction,
            recommendationScore: scoreData.score
        };
    });

    console.log('>>>>>>>>>>RESULT', result);

    return result;
}

module.exports = { suggestMotorbikeTypesFromTripContext };
