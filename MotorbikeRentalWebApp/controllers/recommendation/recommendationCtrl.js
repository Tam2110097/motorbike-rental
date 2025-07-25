const { suggestMotorbikeTypesFromTripContext } = require('../../utils/recommendationService');

exports.getSuggestedMotorbikeTypes = async (req, res) => {
    try {
        const tripContext = req.body.tripContext;
        const branchReceiveId = req.body.branchReceiveId;

        if (!tripContext || !branchReceiveId) {
            return res.status(400).json({ success: false, message: 'Thiếu thông tin' });
        }

        const suggestions = await suggestMotorbikeTypesFromTripContext(tripContext, branchReceiveId);

        return res.status(200).json({ success: true, data: suggestions });
    } catch (error) {
        console.error('Gợi ý xe lỗi:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server' });
    }
};
