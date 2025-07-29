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
import PickAddress from './components/PickAddress';
import dayjs from 'dayjs';

const { Content } = Layout
const token = localStorage.getItem('token');

const pageTitleStyle = {
    textAlign: 'center',
    margin: '0px auto 40px auto',
    color: 'white',
    fontSize: '32px',
    fontWeight: '700',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px 30px',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 10,
    letterSpacing: '0.5px'
};

const CheckoutPage = () => {
    const { bookingData, setBookingData } = useBooking();
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [receiveAddress, setReceiveAddress] = useState('');
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

            if (!receiveAddress || receiveAddress.trim() === '') {
                message.error('Vui lòng chọn địa chỉ nhận xe');
                return;
            }

            // const startDate = new Date(`${bookingData.startDate}T${bookingData.startTime}`);
            // const startDate = dayjs(bookingData.startDate).startOf('day');
            // const endDate = dayjs(bookingData.endDate).startOf('day');
            // const now = dayjs().startOf('day');

            //     const startDateTime = dayjs(`${bookingData.startDate}T${bookingData.startTime}`);
            // const endDateTime = dayjs(`${bookingData.endDate}T${bookingData.endTime}`);

            // const durationInDays = endDateTime.diff(startDateTime, 'day', true); // tính số ngày có phần thập phân
            // const roundedDuration = Math.ceil(durationInDays); // làm tròn lên

            // return roundedDuration <= 0 ? 1 : roundedDuration;

            const startDate = dayjs(`${bookingData.startDate}T${bookingData.startTime}`);
            const endDate = dayjs(`${bookingData.endDate}T${bookingData.endTime}`);
            const durationInDays = endDate.diff(startDate, 'day', true);
            const roundedDuration = Math.ceil(durationInDays);
            const now = dayjs().startOf('day');

            if (startDate <= now) {
                message.error('Thời gian nhận xe phải lớn hơn hiện tại');
                return;
            }

            if (endDate <= startDate) {
                message.error('Thời gian trả xe phải lớn hơn thời gian nhận xe');
                return;
            }

            // const rentalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            // const rentalDays = endDate.diff(startDate, 'day') + 1;
            // const rentalDays = endDate.diff(startDate, 'day', true) + 1;
            const rentalDays = roundedDuration <= 0 ? 1 : roundedDuration;
            console.log('>>> FE rentalDays', rentalDays);
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
                    damageWaiverFee,
                    hasDamageWaiver: item.hasDamageWaiver // Include damage waiver status
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
                receiveAddress,
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

    const handleAddressPicked = ({ address }) => {
        setReceiveAddress(address);
        console.log('Selected address:', address);
    };



    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{
                padding: '32px 24px',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh'
            }}>
                <div style={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    padding: '0 16px'
                }}>
                    <div style={{ marginBottom: 32 }}>
                        <h1 style={pageTitleStyle}>
                            Thanh toán đơn hàng
                        </h1>
                    </div>
                    <div style={{
                        maxWidth: 1000,
                        margin: '0 auto',
                        background: '#fff',
                        borderRadius: 20,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
                        padding: window.innerWidth <= 768 ? '24px 20px' : '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: window.innerWidth <= 768 ? 24 : 40,
                        border: '1px solid #f0f0f0'
                    }}>
                        <CustomerInformation isLoggedIn={isLoggedIn} bookingData={bookingData} />

                        <div style={{
                            borderBottom: '2px solid #f0f0f0',
                            paddingBottom: '20px',
                            marginBottom: '20px'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#1f2937',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#667eea' }}>
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                                Chọn địa điểm nhận xe
                            </h2>
                            <PickAddress onAddressPicked={handleAddressPicked} />
                            {receiveAddress && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)',
                                    border: '2px solid #b3d9ff',
                                    borderRadius: '12px',
                                    padding: '16px 20px',
                                    marginTop: '16px',
                                    boxShadow: '0 2px 8px rgba(179, 217, 255, 0.3)'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#2563eb' }}>
                                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <strong style={{ color: '#1e40af', fontSize: '16px' }}>Địa chỉ đã chọn:</strong>
                                    </div>
                                    <div style={{ color: '#374151', fontSize: '15px', lineHeight: '1.5' }}>
                                        {receiveAddress}
                                    </div>
                                </div>
                            )}
                        </div>
                        <OrderDetail />
                        <div style={{
                            marginTop: 32,
                            textAlign: 'center',
                            paddingTop: 24,
                            borderTop: '2px solid #f0f0f0'
                        }}>
                            <PlaceOrderButton onClick={handlePlaceOrder} disabled={loading || !isLoggedIn} />
                        </div>
                    </div>
                </div>
            </Content>
        </Layout>
    )
}

export default CheckoutPage
