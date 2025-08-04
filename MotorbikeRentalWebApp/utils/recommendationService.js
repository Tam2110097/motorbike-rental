const feedbackModel = require('../models/feedbackModels');
const motorbikeTypeModel = require('../models/motorbikeTypeModels');
const tripContextModel = require('../models/tripContextModels');
const rentalOrderModel = require('../models/rentalOrderModels');

/**
 * Tính độ tương đồng giữa hai TripContext dựa trên số lượng thuộc tính trùng nhau.
 */
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

/**
 * Gợi ý danh sách motorbikeType dựa trên TripContext gần giống nhất.
 * Bao gồm logic đánh giá, lọc loại xe có feedback kém và tính điểm đề xuất.
 */
async function suggestMotorbikeTypesFromTripContext(tripContext, branchReceiveId) {
    // 1. Lấy toàn bộ TripContext từ DB
    const allTripContexts = await tripContextModel.find({});
    if (allTripContexts.length === 0) return [];

    // 2. Tìm các TripContext có độ tương đồng ≥ 4
    const similarTripContexts = [];
    for (const tc of allTripContexts) {
        const sim = tripContextSimilarity(tripContext, tc);
        if (sim >= 4) {
            similarTripContexts.push(tc);
        }
    }
    if (similarTripContexts.length === 0) return [];

    // 3. Lấy danh sách orderId từ TripContext tương tự
    const orderIds = similarTripContexts.map(tc => tc.orderId);
    const orders = await rentalOrderModel.find({ _id: { $in: orderIds } }).lean();

    // 4. Join Feedback từ những đơn hàng liên quan
    const feedbacks = await feedbackModel.find({ rentalOrderId: { $in: orderIds } }).lean();

    // 5. Tổng hợp thống kê số lần sử dụng và tổng điểm đánh giá theo loại xe
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

    // 6. Tính điểm trung bình và điểm đề xuất
    const MIN_SATISFACTION = 3.0;
    const scoredTypes = Object.entries(typeStats)
        .map(([typeId, stats]) => {
            const avgSatisfaction = stats.totalSatisfaction / stats.usedCount || 0;
            const score = stats.usedCount * Math.pow(avgSatisfaction, 1.5); // trọng số đánh giá cao hơn
            return { typeId, usedCount: stats.usedCount, avgSatisfaction, score };
        })
        .filter(item => item.avgSatisfaction >= MIN_SATISFACTION); // loại bỏ xe có đánh giá kém

    if (scoredTypes.length === 0) return [];

    // 7. Sắp xếp theo điểm gợi ý giảm dần
    scoredTypes.sort((a, b) => b.score - a.score);

    // 8. Lấy chi tiết motorbikeType tương ứng với pricing rule
    const typeIds = scoredTypes.map(item => item.typeId);
    const types = await motorbikeTypeModel.find({ _id: { $in: typeIds }, isActive: true })
        .populate('pricingRule')
        .lean();

    // 9. Kết hợp dữ liệu chi tiết với điểm gợi ý
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
