import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Tag, message, Spin, Modal, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusMap = {
    in_progress: { color: 'orange', label: 'Đang bảo dưỡng' },
    completed: { color: 'green', label: 'Đã hoàn thành' }
};

const levelMap = {
    normal: { color: 'green', label: 'Bảo dưỡng thường' },
    light: { color: 'blue', label: 'Bảo dưỡng nhẹ' },
    medium: { color: 'orange', label: 'Bảo dưỡng trung bình' },
    heavy: { color: 'red', label: 'Bảo dưỡng nặng' }
};

const MaintenancePage = () => {
    const navigate = useNavigate();
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [completing, setCompleting] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchMaintenanceRecords();
    }, []);

    const fetchMaintenanceRecords = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:8080/api/v1/employee/maintenance/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setMaintenanceRecords(data.maintenanceRecords || []);
            } else {
                message.error(data.message || 'Không thể lấy danh sách bảo dưỡng.');
            }
        } catch {
            message.error('Lỗi khi tải danh sách bảo dưỡng.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteMaintenance = async (maintenanceId) => {
        setCompleting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/v1/employee/maintenance/${maintenanceId}/complete`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                message.success('Hoàn thành bảo dưỡng thành công!');
                fetchMaintenanceRecords(); // Refresh the list
            } else {
                message.error(data.message || 'Hoàn thành bảo dưỡng thất bại');
            }
        } catch {
            message.error('Lỗi khi hoàn thành bảo dưỡng.');
        } finally {
            setCompleting(false);
        }
    };

    const columns = [
        {
            title: 'Mã xe',
            dataIndex: ['motorbikeId', 'code'],
            key: 'code',
            render: (code) => <Text strong>{code}</Text>
        },
        {
            title: 'Loại xe',
            dataIndex: ['motorbikeId', 'motorbikeType', 'name'],
            key: 'motorbikeType',
            render: (name) => name || '-'
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: ['rentalOrderId', 'orderCode'],
            key: 'orderCode',
            render: (orderCode) => <Text code>{orderCode}</Text>
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            key: 'level',
            render: (level) => (
                <Tag color={levelMap[level]?.color}>
                    {levelMap[level]?.label || level}
                </Tag>
            )
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (description) => (
                <div style={{ maxWidth: 200 }}>
                    <Text ellipsis={{ tooltip: description }}>
                        {description || '-'}
                    </Text>
                </div>
            )
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Dự kiến hoàn thành',
            dataIndex: 'estimatedEndDate',
            key: 'estimatedEndDate',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Phí bảo dưỡng',
            dataIndex: 'feeIfNoInsurance',
            key: 'feeIfNoInsurance',
            render: (fee) => fee?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 VND'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={statusMap[status]?.color}>
                    {statusMap[status]?.label || status}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => {
                if (record.status === 'in_progress') {
                    return (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                                setSelectedMaintenance(record);
                                setModalVisible(true);
                            }}
                        >
                            Hoàn thành
                        </Button>
                    );
                }
                return (
                    <Text type="secondary">Đã hoàn thành</Text>
                );
            }
        }
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                Quản lý bảo dưỡng xe
            </Title>

            <div style={{ marginBottom: 16, textAlign: 'right' }}>
                <Button
                    type="primary"
                    onClick={() => navigate('/employee/order')}
                >
                    Quay lại danh sách đơn hàng
                </Button>
            </div>

            {loading ? (
                <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />
            ) : (
                <Table
                    columns={columns}
                    dataSource={maintenanceRecords}
                    rowKey="_id"
                    bordered
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} bảo dưỡng`
                    }}
                />
            )}

            <Modal
                title="Xác nhận hoàn thành bảo dưỡng"
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setSelectedMaintenance(null);
                }}
                footer={[
                    <Button
                        key="cancel"
                        onClick={() => {
                            setModalVisible(false);
                            setSelectedMaintenance(null);
                        }}
                    >
                        Hủy
                    </Button>,
                    <Button
                        key="confirm"
                        type="primary"
                        loading={completing}
                        onClick={() => {
                            if (selectedMaintenance) {
                                handleCompleteMaintenance(selectedMaintenance._id);
                                setModalVisible(false);
                                setSelectedMaintenance(null);
                            }
                        }}
                    >
                        Xác nhận hoàn thành
                    </Button>
                ]}
            >
                {selectedMaintenance && (
                    <div>
                        <p><strong>Mã xe:</strong> {selectedMaintenance.motorbikeId?.code}</p>
                        <p><strong>Cấp độ bảo dưỡng:</strong> {levelMap[selectedMaintenance.level]?.label}</p>
                        <p><strong>Mô tả:</strong> {selectedMaintenance.description}</p>
                        <p><strong>Phí bảo dưỡng:</strong> {selectedMaintenance.feeIfNoInsurance?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                        <p style={{ color: '#52c41a', fontWeight: 'bold' }}>
                            Xác nhận hoàn thành bảo dưỡng cho xe này?
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MaintenancePage; 