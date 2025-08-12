import React, { useMemo } from 'react';
import { MailOutlined, PhoneOutlined, UserOutlined, HomeOutlined, FieldTimeOutlined } from '@ant-design/icons';
import { Card, Typography, Descriptions, Button, Row, Col, Tag } from 'antd';
import AdminLayout from '../../components/AdminLayout';

const { Title, Text } = Typography;

// Removed unused Layout destructuring



const EmployeePage = () => {
    // const {
    //     token: { colorBgContainer, borderRadiusLG },
    // } = theme.useToken();
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || {};
        } catch {
            return {};
        }
    }, []);

    const infoItems = [
        {
            label: 'Họ và tên',
            value: user.fullName || '-'
        },
        {
            label: 'Email',
            value: user.email || '-',
            icon: <MailOutlined style={{ color: '#1677ff' }} />
        },
        {
            label: 'Số điện thoại',
            value: user.phone || '-',
            icon: <PhoneOutlined style={{ color: '#52c41a' }} />
        },
        {
            label: 'Vai trò',
            value: <Tag color="blue">{user.role?.name || 'employee'}</Tag>
        }
    ];

    return (
        <AdminLayout>
            <div style={{ padding: 16 }}>
                <Card
                    style={{
                        marginBottom: 16,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: 16,
                        border: 'none',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.12)'
                    }}
                >
                    <Title level={3} style={{ color: 'white', margin: 0 }}>Trang nhân viên</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Thông tin cá nhân và lối tắt chức năng</Text>
                </Card>

                <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                        <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                            <Title level={4} style={{ marginTop: 0 }}>Thông tin cá nhân</Title>
                            <Descriptions column={1} colon={false}>
                                {infoItems.map((item, idx) => (
                                    <Descriptions.Item key={idx} label={item.label}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {item.icon}
                                            <span>{item.value}</span>
                                        </div>
                                    </Descriptions.Item>
                                ))}
                            </Descriptions>
                        </Card>
                    </Col>
                    <Col xs={24} md={12}>
                        <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                            <Title level={4} style={{ marginTop: 0 }}>Lối tắt nhanh</Title>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <Button type="primary" size="large" onClick={() => (window.location.href = '/employee/order')}>
                                    Quản lý đơn hàng
                                </Button>
                                <Button size="large" onClick={() => (window.location.href = '/employee/motorbike')}>
                                    Quản lý xe máy
                                </Button>
                                <Button size="large" onClick={() => (window.location.href = '/employee/accessory')}>
                                    Quản lý phụ kiện
                                </Button>
                                <Button size="large" onClick={() => (window.location.href = '/employee/location')}>
                                    Theo dõi vị trí
                                </Button>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={24}>
                        <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                            <Title level={4} style={{ marginTop: 0 }}>Lịch hôm nay</Title>
                            <div style={{ color: '#6b7280', marginBottom: 8 }}>
                                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <Card size="small" style={{ borderRadius: 10 }}>
                                    <b>Nhận xe</b>
                                    <div style={{ color: '#6b7280', marginTop: 6 }}>09:00 - 10:00</div>
                                    <div style={{ marginTop: 4 }}>Chi nhánh A - 3 đơn</div>
                                </Card>
                                <Card size="small" style={{ borderRadius: 10 }}>
                                    <b>Trả xe</b>
                                    <div style={{ color: '#6b7280', marginTop: 6 }}>16:00 - 17:00</div>
                                    <div style={{ marginTop: 4 }}>Chi nhánh B - 2 đơn</div>
                                </Card>
                                <Card size="small" style={{ borderRadius: 10 }}>
                                    <b>Giấy tờ cần duyệt</b>
                                    <div style={{ color: '#6b7280', marginTop: 6 }}>Hôm nay</div>
                                    <div style={{ marginTop: 4 }}>4 khách hàng chờ xác minh</div>
                                </Card>
                                <Card size="small" style={{ borderRadius: 10 }}>
                                    <b>Bảo trì</b>
                                    <div style={{ color: '#6b7280', marginTop: 6 }}>Cả ngày</div>
                                    <div style={{ marginTop: 4 }}>2 xe cần kiểm tra</div>
                                </Card>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>
        </AdminLayout>
    );
};

export default EmployeePage;
