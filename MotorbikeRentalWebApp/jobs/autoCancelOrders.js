const cron = require('node-cron');
const rentalOrderModel = require('../models/rentalOrderModels');
const motorbikeModel = require('../models/motorbikeModels');
const dayjs = require('dayjs');

cron.schedule('*/10 * * * *', async () => {
    try {
        const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
        const pendingOrders = await rentalOrderModel.find({ status: 'pending', createdAt: { $lte: sixHoursAgo } });
        for (const order of pendingOrders) {
            order.status = 'cancelled';
            await order.save();
            // Update motorbikes to available
            if (order.motorbikes && order.motorbikes.length > 0) {
                await Promise.all(order.motorbikes.map(async (mb) => {
                    const motorbike = await motorbikeModel.findById(mb.motorbikeId);
                    if (motorbike) {
                        if (motorbike.booking && motorbike.booking.length > 0) {
                            await motorbikeModel.findByIdAndUpdate(motorbike._id, { status: 'available', booking: [] });
                        } else {
                            await motorbikeModel.findByIdAndUpdate(motorbike._id, { status: 'available' });
                        }
                    }
                }));
            }
            console.log(`[CRON] Auto-cancelled order ${order._id} (pending > 6h)`);
        }
    } catch (err) {
        console.error('[CRON] Error auto-cancelling pending orders:', err);
    }
});