import React, { useEffect, useState, useRef } from 'react';
import { Table, Card, Button, Tag, message, Spin, Row, Col, Modal, Tabs } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Table as AntTable } from 'antd';

const statusMap = {
    pending: { label: 'Chờ thanh toán', color: 'orange' },
    confirmed: { label: 'Đã xác nhận', color: 'blue' },
    active: { label: 'Đang sử dụng', color: 'green' },
    completed: { label: 'Đã hoàn thành', color: 'purple' },
    cancelled: { label: 'Đã hủy', color: 'red' }
};

const statusOrder = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

// Add a countdown component
const RentalCountdown = ({ returnDate }) => {
    const [now, setNow] = useState(Date.now());
    const intervalRef = useRef();
    useEffect(() => {
        intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(intervalRef.current);
    }, []);
    const end = new Date(returnDate).getTime();
    const current = now;
    let remaining = end - current;
    if (remaining < 0) remaining = 0;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    // const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    // const seconds = Math.floor((remaining / 1000) % 60);
    return (
        <div style={{ color: remaining === 0 ? 'red' : '#1890ff', fontWeight: 500, marginBottom: 8 }}>
            {/* {remaining === 0 ? 'Đã hết hạn thuê!' : `Còn lại: ${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`} */}
            {remaining === 0 ? 'Đã hết hạn thuê!' : `Còn lại: ${days}d${hours}h`}
        </div>
    );
};

