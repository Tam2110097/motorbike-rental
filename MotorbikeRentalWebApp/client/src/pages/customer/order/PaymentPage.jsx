import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Spin, Button, Descriptions, message } from 'antd';
import dayjs from 'dayjs';
import HeaderBar from '../../../components/HeaderBar';
import Footer from '../../../components/Footer';
import BackButton from '../../../components/BackButton';

const { Title } = Typography;

const PaymentPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`http://localhost:8080/api/v1/customer/order/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setOrder(data.rentalOrder);
                } else {
                    setError(data.message || 'Không thể lấy thông tin đơn hàng.');
                }
            } catch {
                setError('Lỗi khi tải thông tin đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchOrder();
    }, [id]);

    const handlePayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/v1/vnpay/create_payment_url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    orderId: order._id,
                    amount: order.preDepositTotal
                })
            });

            const data = await res.json();
            if (data && data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                message.error('Không thể tạo liên kết thanh toán.');
            }
        } catch (error) {
            message.error('Lỗi khi tạo thanh toán: ' + error.message);
        }
    };


    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <HeaderBar />
            <div style={{ flex: 1, padding: 24, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <BackButton path={'/order/my-order'} />
                    <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <Title className='text-center' level={2} style={{ color: 'white', margin: 0 }}>Thanh toán đơn hàng</Title>
                    </Card>
                    {loading ? (
                        <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />
                    ) : error ? (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>
                    ) : order ? (
                        <Card bordered>
                            <Descriptions title="Thông tin đơn hàng" column={1}>
                                <Descriptions.Item label="Mã đơn">{order.orderCode}</Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {order.status === 'pending' ? 'Chờ thanh toán' : order.status}
                                </Descriptions.Item>
                                <Descriptions.Item label="Nhận xe">{order.branchReceive?.city || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Trả xe">{order.branchReturn?.city || 'N/A'}</Descriptions.Item>
                                <Descriptions.Item label="Ngày nhận">{dayjs(order.receiveDate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                                <Descriptions.Item label="Ngày trả">{dayjs(order.returnDate).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền">
                                    {order.preDepositTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </Descriptions.Item>
                            </Descriptions>
                            <div style={{ textAlign: 'center', marginTop: 24 }}>
                                <Button type="primary" size="large" onClick={handlePayment} disabled={order.status !== 'pending'}>
                                    Thanh toán phí đặt trước
                                </Button>
                            </div>
                        </Card>
                    ) : null}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PaymentPage;