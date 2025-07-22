import React, { useEffect, useState } from 'react';
import { Table, Spin, Tag, Typography, Card, message, Modal, Button } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';

const { Title } = Typography;

const MyOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = queryString.parse(location.search);
    const orderCode = searchParams.orderCode;
    const vnpStatus = searchParams.vnp_status;

    console.log('>>>>>>>orderCode', orderCode);
    console.log('>>>>>>>vnpStatus', vnpStatus);

    if (orderCode && vnpStatus) {
        if (vnpStatus === 'success') {
            message.success('Thanh toán thành công');
        } else {
            message.error('Thanh toán thất bại');
        }

        // Clear query params khỏi URL để tránh chạy lại
        const cleanUrl = location.pathname;
        navigate(cleanUrl, { replace: true });
    }


    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) {
                    setError('Không tìm thấy thông tin người dùng.');
                    setLoading(false);
                    return;
                }
                const res = await fetch(`http://localhost:8080/api/v1/customer/order/get-all`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setOrders(data.rentalOrders || []);
                } else {
                    setError(data.message || 'Không thể lấy danh sách đơn hàng.');
                }
            } catch {
                setError('Lỗi khi tải đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const moneyColumns = [
        {
            title: 'Mã đơn',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text) => <b>{text}</b>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let value = status;
                if (status === 'pending') {
                    value = 'Chờ thanh toán';
                    color = 'orange';
                }
                else if (status === 'confirmed') {
                    value = 'Đã xác nhận';
                    color = 'blue';
                }
                else if (status === 'active') {
                    value = 'Đang sử dụng';
                    color = 'green';
                }
                else if (status === 'completed') {
                    value = 'Đã hoàn thành';
                    color = 'purple';
                }
                else if (status === 'cancelled') {
                    value = 'Đã hủy';
                    color = 'red';
                }
                return <Tag color={color}>{value}</Tag>;
            }
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'grandTotal',
            key: 'grandTotal',
            render: (total) => total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        },
        {
            title: 'Đặt cọc trước',
            dataIndex: 'preDepositTotal',
            key: 'preDepositTotal',
            render: (value) => value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        },
        {
            title: 'Đặt cọc khi nhận xe',
            dataIndex: 'depositTotal',
            key: 'depositTotal',
            render: (value) => value?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                const actions = [];
                if (record.status === 'pending') {
                    actions.push(
                        <Button
                            key="pay"
                            style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 16px', fontWeight: 600, minWidth: 180, marginBottom: 8 }}
                            onClick={() => {
                                navigate(`/order/my-order/${record._id}`);
                            }}
                            block
                        >
                            Thanh toán phí đặt trước
                        </Button>
                    );
                } else if (record.status === 'confirmed') {
                    actions.push(
                        <Button
                            key="cancel"
                            style={{ background: 'linear-gradient(135deg, #ff4d4f 0%, #a8071a 100%)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, minWidth: 140, marginBottom: 8 }}
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('token');
                                    const res = await fetch(`http://localhost:8080/api/v1/customer/order/${record._id}/cancel`, {
                                        method: 'PUT',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${token}`
                                        }
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        message.success('Đã hủy đơn hàng thành công');
                                        setOrders((prev) => prev.map(o => o._id === record._id ? { ...o, status: 'cancelled' } : o));
                                    } else {
                                        message.error(data.message || 'Hủy đơn hàng thất bại');
                                    }
                                } catch {
                                    message.error('Lỗi khi hủy đơn hàng.');
                                }
                            }}
                            block
                        >
                            Hủy đơn hàng
                        </Button>
                    );
                }
                actions.push(
                    <Button
                        key="details"
                        type="primary"
                        style={{ minWidth: 120 }}
                        onClick={() => { setSelectedOrder(record); setModalVisible(true); }}
                        block
                    >
                        Xem chi tiết
                    </Button>
                );
                return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>{actions}</div>;
            }
        },
    ];

    // Handler for choosing payment method
    // const handleChoosePaymentMethod = (order) => {
    //     // You can navigate to a payment selection page or open a modal here
    //     // For now, just show a message
    //     message.info(`Chọn phương thức thanh toán cho đơn ${order.orderCode}`);
    //     // Example: navigate(`/order/payment-method/${order._id}`);
    // };

    return (
        <>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
                <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <Title level={2} style={{ color: 'white', margin: 0 }}>Đơn hàng của tôi</Title>
                </Card>
                <Typography.Text type="warning" style={{ display: 'block', marginBottom: 16 }}>
                    Lưu ý:
                    <p>
                        - Quý khách hủy đơn sẽ phải đến chi nhánh gần nhất để được hoàn lại khoản phí đã thanh toán. <br />
                        - Những đơn hàng chưa thanh toán trong vòng 8 tiếng sẽ bị hủy tự động.  <br />
                        - Quý khách sẽ trả toàn bộ khoản phí còn lại khi nhận xe.
                    </p>
                </Typography.Text>
                {loading ? (
                    <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />
                ) : error ? (
                    <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>
                ) : (
                    <Table
                        columns={moneyColumns}
                        dataSource={orders}
                        rowKey="_id"
                        pagination={{ pageSize: 8 }}
                        bordered
                        style={{ background: '#fff', borderRadius: 12 }}
                    />
                )}
                <Modal
                    title="Chi tiết đơn hàng"
                    visible={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                >
                    {selectedOrder && (
                        <div style={{ lineHeight: 2 }}>
                            <div><b>Mã đơn:</b> {selectedOrder.orderCode}</div>
                            <div><b>Trạng thái:</b> <Tag color={
                                selectedOrder.status === 'pending' ? 'orange' :
                                    selectedOrder.status === 'confirmed' ? 'blue' :
                                        selectedOrder.status === 'active' ? 'green' :
                                            selectedOrder.status === 'completed' ? 'purple' :
                                                selectedOrder.status === 'cancelled' ? 'red' : 'default'
                            }>{
                                    selectedOrder.status === 'pending' ? 'Chờ thanh toán' :
                                        selectedOrder.status === 'confirmed' ? 'Đã xác nhận' :
                                            selectedOrder.status === 'active' ? 'Đang sử dụng' :
                                                selectedOrder.status === 'completed' ? 'Đã hoàn thành' :
                                                    selectedOrder.status === 'cancelled' ? 'Đã hủy' : selectedOrder.status
                                }</Tag></div>
                            <div><b>Nhận xe:</b> {selectedOrder.branchReceive?.city || 'N/A'}</div>
                            <div><b>Trả xe:</b> {selectedOrder.branchReturn?.city || 'N/A'}</div>
                            <div><b>Ngày nhận:</b> {dayjs(selectedOrder.receiveDate).format('DD/MM/YYYY HH:mm')}</div>
                            <div><b>Ngày trả:</b> {dayjs(selectedOrder.returnDate).format('DD/MM/YYYY HH:mm')}</div>
                            <div><b>Tổng tiền:</b> {selectedOrder.grandTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                            <div><b>Đặt cọc trước:</b> {selectedOrder.preDepositTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                            <div><b>Đặt cọc khi nhận xe:</b> {selectedOrder.depositTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                        </div>
                    )}
                </Modal>
            </div>
        </>
    );
};

export default MyOrderPage;
