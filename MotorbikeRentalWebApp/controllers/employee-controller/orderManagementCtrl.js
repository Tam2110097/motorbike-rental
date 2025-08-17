const rentalOrderModel = require('../../models/rentalOrderModels');
const branchModel = require('../../models/branchModels');
const userModel = require('../../models/userModels');
const accessoryDetailModel = require('../../models/accessoryDetailModels');
const accessoryModel = require('../../models/accessoryModels');
const rentalOrderMotorbikeDetailModel = require('../../models/rentalOrderMotorbikeDetailModels');
const motorbikeModel = require('../../models/motorbikeModels');
const refundModel = require('../../models/refundModels');
const paymentModel = require('../../models/paymentModels');
const orderDocumentModel = require('../../models/orderDocumentModels');
const dayjs = require('dayjs');
const cron = require('node-cron');

// Cancel order (for employees)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const rentalOrder = await rentalOrderModel.findById(id);
        if (!rentalOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Kiểm tra trạng thái đơn hàng - chỉ cho phép hủy đơn hàng chưa active hoặc completed
        if (rentalOrder.status === 'active' || rentalOrder.status === 'completed' || rentalOrder.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đang sử dụng, đã hoàn thành hoặc đã hủy'
            });
        }

        // Cập nhật trạng thái đơn hàng
        rentalOrder.status = 'cancelled';
        await rentalOrder.save();

        res.status(200).json({
            success: true,
            message: 'Hủy đơn hàng thành công',
            rentalOrder
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hủy đơn hàng',
            error: error.message
        });
    }
};

// Helper function to format refund reason
const formatRefundReason = (remainingDays, remainingHours) => {
    if (remainingDays > 0 && remainingHours > 0) {
        return `Trả xe sớm - Còn lại ${remainingDays} ngày ${remainingHours} giờ`;
    } else if (remainingDays > 0) {
        return `Trả xe sớm - Còn lại ${remainingDays} ngày`;
    } else {
        return 'Trả xe sớm';
    }
};

// Get all rental orders (for employees)
const getAllOrders = async (req, res) => {
    try {
        // Optionally, filter by branch if employee is assigned to a branch
        // const employee = await userModel.findById(req.user.id);
        // const branchId = employee.workAt;
        // const query = branchId ? { branchReceive: branchId } : {};
        const rentalOrders = await rentalOrderModel.find()
            .populate('branchReceive')
            .populate('branchReturn')
            .populate('motorbikes.motorbikeId')
            .populate('motorbikes.motorbikeTypeId')
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            message: 'Lấy danh sách đơn hàng thành công',
            rentalOrders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng',
            error: error.message
        });
    }
};

// Get order by ID (for employees)
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const rentalOrder = await rentalOrderModel.findById(id)
            .populate('branchReceive')
            .populate('branchReturn')
            .populate('motorbikes.motorbikeId')
            .populate('motorbikes.motorbikeTypeId');
        if (!rentalOrder) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Lấy thông tin đơn hàng thành công',
            rentalOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin đơn hàng',
            error: error.message
        });
    }
};

