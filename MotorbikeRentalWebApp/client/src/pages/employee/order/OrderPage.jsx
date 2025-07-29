import React, { useEffect, useState, useRef } from 'react';
import { Table, Card, Button, Tag, message, Spin, Row, Col, Modal, Tabs, Select, Input, Typography, Upload } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Table as AntTable } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const statusMap = {
    pending: { label: 'Chờ thanh toán', color: 'orange' },
    confirmed: { label: 'Đã xác nhận', color: 'blue' },
    active: { label: 'Đang sử dụng', color: 'green' },
    completed: { label: 'Đã hoàn thành', color: 'purple' },
    cancelled: { label: 'Đã hủy', color: 'red' }
};

const statusOrder = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];

// Utility function to calculate remaining time for refund
const calculateRemainingTime = (returnDate) => {
    const now = dayjs();
    const plannedReturn = dayjs(returnDate);
    const remainingHours = plannedReturn.diff(now, 'hour', true);
    const remainingDays = Math.floor(remainingHours / 24);
    const remainingHoursInDay = remainingHours % 24;

    return {
        remainingHours,
        remainingDays,
        remainingHoursInDay: Math.floor(remainingHoursInDay),
        canRefund: remainingDays >= 1
    };
};

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
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);

    return (
        <div style={{ color: remaining === 0 ? 'red' : '#1890ff', fontWeight: 500, marginBottom: 8 }}>
            {remaining === 0 ? 'Đã hết hạn thuê!' : `Còn lại: ${days}d ${hours}h ${minutes}m ${seconds}s`}
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
    const [refundModal, setRefundModal] = useState({ visible: false, amount: 0, remainingDays: 0, remainingHours: 0 });
    const [motorbikeDetails, setMotorbikeDetails] = useState([]);
    const [accessoryDetails, setAccessoryDetails] = useState([]);
    const [documentModal, setDocumentModal] = useState({ visible: false, orderId: null, documents: null });
    const [orderRefunds, setOrderRefunds] = useState({});
    const [highlightedOrder, setHighlightedOrder] = useState(null);
    const [maintenanceModal, setMaintenanceModal] = useState({ visible: false, orderId: null, motorbikes: [], maintenanceLevels: {}, selections: {} });
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState({ visible: false, src: '', title: '' });
    const [maintenanceImages, setMaintenanceImages] = useState({});
    const [imageUrls, setImageUrls] = useState({});

    // Debug effect for image states
    useEffect(() => {
        console.log('Maintenance images changed:', maintenanceImages);
        console.log('Image URLs changed:', imageUrls);
    }, [maintenanceImages, imageUrls]);

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
                if (data.success) {
                    const ordersWithDocuments = await Promise.all((data.rentalOrders || []).map(async (order) => {
                        try {
                            const docRes = await fetch(`http://localhost:8080/api/v1/employee/order/${order._id}/documents`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (docRes.ok) {
                                const docData = await docRes.json();
                                if (docData.success && docData.documents) {
                                    return { ...order, documentsValid: docData.documents.isValid };
                                }
                            }
                        } catch {
                            // If document endpoint fails, assume not valid
                        }
                        return { ...order, documentsValid: false };
                    }));
                    setOrders(ordersWithDocuments);

                    // Fetch refunds for completed orders
                    const completedOrders = ordersWithDocuments.filter(order => order.status === 'completed');
                    const refundsData = {};

                    await Promise.all(completedOrders.map(async (order) => {
                        try {
                            const refundRes = await fetch('http://localhost:8080/api/v1/employee/refund/all', {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            const refundData = await refundRes.json();
                            if (refundData.success && Array.isArray(refundData.refunds)) {
                                const orderRefund = refundData.refunds.find(r =>
                                    r.paymentId?.rentalOrderId === order._id && r.status === 'pending'
                                );
                                if (orderRefund) {
                                    refundsData[order._id] = orderRefund;
                                }
                            }
                        } catch {
                            // Ignore individual refund fetch errors
                        }
                    }));

                    setOrderRefunds(refundsData);
                } else {
                    message.error(data.message || 'Không thể lấy danh sách đơn hàng.');
                }
            } catch {
                message.error('Lỗi khi tải đơn hàng.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Fetch maintenance levels and order motorbikes for maintenance selection
    const fetchMaintenanceData = async (orderId) => {
        try {
            const token = localStorage.getItem('token');

            // Fetch maintenance levels
            const levelsRes = await fetch('http://localhost:8080/api/v1/employee/maintenance/levels', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const levelsData = await levelsRes.json();

            // Fetch order motorbikes
            const motorbikesRes = await fetch(`http://localhost:8080/api/v1/employee/maintenance/order/${orderId}/motorbikes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const motorbikesData = await motorbikesRes.json();

            if (levelsData.success && motorbikesData.success) {
                const initialSelections = {};
                console.log('Motorbikes data:', motorbikesData.motorbikes);
                motorbikesData.motorbikes.forEach(mb => {
                    console.log('Setting initial selection for motorbike:', mb.motorbikeId);
                    initialSelections[mb.motorbikeId] = {
                        level: 'normal',
                        description: ''
                    };
                });
                console.log('Initial selections:', initialSelections);

                setMaintenanceModal({
                    visible: true,
                    orderId,
                    motorbikes: motorbikesData.motorbikes,
                    maintenanceLevels: levelsData.maintenanceLevels,
                    selections: initialSelections
                });
            } else {
                message.error('Không thể lấy thông tin bảo dưỡng');
            }
        } catch {
            message.error('Lỗi khi tải thông tin bảo dưỡng');
        }
    };

    // Handle maintenance level change
    const handleMaintenanceLevelChange = (motorbikeId, level) => {
        console.log('Changing maintenance level for motorbike:', motorbikeId, 'to level:', level);
        setMaintenanceModal(prev => {
            const newSelections = {
                ...prev.selections,
                [motorbikeId]: {
                    ...prev.selections[motorbikeId],
                    level
                }
            };
            console.log('New selections:', newSelections);
            return {
                ...prev,
                selections: newSelections
            };
        });
    };

    // Handle maintenance description change
    const handleMaintenanceDescriptionChange = (motorbikeId, description) => {
        setMaintenanceModal(prev => ({
            ...prev,
            selections: {
                ...prev.selections,
                [motorbikeId]: {
                    ...prev.selections[motorbikeId],
                    description
                }
            }
        }));
    };

    // Calculate total maintenance fee
    const calculateTotalMaintenanceFee = () => {
        let total = 0;
        let additionalFee = 0;
        maintenanceModal.motorbikes.forEach(mb => {
            const selection = maintenanceModal.selections[mb.motorbikeId];
            if (selection) {
                const level = mb.maintenanceLevels.find(l => l.level === selection.level);
                if (level) {
                    const fee = level.estimatedFee || 0;
                    total += fee;
                    // Only add to additionalFee if no damage waiver
                    if (!mb.hasDamageWaiver) {
                        additionalFee += fee;
                    }
                }
            }
        });
        return { total, additionalFee };
    };

    // Handle checkout with maintenance
    const handleCheckoutWithMaintenance = async () => {
        setCheckoutLoading(true);
        try {
            const token = localStorage.getItem('token');

            // First, perform checkout
            const checkoutRes = await fetch(`http://localhost:8080/api/v1/employee/order/${maintenanceModal.orderId}/checkout`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            const checkoutData = await checkoutRes.json();

            if (checkoutData.success) {
                // Update order status
                setOrders(prev => prev.map(o => o._id === maintenanceModal.orderId ? { ...o, status: 'completed', checkOutDate: new Date() } : o));

                // Show checkout success message
                message.success(checkoutData.message);

                // Then create maintenance records
                const maintenanceSelections = maintenanceModal.motorbikes.map(motorbike => {
                    const selection = maintenanceModal.selections[motorbike.motorbikeId];
                    if (selection) {
                        return {
                            motorbikeId: motorbike.motorbikeId,
                            level: selection.level,
                            description: selection.description,
                            image: maintenanceImages[motorbike.motorbikeId] || null
                        };
                    }
                    return null;
                }).filter(Boolean); // Remove null entries

                console.log('Maintenance selections:', maintenanceSelections);
                console.log('Order ID:', maintenanceModal.orderId);
                console.log('Available motorbikes:', maintenanceModal.motorbikes.map(mb => ({ id: mb.motorbikeId, code: mb.code })));
                console.log('Selections object:', maintenanceModal.selections);
                console.log('Maintenance images state:', maintenanceImages);

                // Create FormData for maintenance with images
                const formData = new FormData();
                const maintenanceSelectionsWithoutImages = maintenanceSelections.map(selection => ({
                    motorbikeId: selection.motorbikeId,
                    level: selection.level,
                    description: selection.description
                }));

                formData.append('maintenanceSelections', JSON.stringify(maintenanceSelectionsWithoutImages));

                // Add images to FormData
                console.log('Adding images to FormData...');
                maintenanceSelections.forEach((selection, index) => {
                    if (selection.image) {
                        console.log(`Adding image for index ${index}, motorbikeId: ${selection.motorbikeId}`);
                        formData.append(`images`, selection.image);
                        formData.append(`imageIndexes`, index.toString());
                    }
                });

                console.log('FormData contents:');
                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }

                const maintenanceRes = await fetch(`http://localhost:8080/api/v1/employee/maintenance/order/${maintenanceModal.orderId}/create`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    body: formData
                });

                console.log('Maintenance response status:', maintenanceRes.status);
                const maintenanceData = await maintenanceRes.json();
                console.log('Maintenance response data:', maintenanceData);
                if (maintenanceData.success) {
                    message.success('Tạo bảo dưỡng thành công!');
                } else {
                    message.warning('Checkout thành công nhưng tạo bảo dưỡng thất bại: ' + maintenanceData.message);
                }

                // Close modal
                setMaintenanceModal({ visible: false, orderId: null, motorbikes: [], maintenanceLevels: {}, selections: {} });
                setMaintenanceImages({});
                // Clean up image URLs to prevent memory leaks
                Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
                setImageUrls({});
            } else {
                message.error(checkoutData.message || 'Checkout thất bại');
            }
        } catch {
            message.error('Lỗi khi checkout và tạo bảo dưỡng');
        } finally {
            setCheckoutLoading(false);
        }
    };

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
                                disabled={isPaid || !record.documentsValid}
                                style={{ minWidth: 180 }}
                                block
                            >
                                Hoàn thành thanh toán
                            </Button>
                            <Button
                                onClick={async () => {
                                    try {
                                        const token = localStorage.getItem('token');
                                        const res = await fetch(`http://localhost:8080/api/v1/employee/order/${record._id}/documents`, {
                                            headers: { Authorization: `Bearer ${token}` }
                                        });
                                        const data = await res.json();
                                        if (data.success && data.documents) {
                                            setDocumentModal({
                                                visible: true,
                                                orderId: record._id,
                                                documents: data.documents
                                            });
                                        } else {
                                            message.warning('Chưa có giấy tờ được tải lên');
                                        }
                                    } catch {
                                        message.error('Lỗi khi tải thông tin giấy tờ.');
                                    }
                                }}
                                style={{ minWidth: 140 }}
                                block
                            >
                                Kiểm tra giấy tờ
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
                    const remainingTime = calculateRemainingTime(record.returnDate);
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <RentalCountdown returnDate={record.returnDate} />
                            {remainingTime.canRefund && (
                                <div style={{ fontSize: 12, color: '#52c41a', marginBottom: 4 }}>
                                    Có thể hoàn tiền: {remainingTime.remainingDays}d {remainingTime.remainingHoursInDay}h
                                </div>
                            )}
                            <Button
                                type="primary"
                                onClick={() => fetchMaintenanceData(record._id)}
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
                                onCancel={() => setRefundModal({ visible: false, amount: 0, remainingDays: 0, remainingHours: 0 })}
                                footer={null}
                            >
                                <div style={{ fontSize: 16, color: '#1890ff' }}>
                                    <div style={{ marginBottom: 12 }}>
                                        <strong>Thông tin hoàn tiền:</strong>
                                    </div>
                                    <div style={{ marginBottom: 8 }}>
                                        <span>Thời gian còn lại: </span>
                                        <b>{refundModal.remainingDays} ngày {refundModal.remainingHours} giờ</b>
                                    </div>
                                    <div>
                                        <span>Số tiền hoàn lại: </span>
                                        <b style={{ color: '#52c41a' }}>{refundModal.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</b>
                                    </div>
                                    <div style={{ marginTop: 12, fontSize: 14, color: '#666', fontStyle: 'italic' }}>
                                        * Hoàn tiền chỉ tính cho ngày đầy đủ, không tính cho ngày lẻ
                                    </div>
                                </div>
                            </Modal>
                        </div>
                    );
                }
                // Default: only show info button
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        {/* Show refund button for completed orders with refunds */}
                        {record.status === 'completed' && orderRefunds[record._id] && (
                            <Button
                                type="primary"
                                style={{
                                    backgroundColor: '#52c41a',
                                    borderColor: '#52c41a',
                                    minWidth: 120,
                                    animation: highlightedOrder === record._id ? 'highlight 2s ease-in-out' : 'none'
                                }}
                                onClick={() => {
                                    // Highlight the order for 2 seconds
                                    setHighlightedOrder(record._id);
                                    setTimeout(() => setHighlightedOrder(null), 2000);

                                    // Navigate to refund page with order ID for highlighting
                                    message.success('Chuyển đến trang hoàn tiền!');
                                    setTimeout(() => navigate('/employee/refund', {
                                        state: { highlightOrderId: record._id }
                                    }), 500);
                                }}
                                block
                            >
                                Xem hoàn tiền
                            </Button>
                        )}

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
            <style>
                {`
                    @keyframes highlight {
                        0% { background-color: #52c41a; }
                        50% { background-color: #ff4d4f; }
                        100% { background-color: #52c41a; }
                    }
                    
                    .highlighted-row {
                        background-color: #fff2e8 !important;
                        animation: highlight 2s ease-in-out;
                    }
                `}
            </style>
            <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Quản lý đơn hàng</h1>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={4}><Card><b>Tổng đơn</b><br />{orders.length}</Card></Col>
                {summary.map(s => (
                    <Col span={4} key={s.status}>
                        <Card>
                            <b>{statusMap[s.status].label}</b><br />
                            <span style={{ color: statusMap[s.status].color }}>{s.count}</span>
                            {/* {s.status === 'completed' && Object.keys(orderRefunds).length > 0 && (
                                <div style={{ marginTop: 8, fontSize: 12, color: '#52c41a' }}>
                                    <b>Có {Object.keys(orderRefunds).length} hoàn tiền</b>
                                </div>
                            )} */}
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
                                rowClassName={(record) => highlightedOrder === record._id ? 'highlighted-row' : ''}
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
                        rowClassName={(record) => highlightedOrder === record._id ? 'highlighted-row' : ''}
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
                                        {
                                            title: 'Mã xe',
                                            key: 'codes',
                                            render: (_, r) => {
                                                // Find the corresponding motorbikesByType data
                                                const typeId = r.motorbikeTypeId?._id;
                                                if (typeId && orderDetail.motorbikesByType && orderDetail.motorbikesByType[typeId]) {
                                                    const codes = orderDetail.motorbikesByType[typeId].codes;
                                                    return codes && codes.length > 0 ? codes.join(', ') : '-';
                                                }
                                                return '-';
                                            }
                                        },
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

            {/* Document Validation Modal */}
            <Modal
                title="Kiểm tra giấy tờ"
                visible={documentModal.visible}
                onCancel={() => setDocumentModal({ visible: false, orderId: null, documents: null })}
                footer={[
                    <Button key="cancel" onClick={() => setDocumentModal({ visible: false, orderId: null, documents: null })}>
                        Đóng
                    </Button>,
                    <Button
                        key="validate"
                        type={documentModal.documents?.isValid ? "default" : "primary"}
                        danger={documentModal.documents?.isValid}
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('token');
                                const newIsValid = !documentModal.documents?.isValid;
                                const res = await fetch(`http://localhost:8080/api/v1/employee/order/${documentModal.orderId}/validate-documents`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        Authorization: `Bearer ${token}`
                                    },
                                    body: JSON.stringify({ isValid: newIsValid })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    const messageText = newIsValid ? 'Đã xác nhận giấy tờ hợp lệ!' : 'Đã đánh dấu giấy tờ chưa chính xác!';
                                    message.success(messageText);
                                    setOrders(prev => prev.map(o => o._id === documentModal.orderId ? { ...o, documentsValid: newIsValid } : o));
                                    setDocumentModal({
                                        visible: false,
                                        orderId: null,
                                        documents: null
                                    });
                                } else {
                                    message.error(data.message || 'Cập nhật trạng thái giấy tờ thất bại');
                                }
                            } catch {
                                message.error('Lỗi khi cập nhật trạng thái giấy tờ.');
                            }
                        }}
                    >
                        {documentModal.documents?.isValid ? 'Giấy tờ chưa chính xác' : 'Xác nhận hợp lệ'}
                    </Button>
                ]}
                width={800}
            >
                {documentModal.documents && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <strong>Trạng thái hiện tại:</strong>
                            <Tag color={documentModal.documents.isValid ? 'green' : 'orange'} style={{ marginLeft: 8 }}>
                                {documentModal.documents.isValid ? 'Đã xác nhận hợp lệ' : 'Chưa xác nhận'}
                            </Tag>
                        </div>

                        {/* CCCD Images */}
                        {documentModal.documents.cccdImages && documentModal.documents.cccdImages.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <h4>CCCD/CMND ({documentModal.documents.cccdImages.length} hình ảnh):</h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: 12
                                }}>
                                    {documentModal.documents.cccdImages.map((image, index) => (
                                        <div key={`cccd-${index}`} style={{
                                            border: '1px solid #d9d9d9',
                                            borderRadius: 6,
                                            overflow: 'hidden',
                                            background: '#fff'
                                        }}>
                                            <img
                                                src={`http://localhost:8080/uploads/${image}`}
                                                alt={`CCCD ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    display: 'block',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setImagePreview({
                                                    visible: true,
                                                    src: `http://localhost:8080/uploads/${image}`,
                                                    title: `CCCD ${index + 1}`
                                                })}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div style={{
                                                display: 'none',
                                                width: '100%',
                                                height: '120px',
                                                background: '#f5f5f5',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                color: '#999'
                                            }}>
                                                Lỗi tải ảnh
                                            </div>
                                            <div style={{
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                textAlign: 'center',
                                                background: '#fafafa',
                                                color: '#666'
                                            }}>
                                                CCCD {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Driver License Images */}
                        {documentModal.documents.driverLicenseImages && documentModal.documents.driverLicenseImages.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <h4>Bằng lái xe ({documentModal.documents.driverLicenseImages.length} hình ảnh):</h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                                    gap: 12
                                }}>
                                    {documentModal.documents.driverLicenseImages.map((image, index) => (
                                        <div key={`license-${index}`} style={{
                                            border: '1px solid #d9d9d9',
                                            borderRadius: 6,
                                            overflow: 'hidden',
                                            background: '#fff'
                                        }}>
                                            <img
                                                src={`http://localhost:8080/uploads/${image}`}
                                                alt={`Bằng lái ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    objectFit: 'cover',
                                                    display: 'block',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setImagePreview({
                                                    visible: true,
                                                    src: `http://localhost:8080/uploads/${image}`,
                                                    title: `Bằng lái ${index + 1}`
                                                })}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                            <div style={{
                                                display: 'none',
                                                width: '100%',
                                                height: '120px',
                                                background: '#f5f5f5',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '12px',
                                                color: '#999'
                                            }}>
                                                Lỗi tải ảnh
                                            </div>
                                            <div style={{
                                                padding: '4px 8px',
                                                fontSize: '11px',
                                                textAlign: 'center',
                                                background: '#fafafa',
                                                color: '#666'
                                            }}>
                                                Bằng lái {index + 1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div style={{
                            padding: 12,
                            background: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            borderRadius: 6,
                            marginTop: 16
                        }}>
                            <strong>Hướng dẫn kiểm tra:</strong>
                            <ul style={{ marginTop: 8, marginBottom: 0 }}>
                                <li>Kiểm tra tính rõ ràng và đầy đủ của thông tin trên giấy tờ</li>
                                <li>Xác nhận CCCD/CMND và bằng lái xe thuộc về khách hàng</li>
                                <li>Đảm bảo giấy tờ còn hiệu lực và không bị làm giả</li>
                                <li>Nhấn "Xác nhận hợp lệ" sau khi kiểm tra xong</li>
                            </ul>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Maintenance Selection Modal */}
            <Modal
                title="Chọn cấp độ bảo dưỡng"
                visible={maintenanceModal.visible}
                onCancel={() => {
                    setMaintenanceModal({ visible: false, orderId: null, motorbikes: [], maintenanceLevels: {}, selections: {} });
                    setMaintenanceImages({});
                    // Clean up image URLs to prevent memory leaks
                    Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
                    setImageUrls({});
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setMaintenanceModal({ visible: false, orderId: null, motorbikes: [], maintenanceLevels: {}, selections: {} });
                            setMaintenanceImages({});
                            // Clean up image URLs to prevent memory leaks
                            Object.values(imageUrls).forEach(url => URL.revokeObjectURL(url));
                            setImageUrls({});
                        }}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        loading={checkoutLoading}
                        onClick={handleCheckoutWithMaintenance}
                    >
                        Hoàn thành
                    </Button>
                ]}
                width={1000}
            >
                <div style={{ marginBottom: 16 }}>
                    <h4>Danh sách xe cần bảo dưỡng</h4>
                </div>

                {maintenanceModal.motorbikes.map((motorbike) => {
                    const selection = maintenanceModal.selections[motorbike.motorbikeId];
                    const selectedLevel = selection ? motorbike.maintenanceLevels.find(level => level.level === selection.level) : null;
                    console.log('Motorbike:', motorbike.code, 'Selection:', selection, 'SelectedLevel:', selectedLevel);
                    console.log('Maintenance images state:', maintenanceImages);
                    console.log('Image URLs state:', imageUrls);

                    return (
                        <Card key={motorbike.motorbikeId} style={{ marginBottom: 16 }}>
                            <Row gutter={16} align="middle">
                                <Col span={5}>
                                    <div>
                                        <Text strong>Mã xe: </Text>
                                        <Text>{motorbike.code}</Text>
                                    </div>
                                    <div>
                                        <Text strong>Loại xe: </Text>
                                        <Text>{motorbike.motorbikeTypeName}</Text>
                                    </div>
                                    <div>
                                        <Text strong>Giá trị xe: </Text>
                                        <Text>{motorbike.vehicleValue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</Text>
                                    </div>
                                    {motorbike.hasDamageWaiver && (
                                        <div style={{ marginTop: 8 }}>
                                            <Tag color="green">Đã mua bảo hiểm thiệt hại</Tag>
                                        </div>
                                    )}
                                </Col>

                                <Col span={5}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong>Cấp độ bảo dưỡng:</Text>
                                    </div>
                                    <Select
                                        value={selection?.level || 'normal'}
                                        onChange={(value) => handleMaintenanceLevelChange(motorbike.motorbikeId, value)}
                                        style={{ width: '100%' }}
                                    >
                                        {motorbike.maintenanceLevels.map(level => (
                                            <Option key={level.level} value={level.level}>
                                                <Tag color={level.level === 'normal' ? 'green' : level.level === 'light' ? 'blue' : level.level === 'medium' ? 'orange' : 'red'}>
                                                    {level.name}
                                                </Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>

                                <Col span={5}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong>Thời gian: </Text>
                                        <Text>{selectedLevel?.duration || 0} ngày</Text>
                                    </div>
                                    <div>
                                        <Text strong>Phí bảo dưỡng: </Text>
                                        <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                            {selectedLevel?.estimatedFee?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 VND'}
                                        </Text>
                                    </div>
                                    {motorbike.hasDamageWaiver && selectedLevel?.estimatedFee > 0 && (
                                        <div style={{ marginTop: 4 }}>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                (Không tính vào phí bổ sung)
                                            </Text>
                                        </div>
                                    )}
                                </Col>

                                <Col span={5}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong>Mô tả thêm:</Text>
                                    </div>
                                    <TextArea
                                        value={selection?.description || ''}
                                        onChange={(e) => handleMaintenanceDescriptionChange(motorbike.motorbikeId, e.target.value)}
                                        placeholder="Nhập mô tả bảo dưỡng (tùy chọn)"
                                        rows={2}
                                    />
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong>Hình ảnh tình trạng xe:</Text>
                                        <div style={{ marginTop: 8 }}>
                                            {(() => {
                                                const hasImage = maintenanceImages[motorbike.motorbikeId];
                                                const imageUrl = imageUrls[motorbike.motorbikeId];
                                                console.log(`Rendering image for ${motorbike.code}:`, { hasImage, imageUrl });
                                                return hasImage ? (
                                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                                        <img
                                                            src={imageUrl}
                                                            alt="Maintenance"
                                                            style={{
                                                                width: '100px',
                                                                height: '100px',
                                                                objectFit: 'cover',
                                                                borderRadius: '8px',
                                                                border: '1px solid #d9d9d9'
                                                            }}
                                                            onLoad={() => console.log(`Image loaded successfully for ${motorbike.code}`)}
                                                            onError={(e) => console.log(`Image failed to load for ${motorbike.code}:`, e)}
                                                        />
                                                        <Button
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            style={{
                                                                position: 'absolute',
                                                                top: -8,
                                                                right: -8,
                                                                background: 'white',
                                                                border: '1px solid #ff4d4f',
                                                                borderRadius: '50%',
                                                                width: '20px',
                                                                height: '20px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                padding: 0
                                                            }}
                                                            onClick={() => {
                                                                setMaintenanceImages(prev => {
                                                                    const newImages = { ...prev };
                                                                    delete newImages[motorbike.motorbikeId];
                                                                    return newImages;
                                                                });
                                                                setImageUrls(prev => {
                                                                    const newUrls = { ...prev };
                                                                    delete newUrls[motorbike.motorbikeId];
                                                                    return newUrls;
                                                                });
                                                            }}
                                                        >
                                                            ×
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        border: '2px dashed #d9d9d9',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        background: '#fafafa',
                                                        position: 'relative'
                                                    }}>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                opacity: 0,
                                                                cursor: 'pointer'
                                                            }}
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                console.log('File input change:', file);

                                                                if (file) {
                                                                    // Validate file
                                                                    const isImage = file.type.startsWith('image/');
                                                                    if (!isImage) {
                                                                        message.error('Chỉ có thể tải lên file hình ảnh!');
                                                                        return;
                                                                    }

                                                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                                                    if (!isLt2M) {
                                                                        message.error('Hình ảnh phải nhỏ hơn 2MB!');
                                                                        return;
                                                                    }

                                                                    const imageUrl = URL.createObjectURL(file);
                                                                    console.log('Created image URL:', imageUrl);
                                                                    console.log('Motorbike ID:', motorbike.motorbikeId);

                                                                    setMaintenanceImages(prev => {
                                                                        const newState = {
                                                                            ...prev,
                                                                            [motorbike.motorbikeId]: file
                                                                        };
                                                                        console.log('New maintenance images state:', newState);
                                                                        return newState;
                                                                    });

                                                                    setImageUrls(prev => {
                                                                        const newState = {
                                                                            ...prev,
                                                                            [motorbike.motorbikeId]: imageUrl
                                                                        };
                                                                        console.log('New image URLs state:', newState);
                                                                        return newState;
                                                                    });

                                                                    message.success(`Đã tải lên ảnh cho xe ${motorbike.code}`);
                                                                }
                                                            }}
                                                        />
                                                        <div style={{ fontSize: 16, color: '#999' }}>+</div>
                                                        <div style={{ marginTop: 4, fontSize: 12, color: '#999' }}>Tải ảnh</div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {selectedLevel && (
                                <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f6ffed', borderRadius: 4 }}>
                                    <Text type="secondary">{selectedLevel.description}</Text>
                                </div>
                            )}
                        </Card>
                    );
                })}

                <div style={{ textAlign: 'center', marginTop: 16, padding: 16, backgroundColor: '#f0f8ff', borderRadius: 8 }}>
                    <h4>
                        Tổng phí bảo dưỡng:
                        <span style={{ color: '#52c41a', marginLeft: 8 }}>
                            {calculateTotalMaintenanceFee().total.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                        </span>
                    </h4>
                    {calculateTotalMaintenanceFee().additionalFee !== calculateTotalMaintenanceFee().total && (
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">
                                Phí bổ sung (không có bảo hiểm):
                                <span style={{ color: '#ff4d4f', marginLeft: 4, fontWeight: 'bold' }}>
                                    {calculateTotalMaintenanceFee().additionalFee.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                </span>
                            </Text>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Image Preview Modal */}
            <Modal
                title={imagePreview.title}
                visible={imagePreview.visible}
                onCancel={() => setImagePreview({ visible: false, src: '', title: '' })}
                footer={[
                    <Button
                        key="close"
                        onClick={() => setImagePreview({ visible: false, src: '', title: '' })}
                    >
                        Đóng
                    </Button>
                ]}
                width={800}
                centered
            >
                <div style={{ textAlign: 'center' }}>
                    <img
                        src={imagePreview.src}
                        alt={imagePreview.title}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '600px',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                        }}
                    />
                    <div
                        style={{
                            display: 'none',
                            padding: '40px',
                            background: '#f5f5f5',
                            borderRadius: '8px',
                            color: '#999',
                            fontSize: '16px'
                        }}
                    >
                        Không thể tải ảnh
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default OrderPage;
