import React, { useEffect, useState } from 'react';
import { Table, Spin, Tag, Typography, Card, message, Modal, Button, Dropdown, Menu, Layout, Tabs } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Table as AntTable } from 'antd';
import HeaderBar from '../../../components/HeaderBar';
import Footer from '../../../components/Footer';
import BackButton from '../../../components/BackButton';

const { Title } = Typography;

const MyOrderPage = () => {
    // Group orders by status
    const groupOrdersByStatus = (orders) => {
        const grouped = {
            pending: [],
            confirmed: [],
            active: [],
            completed: [],
            cancelled: []
        };

        orders.forEach(order => {
            if (grouped[order.status]) {
                grouped[order.status].push(order);
            }
        });

        return grouped;
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Chờ thanh toán';
            case 'confirmed': return 'Đã xác nhận';
            case 'active': return 'Đang sử dụng';
            case 'completed': return 'Đã hoàn thành';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };


    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    // Removed unused selectedOrder state
    const [orderDetail, setOrderDetail] = useState(null);
    const [motorbikeDetails, setMotorbikeDetails] = useState([]);
    const [accessoryDetails, setAccessoryDetails] = useState([]);
    const [feedbacks, setFeedbacks] = useState({}); // { [orderId]: feedback }
    const [documentStatus, setDocumentStatus] = useState({}); // { [orderId]: isCompleted }
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
                    // Fetch feedbacks for completed orders
                    const completedOrders = (data.rentalOrders || []).filter(o => o.status === 'completed');
                    const feedbackResults = {};
                    await Promise.all(completedOrders.map(async (order) => {
                        try {
                            const resFb = await fetch(`http://localhost:8080/api/v1/customer/order/${order._id}/feedback`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (resFb.ok) {
                                const fbData = await resFb.json();
                                if (fbData.success && fbData.feedback) {
                                    feedbackResults[order._id] = fbData.feedback;
                                }
                            }
                        } catch { /* ignore feedback fetch error */ }
                    }));
                    setFeedbacks(feedbackResults);

                    // Fetch document status for all orders
                    const allOrders = (data.rentalOrders || []);
                    const documentResults = {};
                    await Promise.all(allOrders.map(async (order) => {
                        try {
                            const resDoc = await fetch(`http://localhost:8080/api/v1/customer/order/${order._id}/documents/status`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (resDoc.ok) {
                                const docData = await resDoc.json();
                                if (docData.success) {
                                    documentResults[order._id] = docData.isCompleted || false;
                                }
                            }
                        } catch {
                            // If document status endpoint doesn't exist, assume not completed
                            documentResults[order._id] = false;
                        }
                    }));
                    setDocumentStatus(documentResults);
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

                // Always show document button for all order statuses
                const isDocumentsCompleted = documentStatus[record._id];

                actions.push(
                    <Button
                        key="documents"
                        style={{
                            background: isDocumentsCompleted
                                ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
                                : 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontWeight: '600',
                            minWidth: '180px',
                            marginBottom: '8px',
                            height: '40px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => {
                            navigate(`/order/documents/${record._id}`);
                        }}
                        block
                    >
                        {isDocumentsCompleted ? 'Xem hình ảnh giấy tờ' : 'Cung cấp hình ảnh giấy tờ'}
                    </Button>
                );

                // Show payment button only for pending orders with completed documents
                if (record.status === 'pending' && isDocumentsCompleted) {
                    actions.push(
                        <Button
                            key="pay"
                            style={{
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontWeight: '600',
                                minWidth: '180px',
                                marginBottom: '8px',
                                height: '40px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                transition: 'all 0.3s ease'
                            }}
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
                            style={{
                                background: 'linear-gradient(135deg, #ff4d4f 0%, #a8071a 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 16px',
                                fontWeight: '600',
                                minWidth: '140px',
                                marginBottom: '8px',
                                height: '40px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                transition: 'all 0.3s ease'
                            }}
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

                // Add Đánh giá button or feedback dropdown for completed orders
                if (record.status === 'completed') {
                    if (feedbacks[record._id]) {
                        // Show dropdown with rating and comment
                        const fb = feedbacks[record._id];
                        actions.push(
                            <Dropdown
                                key="rated"
                                overlay={
                                    <Menu>
                                        <Menu.Item key="score">
                                            <span><b>Điểm hài lòng:</b> <span style={{ color: '#faad14' }}>{'★'.repeat(fb.satisfactionScore)}{'☆'.repeat(5 - fb.satisfactionScore)}</span></span>
                                        </Menu.Item>
                                        <Menu.Item key="comment">
                                            <span><b>Nhận xét:</b> {fb.comment}</span>
                                        </Menu.Item>
                                    </Menu>
                                }
                                placement="bottom"
                            >
                                <Button style={{
                                    background: '#f6ffed',
                                    color: '#52c41a',
                                    border: '1px solid #b7eb8f',
                                    borderRadius: '8px',
                                    minWidth: '120px',
                                    height: '40px',
                                    fontWeight: '600',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease'
                                }} block>
                                    Đã đánh giá
                                </Button>
                            </Dropdown>
                        );
                    } else {
                        actions.push(
                            <Button
                                key="rate"
                                style={{
                                    background: 'linear-gradient(135deg, #fadb14 0%, #fa8c16 100%)',
                                    color: '#333',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '8px 16px',
                                    fontWeight: '600',
                                    minWidth: '120px',
                                    height: '40px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={() => navigate(`/order/rate/${record._id}`)}
                                block
                            >
                                Đánh giá
                            </Button>
                        );
                    }
                }
                actions.push(
                    <Button
                        key="details"
                        type="primary"
                        style={{
                            minWidth: '120px',
                            marginBottom: record.status === 'completed' ? 8 : 0,
                            height: '40px',
                            borderRadius: '8px',
                            fontWeight: '600',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => handleShowDetail(record)}
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

    const handleShowDetail = async (record) => {
        setModalVisible(true);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:8080/api/v1/customer/order/${record._id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const data = await res.json();
            console.log('Order detail response:', data);
            if (data.success && data.rentalOrder) {
                console.log('Rental order motorbikes:', data.rentalOrder.motorbikes);
                setOrderDetail({
                    ...data.rentalOrder,
                    motorbikesByType: data.motorbikesByType || {}
                });
                setMotorbikeDetails(data.motorbikeDetails || []);
                setAccessoryDetails(data.accessoryDetails || []);
            } else {
                setOrderDetail(record);
                setMotorbikeDetails([]);
                setAccessoryDetails([]);
            }
        } catch {
            setOrderDetail(record);
            setMotorbikeDetails([]);
            setAccessoryDetails([]);
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Layout.Content style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ marginBottom: 24 }}>
                        <BackButton path={"/"} />
                    </div>
                    <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                        <Title className="text-center" level={2} style={{ color: 'white', margin: 0 }}>Đơn hàng của tôi</Title>
                    </Card>
                    <Typography.Text type="warning" style={{ display: 'block', marginBottom: 16 }}>
                        Lưu ý:
                        <p>
                            - Quý khách hủy đơn sẽ phải đến chi nhánh gần nhất để được hoàn lại khoản phí đã thanh toán. <br />
                            - Những đơn hàng chưa thanh toán trong vòng 6 tiếng sẽ bị hủy tự động.  <br />
                            - Quý khách sẽ trả toàn bộ khoản phí còn lại khi nhận xe.
                        </p>
                    </Typography.Text>
                    {loading ? (
                        <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />
                    ) : error ? (
                        <div style={{ color: 'red', textAlign: 'center', marginTop: 40 }}>{error}</div>
                    ) : (
                        <Tabs
                            defaultActiveKey="all"
                            style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}
                            items={[
                                {
                                    key: 'all',
                                    label: `Tất cả (${orders.length})`,
                                    children: (
                                        <Table
                                            columns={moneyColumns}
                                            dataSource={orders}
                                            rowKey="_id"
                                            pagination={{ pageSize: 8 }}
                                            bordered
                                            style={{ background: '#fff', borderRadius: 12 }}
                                        />
                                    )
                                },
                                ...Object.entries(groupOrdersByStatus(orders)).map(([status, statusOrders]) => ({
                                    key: status,
                                    label: (
                                        <span>
                                            {getStatusLabel(status)} ({statusOrders.length})
                                        </span>
                                    ),
                                    children: statusOrders.length > 0 ? (
                                        <Table
                                            columns={moneyColumns}
                                            dataSource={statusOrders}
                                            rowKey="_id"
                                            pagination={{ pageSize: 8 }}
                                            bordered
                                            style={{ background: '#fff', borderRadius: 12 }}
                                        />
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                            Không có đơn hàng nào ở trạng thái "{getStatusLabel(status)}"
                                        </div>
                                    )
                                }))
                            ]}
                        />
                    )}
                    <Modal
                        title="Chi tiết đơn hàng"
                        visible={modalVisible}
                        onCancel={() => { setModalVisible(false); setOrderDetail(null); }}
                        footer={null}
                    >
                        {orderDetail && (
                            <div style={{ lineHeight: 2 }}>
                                {/* <div style={{ marginBottom: '16px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
                                Debug: Order has {orderDetail.motorbikes?.length || 0} motorbikes
                            </div> */}
                                <div><b>Mã đơn:</b> {orderDetail.orderCode}</div>
                                <div><b>Trạng thái:</b> <Tag color={
                                    orderDetail.status === 'pending' ? 'orange' :
                                        orderDetail.status === 'confirmed' ? 'blue' :
                                            orderDetail.status === 'active' ? 'green' :
                                                orderDetail.status === 'completed' ? 'purple' :
                                                    orderDetail.status === 'cancelled' ? 'red' : 'default'
                                }>{
                                        orderDetail.status === 'pending' ? 'Chờ thanh toán' :
                                            orderDetail.status === 'confirmed' ? 'Đã xác nhận' :
                                                orderDetail.status === 'active' ? 'Đang sử dụng' :
                                                    orderDetail.status === 'completed' ? 'Đã hoàn thành' :
                                                        orderDetail.status === 'cancelled' ? 'Đã hủy' : orderDetail.status
                                    }</Tag></div>
                                <div><b>Nhận xe:</b> {orderDetail.branchReceive?.city || 'N/A'}</div>
                                <div><b>Trả xe:</b> {orderDetail.branchReturn?.city || 'N/A'}</div>
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
                                                {
                                                    title: 'Mã xe',
                                                    key: 'motorbikeCodes',
                                                    render: (_, r) => {
                                                        // Use the new motorbikesByType structure if available
                                                        const typeId = r.motorbikeTypeId?._id;
                                                        if (typeId && orderDetail?.motorbikesByType && orderDetail.motorbikesByType[typeId]) {
                                                            const codes = orderDetail.motorbikesByType[typeId].codes;
                                                            if (codes && codes.length > 0) {
                                                                return (
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                        {codes.map((code, index) => (
                                                                            <span
                                                                                key={index}
                                                                                style={{
                                                                                    background: '#e8f5e8',
                                                                                    color: '#2d5a2d',
                                                                                    padding: '2px 6px',
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '12px',
                                                                                    fontWeight: '600',
                                                                                    border: '1px solid #b7eb8f'
                                                                                }}
                                                                            >
                                                                                {code}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                );
                                                            }
                                                        }

                                                        // Fallback to old logic if motorbikesByType is not available
                                                        const orderMotorbikes = orderDetail?.motorbikes || [];
                                                        const typeMotorbikes = orderMotorbikes.filter(mb =>
                                                            mb.motorbikeTypeId._id === r.motorbikeTypeId._id
                                                        );

                                                        if (typeMotorbikes.length > 0) {
                                                            return (
                                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                    {typeMotorbikes.map((mb, index) => (
                                                                        <span
                                                                            key={index}
                                                                            style={{
                                                                                background: '#e8f5e8',
                                                                                color: '#2d5a2d',
                                                                                padding: '2px 6px',
                                                                                borderRadius: '4px',
                                                                                fontSize: '12px',
                                                                                fontWeight: '600',
                                                                                border: '1px solid #b7eb8f'
                                                                            }}
                                                                        >
                                                                            {mb.motorbikeId?.code || `MB${String(index + 1).padStart(3, '0')}`}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            );
                                                        }
                                                        return '-';
                                                    }
                                                },
                                                { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: v => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) },
                                                { title: 'Miễn trừ thiệt hại', dataIndex: 'damageWaiverFee', key: 'damageWaiverFee', render: v => v ? v.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-' },
                                                {
                                                    title: 'Tổng cộng',
                                                    key: 'total',
                                                    render: (_, r) => {
                                                        if (!r.unitPrice || !r.quantity) return '-';
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
                                                            // duration = endTime.diff(startTime, 'day') + 1;
                                                            const durationInDays = endTime.diff(startTime, 'day', true);
                                                            const roundedDuration = Math.ceil(durationInDays);
                                                            duration = roundedDuration <= 0 ? 1 : roundedDuration;
                                                        } else {
                                                            duration = 1;
                                                        }
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
                                                { title: 'Tên phụ kiện', dataIndex: ['accessoryId', 'name'], key: 'name', render: (_, r) => r.accessoryId?.name || '-' },
                                                { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
                                                { title: 'Đơn giá', dataIndex: ['accessoryId', 'price'], key: 'price', render: (_, r) => r.accessoryId?.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '-' },
                                                { title: 'Tổng', key: 'total', render: (_, r) => (r.accessoryId?.price && r.quantity) ? (r.accessoryId.price * r.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '-' }
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
                        )}
                    </Modal>
                </div>
            </Layout.Content>
            <Footer />
        </Layout>
    );
};

export default MyOrderPage;