// Get all accessory details for a rental order
const getAccessoryDetailsForOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const accessories = await accessoryDetailModel.find({ rentalOrderId: orderId })
            .populate('accessoryId');
        res.status(200).json({
            success: true,
            message: 'Lấy chi tiết phụ kiện thành công',
            accessories: accessories.map(a => ({ accessory: a.accessoryId, quantity: a.quantity }))
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getInvoiceData = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await rentalOrderModel.findById(orderId)
            .populate('customerId', 'fullName phone email')
            .populate('branchReceive', 'city address')
            .populate('branchReturn', 'city address')
            .populate('motorbikes.motorbikeId')
            .lean();

        if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

        // Fetch accessories for this order using the new controller logic
        const accessories = await accessoryDetailModel.find({ rentalOrderId: orderId })
            .populate('accessoryId');
        const formattedAccessories = accessories.map(a => ({ accessory: a.accessoryId, quantity: a.quantity }));

        res.status(200).json({
            success: true,
            message: 'Lấy dữ liệu hóa đơn thành công',
            invoice: { ...order, accessories: formattedAccessories }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all data for a complete invoice
const getFullInvoiceData = async (req, res) => {
    try {
        const { orderId } = req.params;
        // Main order
        const order = await rentalOrderModel.findById(orderId)
            .populate('customerId', 'fullName phone email')
            .populate('branchReceive', 'city address')
            .populate('branchReturn', 'city address')
            .populate('motorbikes.motorbikeId')
            .populate('motorbikes.motorbikeTypeId')
            .lean();
        if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

        // Motorbike details (for type, price, etc)
        const motorbikeDetails = await rentalOrderMotorbikeDetailModel.find({ rentalOrderId: orderId })
            .populate('motorbikeTypeId');

        // Accessories
        const accessories = await accessoryDetailModel.find({ rentalOrderId: orderId })
            .populate('accessoryId');
        const formattedAccessories = accessories.map(a => ({ accessory: a.accessoryId, quantity: a.quantity }));

        // Group motorbikes by type and include codes
        const motorbikesByType = {};
        if (order.motorbikes && order.motorbikes.length > 0) {
            order.motorbikes.forEach(mb => {
                const typeId = mb.motorbikeTypeId._id.toString();
                if (!motorbikesByType[typeId]) {
                    motorbikesByType[typeId] = {
                        motorbikeTypeId: mb.motorbikeTypeId,
                        quantity: 0,
                        codes: []
                    };
                }
                motorbikesByType[typeId].quantity += mb.quantity || 1;
                if (mb.motorbikeId && mb.motorbikeId.code) {
                    motorbikesByType[typeId].codes.push(mb.motorbikeId.code);
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Lấy dữ liệu hóa đơn đầy đủ thành công',
            invoice: {
                ...order,
                motorbikeDetails,
                motorbikesByType,
                accessories: formattedAccessories
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const markPaidOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        // const { isPaidFully } = req.body;
        const order = await rentalOrderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });

        // order.isPaidFully = isPaidFully;
        order.isPaidFully = true;
        await order.save();

        res.status(200).json({ success: true, message: "Đã cập nhật trạng thái thanh toán" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// Check-in (set order status to 'active')
const checkInOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await rentalOrderModel.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        if (order.status !== 'confirmed') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể check-in đơn hàng ở trạng thái đã xác nhận.' });
        }
        order.status = 'active';
        order.checkInDate = new Date();
        await order.save();
        // Update all motorbikes in this order to 'rented'
        if (order.motorbikes && order.motorbikes.length > 0) {
            await Promise.all(order.motorbikes.map(async (mb) => {
                await motorbikeModel.findByIdAndUpdate(mb.motorbikeId, { status: 'rented' });
            }));
        }
        res.status(200).json({ success: true, message: 'Check-in thành công, trạng thái đơn hàng và xe máy đã chuyển sang Đang sử dụng/Đang được thuê.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const checkoutOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;
        const order = await rentalOrderModel.findById(orderId).populate('motorbikes.motorbikeTypeId');
        if (!order) return res.status(404).json({ success: false, message: "Không tìm thấy đơn hàng" });
        if (order.status !== 'active') {
            return res.status(400).json({ success: false, message: 'Chỉ có thể checkout đơn hàng ở trạng thái Đang sử dụng.' });
        }

        // Set checkout time to current time
        const checkoutTime = new Date();
        order.status = 'completed';
        order.checkOutDate = checkoutTime;
        await order.save();

        // Update all motorbikes in this order to 'available' and transfer branch
        if (order.motorbikes && order.motorbikes.length > 0) {
            await Promise.all(order.motorbikes.map(async (mb) => {
                await motorbikeModel.findByIdAndUpdate(mb.motorbikeId, {
                    status: 'available',
                    branchId: order.branchReturn
                });
            }));
        }

        // --- Enhanced Refund logic for early checkout with precise time calculation ---
        const plannedReturn = dayjs(order.returnDate);
        const actualCheckout = dayjs(checkoutTime);
        const receiveDate = dayjs(order.receiveDate);

        // Calculate remaining time in hours
        const remainingHours = plannedReturn.diff(actualCheckout, 'hour', true);
        const remainingDays = Math.floor(remainingHours / 24);
        const remainingHoursInDay = remainingHours % 24;

        console.log('Checkout Analysis:', {
            plannedReturn: plannedReturn.format('YYYY-MM-DD HH:mm:ss'),
            actualCheckout: actualCheckout.format('YYYY-MM-DD HH:mm:ss'),
            receiveDate: receiveDate.format('YYYY-MM-DD HH:mm:ss'),
            remainingHours: remainingHours,
            remainingDays: remainingDays,
            remainingHoursInDay: remainingHoursInDay
        });

        // Only create refund if there's at least 1 full day remaining
        if (actualCheckout.isBefore(plannedReturn) && remainingDays >= 1) {
            console.log('Creating refund for early checkout with', remainingDays, 'full days remaining');

            // Calculate refund amount based on full days only (no partial day refunds)
            let amount = 0;

            // Get motorbike details for this order
            const motorbikeDetails = await rentalOrderMotorbikeDetailModel.find({ rentalOrderId: orderId });

            console.log('Motorbike details for refund calculation:', motorbikeDetails.length, 'items');

            for (const mb of motorbikeDetails) {
                const unitPrice = mb.unitPrice || 0;
                const waiver = mb.damageWaiverFee || 0;
                const itemAmount = (unitPrice + waiver) * mb.quantity * remainingDays;
                amount += itemAmount;

                console.log('Refund calculation for item:', {
                    unitPrice,
                    waiver,
                    quantity: mb.quantity,
                    remainingDays,
                    itemAmount
                });
            }

            // Find payment for this order
            const payment = await paymentModel.findOne({ rentalOrderId: orderId });
            if (payment && amount > 0) {
                const refund = await refundModel.create({
                    amount,
                    reason: formatRefundReason(remainingDays, remainingHoursInDay),
                    status: 'pending',
                    paymentId: payment._id,
                    processedBy: userId,
                    invoiceImage: ''
                });

                console.log('Refund created successfully:', {
                    refundId: refund._id,
                    amount: amount,
                    remainingDays: remainingDays,
                    remainingHours: remainingHoursInDay,
                    reason: refund.reason
                });

                res.status(200).json({
                    success: true,
                    message: `Checkout thành công! Đơn hàng đã hoàn thành, xe máy đã chuyển về chi nhánh trả. Hoàn tiền: ${amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} cho ${remainingDays} ngày còn lại.`,
                    refund: {
                        amount: amount,
                        remainingDays: remainingDays,
                        remainingHours: Math.floor(remainingHoursInDay)
                    }
                });
            } else {
                console.log('No payment found or amount is 0:', { payment: !!payment, amount });
                res.status(200).json({
                    success: true,
                    message: 'Checkout thành công! Đơn hàng đã hoàn thành, xe máy đã chuyển về chi nhánh trả. Không có hoàn tiền do không tìm thấy thanh toán hoặc số tiền hoàn tiền bằng 0.',
                    refund: null
                });
            }
        } else {
            // No refund - either no early checkout or less than 1 full day remaining
            const message = remainingDays < 1 && remainingHours > 0
                ? 'Checkout thành công! Không có hoàn tiền do thời gian còn lại không đủ 1 ngày đầy đủ.'
                : 'Checkout thành công! Đơn hàng đã hoàn thành, xe máy đã chuyển về chi nhánh trả.';

            console.log('No refund created:', {
                isEarlyCheckout: actualCheckout.isBefore(plannedReturn),
                remainingDays,
                remainingHours,
                reason: remainingDays < 1 ? 'Less than 1 full day' : 'No early checkout'
            });

            res.status(200).json({
                success: true,
                message: message,
                refund: null
            });
        }
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create refund on early checkout
const createRefund = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await rentalOrderModel.findById(orderId)
            .populate('motorbikes.motorbikeTypeId');
        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        // Kiểm tra nhận/trả cùng chi nhánh
        const isSameBranch = String(order.branchReceive) === String(order.branchReturn);

        // Calculate remaining time in hours
        const plannedReturn = dayjs(order.returnDate);
        const today = dayjs();
        const remainingHours = plannedReturn.diff(today, 'hour', true);
        const remainingDays = Math.floor(remainingHours / 24);
        const remainingHoursInDay = remainingHours % 24;

        console.log('Refund Analysis:', {
            plannedReturn: plannedReturn.format('YYYY-MM-DD HH:mm:ss'),
            today: today.format('YYYY-MM-DD HH:mm:ss'),
            remainingHours: remainingHours,
            remainingDays: remainingDays,
            remainingHoursInDay: remainingHoursInDay
        });

        // Only create refund if there's at least 1 full day remaining
        if (remainingDays < 1) {
            return res.status(400).json({
                success: false,
                message: 'Không thể tạo hoàn tiền do thời gian còn lại không đủ 1 ngày đầy đủ.'
            });
        }

        let totalRefundAmount = 0;

        const receiveDate = dayjs(order.receiveDate);     // Ngày bắt đầu thuê
        const returnDate = dayjs(order.returnDate);       // Ngày dự kiến trả

        for (const mb of order.motorbikes) {
            const motorbikeType = mb.motorbikeTypeId;
            const rule = motorbikeType.pricingRule;

            if (!rule) continue;

            const basePrice = isSameBranch ? rule.sameBranchPrice : rule.differentBranchPrice;
            const discountPrice = basePrice * (1 - rule.discountPercent / 100);
            const discountStartDay = rule.discountDay;

            // Calculate used days
            const usedDays = today.diff(receiveDate, 'day');
            const refundStartDay = usedDays + 1;

            let normalDays = 0;
            let discountedDays = 0;

            // Only calculate for full days
            for (let i = 0; i < remainingDays; i++) {
                const dayIndex = refundStartDay + i;
                if (dayIndex >= discountStartDay) {
                    discountedDays++;
                } else {
                    normalDays++;
                }
            }

            const refundAmount = (normalDays * basePrice + discountedDays * discountPrice) * mb.quantity;
            totalRefundAmount += refundAmount;
        }

        // Tìm thanh toán đã thực hiện
        const payment = await paymentModel.findOne({ rentalOrderId: orderId });
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy thanh toán cho đơn hàng này' });
        }

        // Tạo bản ghi hoàn tiền
        const refund = await refundModel.create({
            amount: totalRefundAmount,
            reason: formatRefundReason(remainingDays, remainingHoursInDay),
            status: 'pending',
            paymentId: payment._id,
            processedBy: userId,
            invoiceImage: ''
        });

        console.log('Refund created:', {
            amount: totalRefundAmount,
            remainingDays: remainingDays,
            remainingHours: remainingHoursInDay
        });

        res.status(201).json({
            success: true,
            refund: {
                ...refund.toObject(),
                remainingDays: remainingDays,
                remainingHours: Math.floor(remainingHoursInDay)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


// Complete refund by uploading invoice image
const completeRefund = async (req, res) => {
    try {
        const { refundId } = req.params;
        const userId = req.user.id;
        if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng tải lên ảnh chuyển khoản' });
        const refund = await refundModel.findById(refundId);
        if (!refund) return res.status(404).json({ success: false, message: 'Không tìm thấy hoàn tiền' });
        refund.status = 'completed';
        refund.invoiceImage = `/uploads/${req.file.filename}`;
        if (!refund.processedBy) {
            refund.processedBy = userId;
        }
        await refund.save();
        res.status(200).json({ success: true, invoiceImage: refund.invoiceImage });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all refunds (for employee)
const getAllRefunds = async (req, res) => {
    try {
        const refunds = await refundModel.find().populate('paymentId').sort({ createdAt: -1 });
        res.status(200).json({ success: true, refunds });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get order documents for validation
const getOrderDocuments = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Check if order exists
        const order = await rentalOrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại'
            });
        }

        // Find document record
        const documentRecord = await orderDocumentModel.findOne({ rentalOrderId: orderId });

        if (!documentRecord) {
            return res.status(404).json({
                success: false,
                message: 'Chưa có giấy tờ được tải lên'
            });
        }

        res.status(200).json({
            success: true,
            documents: {
                cccdImages: documentRecord.cccdImages || [],
                driverLicenseImages: documentRecord.driverLicenseImages || [],
                isCompleted: documentRecord.isCompleted,
                isValid: documentRecord.isValid,
                uploadedAt: documentRecord.uploadedAt
            }
        });

    } catch (error) {
        console.error('Error getting order documents:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi lấy thông tin giấy tờ',
            error: error.message
        });
    }
};

// Validate order documents
const validateOrderDocuments = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { isValid } = req.body;

        // Check if order exists
        const order = await rentalOrderModel.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Đơn hàng không tồn tại'
            });
        }

        // Find and update document record
        const documentRecord = await orderDocumentModel.findOne({ rentalOrderId: orderId });

        if (!documentRecord) {
            return res.status(404).json({
                success: false,
                message: 'Chưa có giấy tờ được tải lên'
            });
        }

        // Update validation status
        documentRecord.isValid = isValid;
        await documentRecord.save();

        res.status(200).json({
            success: true,
            message: isValid ? 'Đã xác nhận giấy tờ hợp lệ' : 'Đã đánh dấu giấy tờ không hợp lệ',
            documents: {
                cccdImages: documentRecord.cccdImages || [],
                driverLicenseImages: documentRecord.driverLicenseImages || [],
                isCompleted: documentRecord.isCompleted,
                isValid: documentRecord.isValid,
                uploadedAt: documentRecord.uploadedAt
            }
        });

    } catch (error) {
        console.error('Error validating order documents:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi xác nhận giấy tờ',
            error: error.message
        });
    }
};

// CRONJOB: Auto-cancel pending orders older than 6 hours
// cron.schedule('*/10 * * * *', async () => {
//     try {
//         const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
//         const pendingOrders = await rentalOrderModel.find({ status: 'pending', createdAt: { $lte: sixHoursAgo } });
//         for (const order of pendingOrders) {
//             order.status = 'cancelled';
//             await order.save();
//             // Update motorbikes to available
//             if (order.motorbikes && order.motorbikes.length > 0) {
//                 await Promise.all(order.motorbikes.map(async (mb) => {
//                     const motorbike = await motorbikeModel.findById(mb.motorbikeId);
//                     if (motorbike) {
//                         if (motorbike.booking && motorbike.booking.length > 0) {
//                             await motorbikeModel.findByIdAndUpdate(motorbike._id, { status: 'available', booking: [] });
//                         } else {
//                             await motorbikeModel.findByIdAndUpdate(motorbike._id, { status: 'available' });
//                         }
//                     }
//                 }));
//             }
//             console.log(`[CRON] Auto-cancelled order ${order._id} (pending > 6h)`);
//         }
//     } catch (err) {
//         console.error('[CRON] Error auto-cancelling pending orders:', err);
//     }
// });

module.exports = {
    getAllOrders,
    getOrderById,
    cancelOrder,
    getInvoiceData,
    getAccessoryDetailsForOrder,
    getFullInvoiceData,
    markPaidOrder,
    checkInOrder,
    checkoutOrder,
    createRefund,
    completeRefund,
    getAllRefunds,
    getOrderDocuments,
    validateOrderDocuments
};
