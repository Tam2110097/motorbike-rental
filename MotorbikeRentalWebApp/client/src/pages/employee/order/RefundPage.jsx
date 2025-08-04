import React, { useEffect, useState } from 'react';
import { Table, Tag, Upload, Button, message, Spin, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import AdminLayout from '../../../components/AdminLayout';

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
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

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
                    const refundsData = data.refunds || [];
                    setRefunds(refundsData);

                    // Update pagination total
                    setPagination(prev => ({
                        ...prev,
                        total: refundsData.length
                    }));

                    // Check if we should highlight a specific refund (from order page navigation)
                    if (location.state?.highlightOrderId) {
                        const targetRefund = refundsData.find(r =>
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

    // Handle pagination change
    const handleTableChange = (page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize || prev.pageSize
        }));
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: ['paymentId', 'rentalOrderId'],
            key: 'orderCode',
            render: (v, r) => (
                <span style={{ fontWeight: '600', color: '#1890ff' }}>
                    {orderCodes[r.paymentId?.rentalOrderId] || '-'}
                </span>
            )
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: v => (
                <span className="refund-amount">
                    {v?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
            )
        },
        {
            title: 'Ngày hoàn',
            dataIndex: 'refundDate',
            key: 'refundDate',
            render: d => d ? new Date(d).toLocaleDateString('vi-VN') : '-'
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
            render: reason => (
                <span style={{ maxWidth: 200, display: 'block' }}>
                    {reason || '-'}
                </span>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: s => (
                <Tag color={statusMap[s]?.color} className="refund-status-tag">
                    {statusMap[s]?.label || s}
                </Tag>
            )
        },
        {
            title: 'Thanh toán',
            dataIndex: 'paymentId',
            key: 'paymentId',
            render: p => (
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    {p?._id || '-'}
                </span>
            )
        },
        {
            title: 'Ảnh chuyển khoản',
            dataIndex: 'invoiceImage',
            key: 'invoiceImage',
            render: (img) => {
                if (!img) return '-';
                const url = img.startsWith('/uploads') ? `http://localhost:8080${img}` : img;
                return (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        <img
                            src={url}
                            alt="invoice"
                            className="refund-image-preview"
                            style={{
                                width: 60,
                                height: 40,
                                objectFit: 'cover',
                                borderRadius: 8,
                                border: '2px solid #f0f0f0'
                            }}
                        />
                    </a>
                );
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => record.status === 'pending' ? (
                <Button
                    type="primary"
                    className="refund-action-button"
                    onClick={() => { setSelectedRefund(record); setModalVisible(true); }}
                >
                    Cập nhật chuyển khoản
                </Button>
            ) : record.invoiceImage ? (
                <Button
                    type="link"
                    className="refund-action-button"
                    style={{ color: '#1890ff', fontWeight: '600' }}
                    onClick={() => window.open(record.invoiceImage, '_blank')}
                >
                    Xem ảnh
                </Button>
            ) : null
        }
    ];

    return (
        <AdminLayout>
            <div className="p-2">
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

                        .refund-page-header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 24px;
                            border-radius: 12px;
                            margin-bottom: 24px;
                            text-align: center;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        }

                        .refund-page-header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 700;
                            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                        }

                        .refund-table-container {
                            background: white;
                            border-radius: 12px;
                            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                            overflow: hidden;
                            border: 1px solid #f0f0f0;
                        }

                        .ant-table-thead > tr > th {
                            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                            border-bottom: 2px solid #dee2e6;
                            font-weight: 600;
                            color: #495057;
                        }

                        .ant-table-tbody > tr:hover > td {
                            background-color: #f8f9ff !important;
                        }

                        .ant-pagination-item-active {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border-color: #667eea;
                        }

                        .ant-pagination-item-active a {
                            color: white;
                        }

                        .refund-status-tag {
                            border-radius: 6px;
                            font-weight: 500;
                            padding: 4px 12px;
                        }

                        .refund-amount {
                            font-weight: 600;
                            color: #52c41a;
                        }

                        .refund-image-preview {
                            border-radius: 8px;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                            transition: transform 0.2s ease;
                        }

                        .refund-image-preview:hover {
                            transform: scale(1.05);
                        }

                        .refund-action-button {
                            border-radius: 8px;
                            font-weight: 600;
                            height: 36px;
                            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                            transition: all 0.3s ease;
                        }

                        .refund-action-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                        }
                    `}
                </style>
                <div className="refund-page-header">
                    <h1>QUẢN LÝ HOÀN TIỀN</h1>
                </div>
                {loading ? <Spin size="large" style={{ display: 'block', margin: '60px auto' }} /> : (
                    <div className="refund-table-container">
                        <Table
                            columns={columns}
                            dataSource={refunds}
                            rowKey="_id"
                            bordered
                            rowClassName={(record) => highlightedRefund === record._id ? 'highlighted-refund-row' : ''}
                            pagination={{
                                current: pagination.current,
                                pageSize: pagination.pageSize,
                                total: pagination.total,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} hoàn tiền`,
                                onChange: handleTableChange,
                                onShowSizeChange: handleTableChange,
                                pageSizeOptions: ['10', '20', '50', '100'],
                                size: 'default'
                            }}
                        />
                    </div>
                )}
                <Modal
                    title={
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1890ff',
                            textAlign: 'center'
                        }}>
                            📤 Cập nhật chuyển khoản hoàn tiền
                        </div>
                    }
                    visible={modalVisible}
                    onCancel={() => { setModalVisible(false); setFileList([]); setPreviewUrl(null); }}
                    footer={null}
                    width={600}
                    centered
                    style={{ borderRadius: '12px' }}
                >
                    {selectedRefund && (
                        <>
                            <div style={{
                                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                border: '1px solid #dee2e6'
                            }}>
                                <div style={{ fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                                    Thông tin hoàn tiền:
                                </div>
                                <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                    <div>Mã đơn: <span style={{ fontWeight: '600', color: '#1890ff' }}>
                                        {orderCodes[selectedRefund.paymentId?.rentalOrderId] || '-'}
                                    </span></div>
                                    <div>Số tiền: <span style={{ fontWeight: '600', color: '#52c41a' }}>
                                        {selectedRefund.amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                                    </span></div>
                                </div>
                            </div>

                            <Upload.Dragger
                                name="invoiceImage"
                                fileList={fileList}
                                beforeUpload={() => false}
                                onChange={handleUploadChange}
                                showUploadList={true}
                                accept="image/*"
                                style={{
                                    border: '2px dashed #1890ff',
                                    borderRadius: '12px',
                                    background: '#f8f9ff'
                                }}
                            >
                                <p className="ant-upload-drag-icon" style={{ color: '#1890ff' }}>
                                    <UploadOutlined style={{ fontSize: '32px' }} />
                                </p>
                                <p className="ant-upload-text" style={{ color: '#1890ff', fontWeight: '500' }}>
                                    📷 Kéo & thả hoặc bấm để chọn ảnh chuyển khoản
                                </p>
                            </Upload.Dragger>

                            {previewUrl && (
                                <div style={{
                                    margin: '16px 0',
                                    textAlign: 'center',
                                    padding: '16px',
                                    background: '#f8f9ff',
                                    borderRadius: '12px',
                                    border: '1px solid #e9ecef'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px', color: '#495057' }}>
                                        Xem trước ảnh:
                                    </div>
                                    <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            style={{
                                                maxWidth: 300,
                                                maxHeight: 200,
                                                borderRadius: 12,
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                                border: '2px solid #fff'
                                            }}
                                        />
                                    </a>
                                </div>
                            )}

                            <Button
                                type="primary"
                                loading={completing}
                                onClick={handleComplete}
                                block
                                size="large"
                                style={{
                                    marginTop: 16,
                                    height: '48px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    fontSize: '16px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                                }}
                            >
                                {completing ? 'Đang xử lý...' : '✅ Hoàn thành cập nhật'}
                            </Button>
                        </>
                    )}
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default RefundPage;
