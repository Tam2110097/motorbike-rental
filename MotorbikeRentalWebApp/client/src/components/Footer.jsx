import React from 'react';
import { Layout, Row, Col, Typography, Divider, Space } from 'antd';
import {
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    InstagramOutlined,
    TwitterOutlined,
    YoutubeOutlined,
    SafetyOutlined,
    DollarOutlined,
    ClockCircleOutlined,
    CustomerServiceOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <AntFooter style={{
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: 'white',
            padding: '60px 0 20px 0',
            marginTop: 'auto'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 20px'
            }}>
                <Row gutter={[40, 40]}>
                    {/* Company Info */}
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ marginBottom: '20px' }}>
                            <Title level={3} style={{
                                color: 'white',
                                marginBottom: '15px',
                                fontSize: '1.5rem'
                            }}>
                                🏍️ RENREN MOTORBIKE
                            </Title>
                            <Text style={{
                                color: 'rgba(255,255,255,0.8)',
                                lineHeight: '1.6',
                                fontSize: '14px'
                            }}>
                                Dịch vụ thuê xe máy chất lượng cao tại Việt Nam.
                                An toàn, tiện lợi và giá cả hợp lý cho mọi chuyến đi.
                            </Text>
                        </div>

                        <Space direction="vertical" size="small">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <PhoneOutlined style={{ color: '#1890ff' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    1900-xxxx
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MailOutlined style={{ color: '#1890ff' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    info@renrenmotorbike.com
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <EnvironmentOutlined style={{ color: '#1890ff' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Hà Nội, Việt Nam
                                </Text>
                            </div>
                        </Space>
                    </Col>

                    {/* Quick Links */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={4} style={{
                            color: 'white',
                            marginBottom: '20px',
                            fontSize: '1.2rem'
                        }}>
                            Liên Kết Nhanh
                        </Title>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Link href="/" style={{
                                color: 'rgba(255,255,255,0.8)',
                                display: 'block',
                                padding: '4px 0',
                                transition: 'color 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                                Trang Chủ
                            </Link>
                            <Link href="#" style={{
                                color: 'rgba(255,255,255,0.8)',
                                display: 'block',
                                padding: '4px 0',
                                transition: 'color 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                                Bảng Giá
                            </Link>
                            <Link href="#" style={{
                                color: 'rgba(255,255,255,0.8)',
                                display: 'block',
                                padding: '4px 0',
                                transition: 'color 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                                Chi Nhánh
                            </Link>
                            <Link href="#" style={{
                                color: 'rgba(255,255,255,0.8)',
                                display: 'block',
                                padding: '4px 0',
                                transition: 'color 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.8)'}>
                                Về Chúng Tôi
                            </Link>
                        </Space>
                    </Col>

                    {/* Services */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={4} style={{
                            color: 'white',
                            marginBottom: '20px',
                            fontSize: '1.2rem'
                        }}>
                            Dịch Vụ
                        </Title>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <SafetyOutlined style={{ color: '#52c41a' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Bảo Hiểm Đầy Đủ
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <DollarOutlined style={{ color: '#52c41a' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Giá Cả Hợp Lý
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ClockCircleOutlined style={{ color: '#52c41a' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Thuê 24/7
                                </Text>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CustomerServiceOutlined style={{ color: '#52c41a' }} />
                                <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Hỗ Trợ 24/7
                                </Text>
                            </div>
                        </Space>
                    </Col>

                    {/* Social Media & Contact */}
                    <Col xs={24} sm={12} md={6}>
                        <Title level={4} style={{
                            color: 'white',
                            marginBottom: '20px',
                            fontSize: '1.2rem'
                        }}>
                            Theo Dõi Chúng Tôi
                        </Title>
                        <Space size="large" style={{ marginBottom: '20px' }}>
                            <Link href="https://facebook.com" target="_blank">
                                <FacebookOutlined style={{
                                    fontSize: '24px',
                                    color: '#1877f2',
                                    transition: 'transform 0.3s ease'
                                }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                            </Link>
                            <Link href="https://instagram.com" target="_blank">
                                <InstagramOutlined style={{
                                    fontSize: '24px',
                                    color: '#e4405f',
                                    transition: 'transform 0.3s ease'
                                }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                            </Link>
                            <Link href="https://twitter.com" target="_blank">
                                <TwitterOutlined style={{
                                    fontSize: '24px',
                                    color: '#1da1f2',
                                    transition: 'transform 0.3s ease'
                                }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                            </Link>
                            <Link href="https://youtube.com" target="_blank">
                                <YoutubeOutlined style={{
                                    fontSize: '24px',
                                    color: '#ff0000',
                                    transition: 'transform 0.3s ease'
                                }}
                                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                            </Link>
                        </Space>

                        {/* <div style={{ marginTop: '20px' }}>
                            <Text style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '14px',
                                display: 'block',
                                marginBottom: '8px'
                            }}>
                                Giờ Làm Việc:
                            </Text>
                            <Text style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '14px',
                                display: 'block'
                            }}>
                                Thứ 2 - Chủ Nhật: 8:00 - 22:00
                            </Text>
                        </div> */}
                    </Col>
                </Row>

                <Divider style={{
                    borderColor: 'rgba(255,255,255,0.2)',
                    margin: '40px 0 20px 0'
                }} />

                {/* Bottom Section */}
                <Row justify="space-between" align="middle">
                    <Col xs={24} sm={12}>
                        <Text style={{
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '14px'
                        }}>
                            © {currentYear} RENREN MOTORBIKE. Tất cả quyền được bảo lưu.
                        </Text>
                    </Col>
                    <Col xs={24} sm={12} style={{ textAlign: 'right' }}>
                        <Space size="large">
                            <Link href="/privacy" style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '14px',
                                transition: 'color 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                                Chính Sách Bảo Mật
                            </Link>
                            <Link href="/terms" style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '14px',
                                transition: 'color 0.3s ease'
                            }}
                                onMouseEnter={(e) => e.target.style.color = '#1890ff'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}>
                                Điều Khoản Sử Dụng
                            </Link>
                        </Space>
                    </Col>
                </Row>
            </div>
        </AntFooter>
    );
};

export default Footer;
