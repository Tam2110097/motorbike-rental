import React from 'react'
import CustomerInformation from './components/CustomerInformation'
import OrderDetail from './components/OrderDetail'
import PlaceOrderButton from './components/PlaceOrderButton'
import HeaderBar from '../../../../components/HeaderBar'
import { Layout } from 'antd'
import { useBooking } from '../../../../context/BookingContext';
import axios from 'axios';
import { message } from 'antd';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout
const token = localStorage.getItem('token');

const pageTitleStyle = {
    textAlign: 'center',
    margin: '0px auto 30px auto',
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 10,
};

const CheckoutPage = () => {
    const { bookingData, setBookingData } = useBooking();
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check login status (adjust according to your auth logic)
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    // Restore booking context if present after login
    useEffect(() => {
        const pendingBooking = localStorage.getItem('pendingBooking');
        if (pendingBooking) {
            try {
                const parsed = JSON.parse(pendingBooking);
                if (parsed && setBookingData) {
                    setBookingData(parsed);
                }
                localStorage.removeItem('pendingBooking');
            } catch {
                // ignore
            }
        }
    }, [setBookingData]);

    // Prepare data for API
    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            if (!bookingData.startDate || !bookingData.endDate || !bookingData.startTime || !bookingData.endTime) {
                message.error('Vui lòng chọn đầy đủ ngày và giờ');
                return;
            }

            const startDate = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
            const endDate = new Date(`${bookingData.endDate}T${bookingData.endTime}`);
            const now = new Date();

            if (startDate <= now) {
                message.error('Thời gian nhận xe phải lớn hơn hiện tại');
                return;
            }

            if (endDate <= startDate) {
                message.error('Thời gian trả xe phải lớn hơn thời gian nhận xe');
                return;
            }

            const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const isSameBranch = bookingData.startBranch === bookingData.endBranch;

            // Tính chi tiết loại xe
            const motorbikeDetails = (bookingData.motorbikes || []).map(item => {
                const basePrice = isSameBranch
                    ? item.motorbikeType.pricingRule.sameBranchPrice
                    : item.motorbikeType.pricingRule.differentBranchPrice;

                const damageWaiverFee = item.hasDamageWaiver
                    ? item.motorbikeType.dailyDamageWaiver || 0
                    : 0;

                const unitPrice = basePrice;
                return {
                    motorbikeTypeId: item.motorbikeType._id,
                    quantity: item.quantity,
                    unitPrice,
                    damageWaiverFee
                };
            });

            // Tính tổng tiền motorbike
            const motorbikeTotal = motorbikeDetails.reduce(
                (sum, item) =>
                    sum + (item.unitPrice + item.damageWaiverFee) * item.quantity * rentalDays,
                0
            );

            // Tính phụ kiện
            const accessoryDetails = (bookingData.accessories || []).map(item => ({
                accessoryId: item.accessory._id,
                quantity: item.quantity
            }));

            const accessoryTotal = (bookingData.accessories || []).reduce(
                (sum, item) => sum + (item.accessory.price || 0) * item.quantity,
                0
            );

            let preDepositTotal = 0;
            let depositTotal = 0;
            for (const item of bookingData.motorbikes) {
                const motorbikeType = item.motorbikeType;
                preDepositTotal += motorbikeType.preDeposit * item.quantity;
                depositTotal += motorbikeType.deposit * item.quantity;
            }

            const grandTotal = Math.round((motorbikeTotal + accessoryTotal) * 100) / 100;

            // Payload gửi về server
            const payload = {
                branchReceive: bookingData.startBranch,
                branchReturn: bookingData.endBranch,
                receiveDate: startDate.toISOString(),
                returnDate: endDate.toISOString(),
                grandTotal,
                preDepositTotal,
                depositTotal,
                motorbikeDetails,
                accessoryDetails,
                tripContext: bookingData.tripContext || undefined
            };

            console.log('>>> FE payload gửi về:', payload);
            console.log('>>> FE grandTotal', grandTotal);
            console.log('>>> FE preDepositTotal', preDepositTotal);
            console.log('>>> FE depositTotal', depositTotal);
            const res = await axios.post(
                'http://localhost:8080/api/v1/customer/order/create',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (res.data.success) {
                message.success('Đặt đơn hàng thành công!');
                setBookingData({ motorbikes: [], motorbikeTypes: [] }); // Reset booking context
                navigate('/order/my-order');
            } else {
                message.error(res.data.message || 'Đặt đơn hàng thất bại');
            }

        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            message.error(error.response?.data?.message || 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };



    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={pageTitleStyle}>
                            Thanh toán đơn hàng
                        </h1>
                    </div>
                    <div style={{
                        maxWidth: 1000,
                        margin: '0 auto',
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        padding: 32,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 32
                    }}>
                        <CustomerInformation isLoggedIn={isLoggedIn} bookingData={bookingData} />
                        <OrderDetail />
                        <div style={{ marginTop: 16, textAlign: 'center' }}>
                            <PlaceOrderButton onClick={handlePlaceOrder} disabled={loading || !isLoggedIn} />
                        </div>
                    </div>
                </div>
            </Content>
        </Layout>
    )
}

export default CheckoutPage
