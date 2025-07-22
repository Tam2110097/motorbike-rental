/**
 * Created by CTT VNPAY
 */



let express = require('express');
let router = express.Router();
let $ = require('jquery');
const request = require('request');
const moment = require('moment');
const querystring = require('querystring');
const config = require('../config/default.json');
const crypto = require('crypto');
const rentalOrderModel = require('../models/rentalOrderModels');
const paymentModel = require('../models/paymentModels');
const motorbikeModel = require('../models/motorbikeModels');


router.get('/', function (req, res, next) {
    res.render('orderlist', { title: 'Danh sách đơn hàng' })
});

// POST /api/v1/vnpay/create_payment_url
router.post('/create_payment_url', async (req, res) => {
    const { orderId, amount } = req.body;
    const userIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const order = await rentalOrderModel.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const crypto = require('crypto');
    const querystring = require('qs');
    const config = require('../config/default.json');

    const tmnCode = config.vnp_TmnCode;
    const secretKey = config.vnp_HashSecret;
    const vnpUrl = config.vnp_Url;
    const returnUrl = config.vnp_ReturnUrl;

    const createDate = moment().format('YYYYMMDDHHmmss');
    const orderCode = order.orderCode;

    let vnp_Params = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: tmnCode,
        vnp_Locale: 'vn',
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderCode,
        vnp_OrderInfo: `Thanh toan don hang ${orderCode}`,
        vnp_OrderType: 'other',
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: userIp,
        vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;

    return res.json({ paymentUrl });
});



router.get('/querydr', function (req, res, next) {

    let desc = 'truy van ket qua thanh toan';
    res.render('querydr', { title: 'Truy vấn kết quả thanh toán' })
});

router.get('/refund', function (req, res, next) {

    let desc = 'Hoan tien GD thanh toan';
    res.render('refund', { title: 'Hoàn tiền giao dịch thanh toán' })
});


router.get('/vnpay_return', async (req, res) => {
    const vnp_Params = { ...req.query };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const crypto = require('crypto');
    const querystring = require('qs');
    const config = require('../config/default.json');

    const sortedParams = sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", config.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    const isValid = secureHash === signed;
    const isSuccess = vnp_Params['vnp_ResponseCode'] === '00';

    const orderCode = vnp_Params['vnp_TxnRef'];

    try {
        const order = await rentalOrderModel.findOne({ orderCode });

        if (!isValid || !order) {
            return res.redirect(`http://localhost:5173/order/my-order?orderCode=${orderCode}&vnp_status=failed`);
        }

        if (isSuccess) {
            // Cập nhật đơn hàng
            order.status = 'confirmed';
            await order.save();

            // Tìm thanh toán tương ứng và cập nhật
            const payment = await paymentModel.findOne({
                rentalOrderId: order._id,
                paymentType: 'preDeposit',
                status: 'pending'
            });

            if (payment) {
                payment.status = 'completed';
                payment.transactionCode = vnp_Params['vnp_TransactionNo'];
                payment.paymentDate = new Date();
                await payment.save();
            } else {
                console.warn('⚠️ Không tìm thấy payment để cập nhật');
            }

            // Cập nhật booking field cho từng motorbike trong đơn hàng
            try {
                for (const motorbikeItem of order.motorbikes) {
                    const motorbike = await motorbikeModel.findById(motorbikeItem.motorbikeId);

                    if (motorbike) {
                        // Thêm booking mới vào booking array
                        const newBooking = {
                            orderId: order._id,
                            receiveDate: order.receiveDate,
                            returnDate: order.returnDate
                        };

                        // Cập nhật booking array và status
                        motorbike.booking.push(newBooking);
                        motorbike.status = 'reserved'; // Giữ status là reserved vì đã thanh toán pre-deposit

                        await motorbike.save();
                        console.log(`✅ Đã cập nhật booking cho motorbike ${motorbike.code}`);
                    } else {
                        console.warn(`⚠️ Không tìm thấy motorbike với ID: ${motorbikeItem.motorbikeId}`);
                    }
                }
            } catch (bookingError) {
                console.error('❌ Lỗi khi cập nhật booking cho motorbikes:', bookingError);
            }

            // Redirect về FE
            return res.redirect(`http://localhost:5173/order/my-order?orderCode=${orderCode}&vnp_status=success`);
        }

        // Nếu thanh toán thất bại
        return res.redirect(`http://localhost:5173/order/my-order?orderCode=${orderCode}&vnp_status=failed`);
        console.log('>>>>>>>>>>>>>>BE: thanh toán failed',)
    } catch (error) {
        console.error(error);
        return res.redirect(`http://localhost:5173/order/my-order?orderCode=${orderCode}&vnp_status=failed`);
    }
});


