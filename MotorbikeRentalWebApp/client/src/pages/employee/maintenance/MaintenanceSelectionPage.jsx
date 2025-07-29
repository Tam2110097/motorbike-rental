import React, { useEffect, useState } from 'react';
import { Card, Button, Select, Input, message, Spin, Row, Col, Typography, Divider, Tag } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MaintenanceSelectionPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [orderData, setOrderData] = useState(null);
    const [motorbikes, setMotorbikes] = useState([]);
    const [maintenanceLevels, setMaintenanceLevels] = useState({});
    const [selections, setSelections] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');

                // Fetch maintenance levels
                const levelsRes = await fetch('http://localhost:8080/api/v1/employee/maintenance/levels', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const levelsData = await levelsRes.json();
                if (levelsData.success) {
                    setMaintenanceLevels(levelsData.maintenanceLevels);
                }

                // Fetch order motorbikes
                const motorbikesRes = await fetch(`http://localhost:8080/api/v1/employee/maintenance/order/${orderId}/motorbikes`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const motorbikesData = await motorbikesRes.json();
                if (motorbikesData.success) {
                    setOrderData(motorbikesData.order);
                    setMotorbikes(motorbikesData.motorbikes);

                    // Initialize selections with 'normal' for all motorbikes
                    const initialSelections = {};
                    motorbikesData.motorbikes.forEach(mb => {
                        initialSelections[mb.motorbikeId] = {
                            level: 'normal',
                            description: ''
                        };
                    });
                    setSelections(initialSelections);
                } else {
                    message.error(motorbikesData.message || 'Không thể lấy thông tin xe');
                }
            } catch {
                message.error('Lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId]);

    const handleLevelChange = (motorbikeId, level) => {
        setSelections(prev => ({
            ...prev,
            [motorbikeId]: {
                ...prev[motorbikeId],
                level
            }
        }));
    };

    const handleDescriptionChange = (motorbikeId, description) => {
        setSelections(prev => ({
            ...prev,
            [motorbikeId]: {
                ...prev[motorbikeId],
                description
            }
        }));
    };

    const calculateTotalFee = () => {
        let total = 0;
        motorbikes.forEach(mb => {
            const selection = selections[mb.motorbikeId];
            if (selection) {
                const level = maintenanceLevels[selection.level];
                if (level) {
                    total += level.estimatedFee || 0;
                }
            }
        });
        return total;
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const maintenanceSelections = Object.keys(selections).map(motorbikeId => ({
                motorbikeId,
                level: selections[motorbikeId].level,
                description: selections[motorbikeId].description
            }));

            const res = await fetch(`http://localhost:8080/api/v1/employee/maintenance/order/${orderId}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ maintenanceSelections })
            });

            const data = await res.json();
            if (data.success) {
                message.success('Tạo bảo dưỡng thành công!');
                setTimeout(() => navigate('/employee/order'), 1000);
            } else {
                message.error(data.message || 'Tạo bảo dưỡng thất bại');
            }
        } catch {
            message.error('Lỗi khi tạo bảo dưỡng');
        } finally {
            setSubmitting(false);
        }
    };

    const getLevelColor = (level) => {
        const colors = {
            normal: 'green',
            light: 'blue',
            medium: 'orange',
            heavy: 'red'
        };
        return colors[level] || 'default';
    };

    if (loading) {
        return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
                Chọn cấp độ bảo dưỡng
            </Title>

            {orderData && (
                <Card style={{ marginBottom: 24 }}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Text strong>Mã đơn hàng: </Text>
                            <Text>{orderData.orderCode}</Text>
                        </Col>
                        <Col span={12}>
                            <Text strong>Ngày checkout: </Text>
                            <Text>{dayjs(orderData.checkOutDate).format('DD/MM/YYYY HH:mm')}</Text>
                        </Col>
                    </Row>
                </Card>
            )}

            <div style={{ marginBottom: 24 }}>
                <Title level={4}>Danh sách xe cần bảo dưỡng</Title>
                {motorbikes.map((motorbike) => {
                    const selection = selections[motorbike.motorbikeId];
                    const selectedLevel = selection ? maintenanceLevels[selection.level] : null;

                    return (
                        <Card key={motorbike.motorbikeId} style={{ marginBottom: 16 }}>
                            <Row gutter={16} align="middle">
                                <Col span={6}>
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
                                </Col>

                                <Col span={6}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong>Cấp độ bảo dưỡng:</Text>
                                    </div>
                                    <Select
                                        value={selection?.level || 'normal'}
                                        onChange={(value) => handleLevelChange(motorbike.motorbikeId, value)}
                                        style={{ width: '100%' }}
                                    >
                                        {Object.keys(maintenanceLevels).map(level => (
                                            <Option key={level} value={level}>
                                                <Tag color={getLevelColor(level)}>
                                                    {maintenanceLevels[level].name}
                                                </Tag>
                                            </Option>
                                        ))}
                                    </Select>
                                </Col>

                                <Col span={6}>
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
                                </Col>

                                <Col span={6}>
                                    <div style={{ marginBottom: 8 }}>
                                        <Text strong>Mô tả thêm:</Text>
                                    </div>
                                    <TextArea
                                        value={selection?.description || ''}
                                        onChange={(e) => handleDescriptionChange(motorbike.motorbikeId, e.target.value)}
                                        placeholder="Nhập mô tả bảo dưỡng (tùy chọn)"
                                        rows={2}
                                    />
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
            </div>

            <Divider />

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Title level={4}>
                    Tổng phí bảo dưỡng:
                    <span style={{ color: '#52c41a', marginLeft: 8 }}>
                        {calculateTotalFee().toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </span>
                </Title>
            </div>

            <div style={{ textAlign: 'center' }}>
                <Button
                    type="primary"
                    size="large"
                    onClick={handleSubmit}
                    loading={submitting}
                    style={{ marginRight: 16 }}
                >
                    Xác nhận bảo dưỡng
                </Button>
                <Button
                    size="large"
                    onClick={() => navigate('/employee/order')}
                >
                    Hủy
                </Button>
            </div>
        </div>
    );
};

export default MaintenanceSelectionPage; 