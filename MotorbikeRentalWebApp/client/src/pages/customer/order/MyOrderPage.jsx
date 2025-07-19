import React, { useEffect, useState } from 'react';
import { Table, Spin, Tag, Typography, Card } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const MyOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
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

    const columns = [
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
            title: 'Nhận xe',
            dataIndex: 'branchReceive',
            key: 'branchReceive',
            render: (branch) => branch?.city || 'N/A'
        },
        {
            title: 'Trả xe',
            dataIndex: 'branchReturn',
            key: 'branchReturn',
            render: (branch) => branch?.city || 'N/A'
        },
        {
            title: 'Ngày nhận',
            dataIndex: 'receiveDate',
            key: 'receiveDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Ngày trả',
            dataIndex: 'returnDate',
            key: 'returnDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'grandTotal',
            key: 'grandTotal',
            render: (total) => total?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) =>
                record.status === 'pending' ? (
                    <button
                        style={{
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 16px',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                        onClick={() => {
                            // window.alert('Chức năng thanh toán đang phát triển');
                            navigate(`/order/my-order/${record._id}`);
                        }}
                    >
                        Thanh toán phí đặt trước
                    </button>
                ) : null
        }
    ];

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
            <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <Title level={2} style={{ color: 'white', margin: 0 }}>Đơn hàng của tôi</Title>
            </Card>
            {loading ? (
                <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />
            ) : error ? (
                <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>
            ) : (
                <Table
                    columns={columns}
                    dataSource={orders}
                    rowKey="_id"
                    pagination={{ pageSize: 8 }}
                    bordered
                />
            )}
        </div>
    );
};

export default MyOrderPage;