router.get('/vnpay_ipn', function (req, res, next) {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    let orderId = vnp_Params['vnp_TxnRef'];
    let rspCode = vnp_Params['vnp_ResponseCode'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    let config = require('config');
    let secretKey = config.get('vnp_HashSecret');
    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    let paymentStatus = '0'; // Giả sử '0' là trạng thái khởi tạo giao dịch, chưa có IPN. Trạng thái này được lưu khi yêu cầu thanh toán chuyển hướng sang Cổng thanh toán VNPAY tại đầu khởi tạo đơn hàng.
    //let paymentStatus = '1'; // Giả sử '1' là trạng thái thành công bạn cập nhật sau IPN được gọi và trả kết quả về nó
    //let paymentStatus = '2'; // Giả sử '2' là trạng thái thất bại bạn cập nhật sau IPN được gọi và trả kết quả về nó

    let checkOrderId = true; // Mã đơn hàng "giá trị của vnp_TxnRef" VNPAY phản hồi tồn tại trong CSDL của bạn
    let checkAmount = true; // Kiểm tra số tiền "giá trị của vnp_Amout/100" trùng khớp với số tiền của đơn hàng trong CSDL của bạn
    if (secureHash === signed) { //kiểm tra checksum
        if (checkOrderId) {
            if (checkAmount) {
                if (paymentStatus == "0") { //kiểm tra tình trạng giao dịch trước khi cập nhật tình trạng thanh toán
                    if (rspCode == "00") {
                        //thanh cong
                        //paymentStatus = '1'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thành công vào CSDL của bạn
                        res.status(200).json({ RspCode: '00', Message: 'Success' })
                    }
                    else {
                        //that bai
                        //paymentStatus = '2'
                        // Ở đây cập nhật trạng thái giao dịch thanh toán thất bại vào CSDL của bạn
                        res.status(200).json({ RspCode: '00', Message: 'Success' })
                    }
                }
                else {
                    res.status(200).json({ RspCode: '02', Message: 'This order has been updated to the payment status' })
                }
            }
            else {
                res.status(200).json({ RspCode: '04', Message: 'Amount invalid' })
            }
        }
        else {
            res.status(200).json({ RspCode: '01', Message: 'Order not found' })
        }
    }
    else {
        res.status(200).json({ RspCode: '97', Message: 'Checksum failed' })
    }
});

router.post('/querydr', function (req, res, next) {

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let config = require('config');
    let crypto = require("crypto");

    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;

    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'querydr';
    let vnp_OrderInfo = 'Truy van GD ma:' + vnp_TxnRef;

    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    let currCode = 'VND';
    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TxnRef + "|" + vnp_TransactionDate + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;

    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");

    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };
    // /merchant_webapi/api/transaction
    request({
        url: vnp_Api,
        method: "POST",
        json: true,
        body: dataObj
    }, function (error, response, body) {
        console.log(response);
    });

});

router.post('/refund', function (req, res, next) {

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let config = require('config');
    let crypto = require("crypto");

    let vnp_TmnCode = config.get('vnp_TmnCode');
    let secretKey = config.get('vnp_HashSecret');
    let vnp_Api = config.get('vnp_Api');

    let vnp_TxnRef = req.body.orderId;
    let vnp_TransactionDate = req.body.transDate;
    let vnp_Amount = req.body.amount * 100;
    let vnp_TransactionType = req.body.transType;
    let vnp_CreateBy = req.body.user;

    let currCode = 'VND';

    let vnp_RequestId = moment(date).format('HHmmss');
    let vnp_Version = '2.1.0';
    let vnp_Command = 'refund';
    let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

    let vnp_IpAddr = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;


    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    let vnp_TransactionNo = '0';

    let data = vnp_RequestId + "|" + vnp_Version + "|" + vnp_Command + "|" + vnp_TmnCode + "|" + vnp_TransactionType + "|" + vnp_TxnRef + "|" + vnp_Amount + "|" + vnp_TransactionNo + "|" + vnp_TransactionDate + "|" + vnp_CreateBy + "|" + vnp_CreateDate + "|" + vnp_IpAddr + "|" + vnp_OrderInfo;
    let hmac = crypto.createHmac("sha512", secretKey);
    let vnp_SecureHash = hmac.update(new Buffer(data, 'utf-8')).digest("hex");

    let dataObj = {
        'vnp_RequestId': vnp_RequestId,
        'vnp_Version': vnp_Version,
        'vnp_Command': vnp_Command,
        'vnp_TmnCode': vnp_TmnCode,
        'vnp_TransactionType': vnp_TransactionType,
        'vnp_TxnRef': vnp_TxnRef,
        'vnp_Amount': vnp_Amount,
        'vnp_TransactionNo': vnp_TransactionNo,
        'vnp_CreateBy': vnp_CreateBy,
        'vnp_OrderInfo': vnp_OrderInfo,
        'vnp_TransactionDate': vnp_TransactionDate,
        'vnp_CreateDate': vnp_CreateDate,
        'vnp_IpAddr': vnp_IpAddr,
        'vnp_SecureHash': vnp_SecureHash
    };

    request({
        url: vnp_Api,
        method: "POST",
        json: true,
        body: dataObj
    }, function (error, response, body) {
        console.log(response);
    });

});

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = router;