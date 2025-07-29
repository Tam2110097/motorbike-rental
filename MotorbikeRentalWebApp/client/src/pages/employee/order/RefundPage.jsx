import React, { useEffect, useState } from 'react';
import { Table, Tag, Upload, Button, message, Spin, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';

const statusMap = {
    pending: { color: 'orange', label: 'Chờ hoàn tiền' },
    approved: { color: 'blue', label: 'Đã duyệt' },
    completed: { color: 'green', label: 'Đã hoàn thành' },
    rejected: { color: 'red', label: 'Từ chối' }
};

const RefundPage = () => {
    const location = useLocation();
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [fileList, setFileList] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [completing, setCompleting] = useState(false);
    const [orderCodes, setOrderCodes] = useState({});
    const [highlightedRefund, setHighlightedRefund] = useState(null);

    useEffect(() => {
        const fetchRefunds = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/v1/employee/refund/all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setRefunds(data.refunds || []);

                    // Check if we should highlight a specific refund (from order page navigation)
                    if (location.state?.highlightOrderId) {
                        const targetRefund = data.refunds?.find(r =>
                            r.paymentId?.rentalOrderId === location.state.highlightOrderId
                        );
                        if (targetRefund) {
                            setHighlightedRefund(targetRefund._id);
                            setTimeout(() => setHighlightedRefund(null), 2000);
                        }
                    }

                    // Fetch order codes for all refunds
                    const orderIds = (data.refunds || []).map(r => r.paymentId?.rentalOrderId).filter(Boolean);
                    const uniqueOrderIds = Array.from(new Set(orderIds));
                    const codes = {};
                    await Promise.all(uniqueOrderIds.map(async (oid) => {
                        try {
                            const orderRes = await fetch(`http://localhost:8080/api/v1/employee/order/${oid}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            const orderData = await orderRes.json();
                            if (orderData.success && orderData.rentalOrder) {
                                codes[oid] = orderData.rentalOrder.orderCode;
                            }
                        } catch {/* ignore individual order fetch errors */ }
                    }));
                    setOrderCodes(codes);
                } else message.error(data.message || 'Không thể lấy danh sách hoàn tiền.');
            } catch {
                message.error('Lỗi khi tải hoàn tiền.');
            } finally {
                setLoading(false);
            }
        };
        fetchRefunds();
    }, [location.state]);

    const handleUploadChange = info => {
        setFileList(info.fileList.slice(-1));
        const file = info.fileList[0]?.originFileObj;
        if (file) setPreviewUrl(URL.createObjectURL(file));
        else setPreviewUrl(null);
    };

    const handleComplete = async () => {
        if (!fileList.length || !selectedRefund) {
            message.error('Vui lòng tải lên ảnh chuyển khoản trước!');
            return;
        }
        setCompleting(true);
        const formData = new FormData();
        formData.append('invoiceImage', fileList[0].originFileObj);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/v1/employee/refund/complete/${selectedRefund._id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.success) {
                message.success('Cập nhật hoàn tiền thành công!');
                setRefunds(prev => prev.map(r => r._id === selectedRefund._id ? { ...r, status: 'completed', invoiceImage: data.invoiceImage } : r));
                setModalVisible(false);
                setFileList([]);
                setPreviewUrl(null);
            } else {
                message.error(data.message || 'Cập nhật hoàn tiền thất bại');
            }
        } catch {
            message.error('Lỗi khi cập nhật hoàn tiền.');
        } finally {
            setCompleting(false);
        }
    };

    const columns = [
        { title: 'Mã đơn', dataIndex: ['paymentId', 'rentalOrderId'], key: 'orderCode', render: (v, r) => orderCodes[r.paymentId?.rentalOrderId] || '-' },
        { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: v => v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) },
        { title: 'Ngày hoàn', dataIndex: 'refundDate', key: 'refundDate', render: d => d ? new Date(d).toLocaleDateString() : '-' },
        { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: s => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label || s}</Tag> },
        { title: 'Thanh toán', dataIndex: 'paymentId', key: 'paymentId', render: p => p?._id || '-' },
        {
            title: 'Ảnh chuyển khoản', dataIndex: 'invoiceImage', key: 'invoiceImage', render: (img) => {
                if (!img) return '-';
                const url = img.startsWith('/uploads') ? `http://localhost:8080${img}` : img;
                return (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="invoice" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} />
                    </a>
                );
            }
        },
        {
            title: 'Hành động', key: 'action', render: (_, record) => record.status === 'pending' ? (
                <Button type="primary" onClick={() => { setSelectedRefund(record); setModalVisible(true); }}>Cập nhật chuyển khoản</Button>
            ) : record.invoiceImage ? (
                <a href={record.invoiceImage} target="_blank" rel="noopener noreferrer">Xem ảnh</a>
            ) : null
        }
    ];

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
            <style>
                {`
                    @keyframes highlight {
                        0% { background-color: #fff2e8; }
                        50% { background-color: #ff4d4f; }
                        100% { background-color: #fff2e8; }
                    }
                    
                    .highlighted-refund-row {
                        background-color: #fff2e8 !important;
                        animation: highlight 2s ease-in-out;
                    }
                `}
            </style>
            <h1 style={{ textAlign: 'center', marginBottom: 24 }}>Quản lý hoàn tiền</h1>
            {loading ? <Spin size="large" style={{ display: 'block', margin: '60px auto' }} /> : (
                <Table
                    columns={columns}
                    dataSource={refunds}
                    rowKey="_id"
                    bordered
                    rowClassName={(record) => highlightedRefund === record._id ? 'highlighted-refund-row' : ''}
                />
            )}
            <Modal
                title="Cập nhật chuyển khoản hoàn tiền"
                visible={modalVisible}
                onCancel={() => { setModalVisible(false); setFileList([]); setPreviewUrl(null); }}
                footer={null}
            >
                {selectedRefund && (
                    <>
                        <Upload.Dragger
                            name="invoiceImage"
                            fileList={fileList}
                            beforeUpload={() => false}
                            onChange={handleUploadChange}
                            showUploadList={true}
                            accept="image/*"
                        >
                            <p className="ant-upload-drag-icon">
                                <UploadOutlined />
                            </p>
                            <p className="ant-upload-text">Kéo & thả hoặc bấm để chọn ảnh chuyển khoản</p>
                        </Upload.Dragger>
                        {previewUrl && (
                            <div style={{ margin: '16px 0', textAlign: 'center' }}>
                                <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={previewUrl} alt="Preview" style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8, cursor: 'pointer' }} />
                                </a>
                            </div>
                        )}
                        <Button
                            type="primary"
                            loading={completing}
                            onClick={handleComplete}
                            block
                            style={{ marginTop: 16 }}
                        >
                            Hoàn thành
                        </Button>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default RefundPage;
