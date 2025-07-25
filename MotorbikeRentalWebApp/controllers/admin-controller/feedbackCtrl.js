const feedbackModel = require('../../models/feedbackModels');
const userModel = require('../../models/userModels');
const rentalOrderModel = require('../../models/rentalOrderModels');

// GET /api/v1/admin/feedback/get-all
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await feedbackModel.find({})
            .populate('customerId', 'fullName email')
            .populate({
                path: 'rentalOrderId',
                populate: [
                    { path: 'branchReceive', select: 'city address phone' },
                    { path: 'branchReturn', select: 'city address phone' },
                    {
                        path: 'motorbikes.motorbikeId',
                        select: 'code motorbikeType branchId status',
                        populate: [
                            { path: 'motorbikeType', select: 'name' },
                            { path: 'branchId', select: 'city address' }
                        ]
                    },
                    {
                        path: 'motorbikes.motorbikeTypeId',
                        select: 'name'
                    }
                ]
            });
        res.status(200).json({ success: true, feedbacks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAllFeedbacks }; 