const OrderPage = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    // const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [orderDetail, setOrderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [refundModal, setRefundModal] = useState({ visible: false, amount: 0 });
    const [motorbikeDetails, setMotorbikeDetails] = useState([]);
    const [accessoryDetails, setAccessoryDetails] = useState([]);

    // Pagination state for each status
    const [pagination, setPagination] = useState(() => {
        const obj = {};
        statusOrder.forEach(status => {
            obj[status] = { current: 1, pageSize: 5 };
        });
        return obj;
    });

    // Handler for pagination change
    const handleTableChange = (status, page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            [status]: { current: page, pageSize }
        }));
    };

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/v1/employee/order/get-all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) setOrders(data.rentalOrders || []);
                else message.error(data.message || 'Không thể lấy danh sách đơn hàng.');
            } catch {
                message.error('Lỗi khi tải đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Group orders by status
    const grouped = statusOrder.reduce((acc, status) => {
        acc[status] = orders.filter(o => o.status === status);
        return acc;
    }, {});

    // Summary
    const summary = statusOrder.map(status => ({
        status,
        count: grouped[status]?.length || 0
    }));

    // Table columns
    const columns = [
        { title: 'Mã đơn', dataIndex: 'orderCode', key: 'orderCode', render: text => <b>{text}</b> },
        { title: 'Nhận xe', dataIndex: 'branchReceive', key: 'branchReceive', render: b => b?.city || 'N/A' },
        { title: 'Trả xe', dataIndex: 'branchReturn', key: 'branchReturn', render: b => b?.city || 'N/A' },
        { title: 'Ngày nhận', dataIndex: 'receiveDate', key: 'receiveDate', render: d => dayjs(d).format('DD/MM/YYYY HH:mm') },
        { title: 'Ngày trả', dataIndex: 'returnDate', key: 'returnDate', render: d => dayjs(d).format('DD/MM/YYYY HH:mm') },
        { title: 'Tổng tiền', dataIndex: 'grandTotal', key: 'grandTotal', render: v => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) },
        { title: 'Đặt cọc trước', dataIndex: 'preDepositTotal', key: 'preDepositTotal', render: v => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) },
        { title: 'Đặt cọc khi nhận xe', dataIndex: 'depositTotal', key: 'depositTotal', render: v => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => <Tag color={statusMap[status]?.color}>{statusMap[status]?.label || status}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                // Confirmed status: show 3 actions
                if (record.status === 'confirmed') {
                    const isPaid = record.isPaidFully;
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <Button
                                type="primary"
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`http://localhost:8080/api/v1/employee/order/${record._id}/mark-paid`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`
                                            },
                                            body: JSON.stringify({ isPaidFully: true })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            message.success('Đã hoàn thành thanh toán cho đơn này!');
                                            setOrders(prev => prev.map(o => o._id === record._id ? { ...o, isPaidFully: true } : o));
                                        } else {
                                            message.error(data.message || 'Cập nhật trạng thái thanh toán thất bại');
                                        }
                                    } catch {
                                        message.error('Lỗi khi cập nhật trạng thái thanh toán.');
                                    }
                                }}
                                disabled={isPaid}
                                style={{ minWidth: 180 }}
                                block
                            >
                                Hoàn thành thanh toán
                            </Button>
                            <Button
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`http://localhost:8080/api/v1/employee/order/${record._id}/check-in`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`
                                            }
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            message.success('Check-in thành công!');
                                            setOrders(prev => prev.map(o => o._id === record._id ? { ...o, status: 'active' } : o));
                                        } else {
                                            message.error(data.message || 'Check-in thất bại');
                                        }
                                    } catch {
                                        message.error('Lỗi khi check-in.');
                                    }
                                }}
                                disabled={!isPaid || !dayjs().isSame(dayjs(record.receiveDate), 'day')}
                                style={{ minWidth: 120 }}
                                block
                                title={!dayjs().isSame(dayjs(record.receiveDate), 'day') ? 'Chỉ có thể check-in vào ngày nhận xe' : undefined}
                            >
                                Check-in
                            </Button>
                            <Button
                                onClick={() => {
                                    message.success('Đã tạo hóa đơn!');
                                    setTimeout(() => navigate(`/employee/order/invoice/${record._id}`), 500);
                                }}
                                disabled={!isPaid}
                                style={{ minWidth: 120 }}
                                block
                            >
                                Tạo hóa đơn
                            </Button>
                            <Button
                                icon={<InfoCircleOutlined />}
                                onClick={async () => {
                                    setDetailLoading(true);
                                    setModalVisible(true);
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`http://localhost:8080/api/v1/employee/order/full-invoice/${record._id}`, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            setOrderDetail(data.invoice);
                                            setMotorbikeDetails(data.invoice.motorbikeDetails || []);
                                            setAccessoryDetails(data.invoice.accessories || []);
                                        } else {
                                            setOrderDetail(null);
                                            setMotorbikeDetails([]);
                                            setAccessoryDetails([]);
                                        }
                                    } catch {
                                        setOrderDetail(null);
                                        setMotorbikeDetails([]);
                                        setAccessoryDetails([]);
                                    } finally {
                                        setDetailLoading(false);
                                    }
                                }}
                                style={{ minWidth: 40 }}
                            />
                        </div>
                    );
                }
                // Active status: show checkout button
                if (record.status === 'active') {
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <RentalCountdown returnDate={record.returnDate} />
                            <Button
                                type="primary"
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`http://localhost:8080/api/v1/employee/order/${record._id}/checkout`, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                                Authorization: `Bearer ${token}`
                                            }
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            // Fetch updated order to check for refund
                                            const orderRes = await fetch(`http://localhost:8080/api/v1/employee/order/${record._id}`, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            const orderData = await orderRes.json();
                                            if (orderData.success && orderData.rentalOrder) {
                                                setOrders(prev => prev.map(o => o._id === record._id ? { ...o, status: 'completed', checkOutDate: orderData.rentalOrder.checkOutDate } : o));
                                                const checkOutDate = new Date(orderData.rentalOrder.checkOutDate);
                                                const returnDate = new Date(orderData.rentalOrder.returnDate);
                                                if (checkOutDate < returnDate) {
                                                    // 1. Create refund if early return
                                                    await fetch(`http://localhost:8080/api/v1/employee/refund/create/${record._id}`, {
                                                        method: 'POST',
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                    // 2. Fetch refund info
                                                    const refundRes = await fetch('http://localhost:8080/api/v1/employee/refund/all', {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    });
                                                    const refundData = await refundRes.json();
                                                    if (refundData.success && Array.isArray(refundData.refunds)) {
                                                        const refund = refundData.refunds.find(r => r.paymentId?.rentalOrderId === record._id && r.status === 'pending');
                                                        if (refund) {
                                                            setRefundModal({ visible: true, amount: refund.amount });
                                                        }
                                                    }
                                                }
                                            }
                                            message.success('Checkout thành công!');
                                        } else {
                                            message.error(data.message || 'Checkout thất bại');
                                        }
                                    } catch {
                                        message.error('Lỗi khi checkout.');
                                    }
                                }}
                                style={{ minWidth: 120 }}
                                block
                            >
                                Checkout
                            </Button>
                            <Button
                                onClick={() => {
                                    message.success('Đã tạo hóa đơn!');
                                    setTimeout(() => navigate(`/employee/order/invoice/${record._id}`), 500);
                                }}
                                style={{ minWidth: 120 }}
                                block
                            >
                                Tạo hóa đơn
                            </Button>
                            <Button
                                icon={<InfoCircleOutlined />}
                                onClick={async () => {
                                    setDetailLoading(true);
                                    setModalVisible(true);
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`http://localhost:8080/api/v1/employee/order/full-invoice/${record._id}`, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            setOrderDetail(data.invoice);
                                            setMotorbikeDetails(data.invoice.motorbikeDetails || []);
                                            setAccessoryDetails(data.invoice.accessories || []);
                                        } else {
                                            setOrderDetail(null);
                                            setMotorbikeDetails([]);
                                            setAccessoryDetails([]);
                                        }
                                    } catch {
                                        setOrderDetail(null);
                                        setMotorbikeDetails([]);
                                        setAccessoryDetails([]);
                                    } finally {
                                        setDetailLoading(false);
                                    }
                                }}
                                style={{ minWidth: 40 }}
                            />
                            <Modal
                                title="Hoàn tiền trả xe sớm"
                                visible={refundModal.visible}
                                onCancel={() => setRefundModal({ visible: false, amount: 0 })}
                                footer={null}
                            >
                                <div style={{ fontSize: 16, color: '#1890ff' }}>
                                    Đơn hàng trả xe sớm. Số tiền hoàn lại: <b>{refundModal.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</b>
                                </div>
                            </Modal>
                        </div>
                    );
                }
                // Default: only show info button
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        {/* <Button type="primary" onClick={() => { setModalVisible(true); }}>
                            Xem chi tiết
                        </Button> */}
                        <Button
                            icon={<InfoCircleOutlined />}
                            onClick={async () => {
                                setDetailLoading(true);
                                setModalVisible(true);
                                try {
                                    const token = localStorage.getItem('token');
                                    const res = await fetch(`http://localhost:8080/api/v1/employee/order/full-invoice/${record._id}`, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        setOrderDetail(data.invoice);
                                        setMotorbikeDetails(data.invoice.motorbikeDetails || []);
                                        setAccessoryDetails(data.invoice.accessories || []);
                                    } else {
                                        setOrderDetail(null);
                                        setMotorbikeDetails([]);
                                        setAccessoryDetails([]);
                                    }
                                } catch {
                                    setOrderDetail(null);
                                    setMotorbikeDetails([]);
                                    setAccessoryDetails([]);
                                } finally {
                                    setDetailLoading(false);
                                }
                            }}
                            style={{ minWidth: 40 }}
                        />
                    </div>
                );
            }
        }
    ];

    const tabItems = [
        { key: 'all', label: 'Tất cả', children: null },
        ...statusOrder.map(status => ({
            key: status,
            label: statusMap[status].label,
            children: null
        }))
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
            <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Quản lý đơn hàng</h1>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4}><Card><b>Tổng đơn</b><br />{orders.length}</Card></Col>
                {summary.map(s => (
                    <Col span={4} key={s.status}>
                        <Card>
                            <b>{statusMap[s.status].label}</b><br />
                            <span style={{ color: statusMap[s.status].color }}>{s.count}</span>
                        </Card>
                    </Col>
                ))}
            </Row>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                style={{ marginBottom: 24 }}
            />
            {loading ? <Spin size="large" style={{ display: 'block', margin: '60px auto' }} /> : (
                activeTab === 'all' ? (
                    statusOrder.map(status => (
                        <div key={status} style={{ marginBottom: 40 }}>
                            <h2 style={{ color: statusMap[status].color }}>{statusMap[status].label}</h2>
                            <Table
                                columns={columns}
                                dataSource={grouped[status].slice(
                                    (pagination[status].current - 1) * pagination[status].pageSize,
                                    pagination[status].current * pagination[status].pageSize
                                )}
                                rowKey="_id"
                                pagination={{
                                    current: pagination[status].current,
                                    pageSize: pagination[status].pageSize,
                                    total: grouped[status].length,
                                    showSizeChanger: true,
                                    onChange: (page, pageSize) => handleTableChange(status, page, pageSize),
                                    showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} đơn`
                                }}
                                bordered
                            />
                        </div>
                    ))
                ) : (
                    <Table
                        columns={columns}
                        dataSource={grouped[activeTab].slice(
                            (pagination[activeTab].current - 1) * pagination[activeTab].pageSize,
                            pagination[activeTab].current * pagination[activeTab].pageSize
                        )}
                        rowKey="_id"
                        pagination={{
                            current: pagination[activeTab].current,
                            pageSize: pagination[activeTab].pageSize,
                            total: grouped[activeTab].length,
                            showSizeChanger: true,
                            onChange: (page, pageSize) => handleTableChange(activeTab, page, pageSize),
                            showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} đơn`
                        }}
                        bordered
                    />
                )
            )}
            <Modal
                title="Chi tiết đơn hàng"
                visible={modalVisible}
                onCancel={() => { setModalVisible(false); setOrderDetail(null); }}
                footer={null}
                width={800}
            >
                {detailLoading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> : orderDetail ? (
                    <div style={{ lineHeight: 2 }}>
                        <div><b>Mã đơn:</b> {orderDetail.orderCode}</div>
                        <div><b>Trạng thái:</b> <Tag color={statusMap[orderDetail.status]?.color}>{statusMap[orderDetail.status]?.label || orderDetail.status}</Tag></div>
                        <div><b>Nhận xe:</b> {orderDetail.branchReceive?.city || 'N/A'} - {orderDetail.branchReceive?.address || ''}</div>
                        <div><b>Trả xe:</b> {orderDetail.branchReturn?.city || 'N/A'} - {orderDetail.branchReturn?.address || ''}</div>
                        <div><b>Ngày nhận:</b> {dayjs(orderDetail.receiveDate).format('DD/MM/YYYY HH:mm')}</div>
                        <div><b>Ngày trả:</b> {dayjs(orderDetail.returnDate).format('DD/MM/YYYY HH:mm')}</div>
                        <div><b>Tổng tiền:</b> {orderDetail.grandTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                        <div><b>Đặt cọc trước:</b> {orderDetail.preDepositTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                        <div><b>Đặt cọc khi nhận xe:</b> {orderDetail.depositTotal?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                        {/* Motorbikes table */}
                        {motorbikeDetails && motorbikeDetails.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <b>Danh sách xe:</b>
                                <AntTable
                                    columns={[
                                        { title: 'Tên xe', dataIndex: ['motorbikeTypeId', 'name'], key: 'type', render: (_, r) => r.motorbikeTypeId?.name || '-' },
                                        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                                        { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: v => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) },
                                        { title: 'Miễn trừ thiệt hại', dataIndex: 'damageWaiverFee', key: 'damageWaiverFee', render: v => v ? v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-' },
                                        {
                                            title: 'Tổng cộng', key: 'total', render: (_, r) => {
                                                let duration;
                                                let startTime, endTime;
                                                if (orderDetail.startTime && orderDetail.endTime) {
                                                    startTime = dayjs(`${orderDetail.receiveDate}T${orderDetail.startTime}`);
                                                    endTime = dayjs(`${orderDetail.returnDate}T${orderDetail.endTime}`);
                                                } else {
                                                    startTime = dayjs(orderDetail.receiveDate);
                                                    endTime = dayjs(orderDetail.returnDate);
                                                }
                                                if (startTime.isValid() && endTime.isValid()) {
                                                    duration = endTime.diff(startTime, 'day') + 1;
                                                } else {
                                                    duration = 1;
                                                }
                                                if (!r.unitPrice || !r.quantity) return '-';
                                                const totalPerDay = r.unitPrice + (r.damageWaiverFee || 0);
                                                const total = totalPerDay * r.quantity * duration;
                                                return total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
                                            }
                                        }
                                    ]}
                                    dataSource={motorbikeDetails}
                                    rowKey={(_, idx) => idx}
                                    pagination={false}
                                    size="small"
                                    style={{ marginTop: 8, marginBottom: 8 }}
                                />
                            </div>
                        )}
                        {/* Accessories table */}
                        {accessoryDetails && accessoryDetails.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <b>Phụ kiện thuê thêm:</b>
                                <AntTable
                                    columns={[
                                        { title: 'Tên phụ kiện', dataIndex: ['accessory', 'name'], key: 'name', render: (_, r) => r.accessory?.name || '-' },
                                        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                                        { title: 'Đơn giá', dataIndex: ['accessory', 'price'], key: 'price', render: (_, r) => r.accessory?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '-' },
                                        { title: 'Tổng', key: 'total', render: (_, r) => (r.accessory?.price && r.quantity) ? (r.accessory.price * r.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-' }
                                    ]}
                                    dataSource={accessoryDetails}
                                    rowKey={(_, idx) => idx}
                                    pagination={false}
                                    size="small"
                                    style={{ marginTop: 8, marginBottom: 8 }}
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div>Không tìm thấy chi tiết đơn hàng.</div>
                )}
            </Modal>
        </div>
    );
};

export default OrderPage;
