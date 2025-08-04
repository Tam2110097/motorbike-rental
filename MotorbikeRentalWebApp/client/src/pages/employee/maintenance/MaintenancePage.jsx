import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Tag, message, Spin, Modal, Typography, Tabs, Select, DatePicker, Input, Form } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';

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

    // New state for motorbike selection and scheduling
    const [motorbikes, setMotorbikes] = useState([]);
    const [selectedMotorbikes, setSelectedMotorbikes] = useState([]);
    const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [scheduleForm] = Form.useForm();

    useEffect(() => {
        fetchMaintenanceRecords();
        fetchMotorbikes();
    }, []);

    const fetchMotorbikes = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get("http://localhost:8080/api/v1/employee/motorbike/get-all", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.data.success) {
                // Filter out motorbikes that are already in maintenance
                const availableMotorbikes = res.data.motorbikes.filter(
                    motorbike => motorbike.status !== 'maintenance' && motorbike.status !== 'out_of_service'
                );
                setMotorbikes(availableMotorbikes);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách xe máy");
        }
    };

    const handleScheduleMaintenance = async (values) => {
        if (selectedMotorbikes.length === 0) {
            message.error('Vui lòng chọn ít nhất một xe máy');
            return;
        }

        setScheduling(true);
        try {
            const token = localStorage.getItem('token');
            const maintenanceData = {
                motorbikeIds: selectedMotorbikes,
                level: values.level,
                description: values.description,
                startDate: values.startDate?.toISOString(),
                estimatedEndDate: values.estimatedEndDate?.toISOString(),
                feeIfNoInsurance: values.feeIfNoInsurance ? parseInt(values.feeIfNoInsurance) : 0
            };

            console.log('Sending maintenance data:', maintenanceData);

            const res = await axios.post('http://localhost:8080/api/v1/employee/maintenance/schedule', maintenanceData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success) {
                message.success('Lên lịch bảo dưỡng thành công!');
                setScheduleModalVisible(false);
                setSelectedMotorbikes([]);
                scheduleForm.resetFields();
                fetchMaintenanceRecords();
                fetchMotorbikes(); // Refresh motorbike list
            } else {
                message.error(res.data.message || 'Lên lịch bảo dưỡng thất bại');
            }
        } catch (error) {
            console.log('Schedule maintenance error:', error);
            console.log('Error response:', error.response?.data);
            message.error(error.response?.data?.message || 'Lỗi khi lên lịch bảo dưỡng');
        } finally {
            setScheduling(false);
        }
    };

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
        // {
        //     title: 'Loại xe',
        //     dataIndex: ['motorbikeId', 'motorbikeType', 'name'],
        //     key: 'motorbikeType',
        //     render: (name) => name || '-'
        // },
        {
            title: 'Mã đơn hàng',
            dataIndex: ['rentalOrderId', 'orderCode'],
            key: 'orderCode',
            render: (orderCode) => <Text code>{orderCode || 'Được lên lịch bão dưỡng'}</Text>
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

    const motorbikeColumns = [
        {
            title: 'Chọn',
            key: 'select',
            render: (_, record) => (
                <input
                    type="checkbox"
                    checked={selectedMotorbikes.includes(record._id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedMotorbikes([...selectedMotorbikes, record._id]);
                        } else {
                            setSelectedMotorbikes(selectedMotorbikes.filter(id => id !== record._id));
                        }
                    }}
                />
            )
        },
        {
            title: 'Mã xe',
            dataIndex: 'code',
            key: 'code',
            render: (code) => <Text strong>{code}</Text>
        },
        {
            title: 'Loại xe',
            dataIndex: ['motorbikeType', 'name'],
            key: 'motorbikeType',
            render: (name) => name || '-'
        },
        {
            title: 'Chi nhánh',
            dataIndex: ['branchId', 'city'],
            key: 'branch',
            render: (city) => city || '-'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    'available': { text: 'Có sẵn', color: 'green' },
                    'rented': { text: 'Đã thuê', color: 'orange' },
                    'reserved': { text: 'Đã đặt', color: 'blue' }
                };
                const config = statusConfig[status] || { text: status, color: 'default' };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        }
    ];

    return (
        <AdminLayout>
            <div className="p-2">
                <h1 className="d-flex justify-content-center">QUẢN LÝ BẢO DƯỠNG XE</h1>

                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button
                        type="primary"
                        onClick={() => navigate('/employee/order')}
                        style={{ marginRight: 8 }}
                    >
                        Quay lại danh sách đơn hàng
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setScheduleModalVisible(true)}
                        disabled={selectedMotorbikes.length === 0}
                    >
                        Lên lịch bảo dưỡng ({selectedMotorbikes.length})
                    </Button>
                </div>

                <Tabs
                    defaultActiveKey="maintenance"
                    style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}
                    items={[
                        {
                            key: 'maintenance',
                            label: 'Danh sách bảo dưỡng',
                            children: (
                                <>
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
                                </>
                            )
                        },
                        {
                            key: 'schedule',
                            label: 'Lên lịch bảo dưỡng',
                            children: (
                                <div>
                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong>Chọn xe máy để lên lịch bảo dưỡng:</Text>
                                    </div>
                                    <Table
                                        columns={motorbikeColumns}
                                        dataSource={motorbikes}
                                        rowKey="_id"
                                        bordered
                                        pagination={{
                                            pageSize: 10,
                                            showSizeChanger: true,
                                            showTotal: (total, range) => `${range[0]}-${range[1]} trong ${total} xe máy`
                                        }}
                                    />
                                </div>
                            )
                        }
                    ]}
                />

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

                {/* Schedule Maintenance Modal */}
                <Modal
                    title="Lên lịch bảo dưỡng"
                    visible={scheduleModalVisible}
                    onCancel={() => {
                        setScheduleModalVisible(false);
                        setSelectedMotorbikes([]);
                        scheduleForm.resetFields();
                    }}
                    footer={null}
                    width={600}
                >
                    <Form
                        form={scheduleForm}
                        layout="vertical"
                        onFinish={handleScheduleMaintenance}
                    >
                        <Form.Item
                            label="Xe máy đã chọn"
                            name="selectedMotorbikes"
                        >
                            <div style={{ maxHeight: 100, overflowY: 'auto', border: '1px solid #d9d9d9', padding: 8, borderRadius: 6 }}>
                                {selectedMotorbikes.length > 0 ? (
                                    motorbikes
                                        .filter(motorbike => selectedMotorbikes.includes(motorbike._id))
                                        .map(motorbike => (
                                            <Tag key={motorbike._id} style={{ margin: 2 }}>
                                                {motorbike.code} - {motorbike.motorbikeType?.name}
                                            </Tag>
                                        ))
                                ) : (
                                    <Text type="secondary">Chưa chọn xe máy nào</Text>
                                )}
                            </div>
                        </Form.Item>

                        <Form.Item
                            label="Cấp độ bảo dưỡng"
                            name="level"
                            rules={[{ required: true, message: 'Vui lòng chọn cấp độ bảo dưỡng!' }]}
                        >
                            <Select placeholder="Chọn cấp độ bảo dưỡng">
                                <Select.Option value="light">Bảo dưỡng nhẹ</Select.Option>
                                <Select.Option value="normal">Bảo dưỡng thường</Select.Option>
                                <Select.Option value="medium">Bảo dưỡng trung bình</Select.Option>
                                <Select.Option value="heavy">Bảo dưỡng nặng</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label="Mô tả"
                            name="description"
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                        >
                            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về bảo dưỡng..." />
                        </Form.Item>

                        <Form.Item
                            label="Ngày bắt đầu"
                            name="startDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                        >
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn ngày và giờ bắt đầu"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Dự kiến hoàn thành"
                            name="estimatedEndDate"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày dự kiến hoàn thành!' }]}
                        >
                            <DatePicker
                                showTime
                                format="DD/MM/YYYY HH:mm"
                                placeholder="Chọn ngày và giờ dự kiến hoàn thành"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item
                            label="Phí bảo dưỡng (VNĐ)"
                            name="feeIfNoInsurance"
                        >
                            <Input
                                type="number"
                                placeholder="Nhập phí bảo dưỡng (nếu không có bảo hiểm)"
                                min={0}
                            />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ textAlign: 'right' }}>
                                <Button
                                    onClick={() => {
                                        setScheduleModalVisible(false);
                                        setSelectedMotorbikes([]);
                                        scheduleForm.resetFields();
                                    }}
                                    style={{ marginRight: 8 }}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={scheduling}
                                >
                                    Lên lịch bảo dưỡng
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default MaintenancePage; 