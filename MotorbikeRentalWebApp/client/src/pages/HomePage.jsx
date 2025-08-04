import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu } from 'antd';
import HeaderBar from '../components/HeaderBar';
import Banner from '../components/Banner';
import Footer from '../components/Footer';
const { Header, Content, Sider } = Layout;
import SearchMotorbikeComponent from './customer/booking/SearchMotorbikeComponent';

const HomePage = () => {
    return (
        <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <HeaderBar />
            <Content style={{
                padding: '0',
                background: 'transparent',
                position: 'relative'
            }}>
                {/* Hero Section */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                    padding: '80px 0 40px 0',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Decorative elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        animation: 'float 6s ease-in-out infinite'
                    }}></div>

                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        right: '10%',
                        width: '100px',
                        height: '100px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        animation: 'pulse 4s ease-in-out infinite'
                    }}></div>

                    <div style={{
                        position: 'absolute',
                        bottom: '20%',
                        left: '10%',
                        width: '60px',
                        height: '60px',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        animation: 'pulse 4s ease-in-out infinite 2s'
                    }}></div>

                    {/* Main content */}
                    <div style={{
                        position: 'relative',
                        zIndex: 2,
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 20px'
                    }}>
                        <h1 style={{
                            fontSize: '3.5rem',
                            fontWeight: '800',
                            color: 'white',
                            margin: '0 0 20px 0',
                            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
                            letterSpacing: '2px'
                        }}>
                            🏍️ RENREN MOTORBIKE
                        </h1>

                        <p style={{
                            fontSize: '1.3rem',
                            color: 'rgba(255,255,255,0.9)',
                            margin: '0 0 40px 0',
                            fontWeight: '300',
                            maxWidth: '600px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            lineHeight: '1.6'
                        }}>
                            Khám phá Việt Nam với dịch vụ thuê xe máy chất lượng cao.
                            An toàn, tiện lợi và giá cả hợp lý.
                        </p>

                        {/* Stats Section */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '60px',
                            marginBottom: '50px',
                            flexWrap: 'wrap'
                        }}>
                            {/* <div style={{
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: '8px'
                                }}>500+</div>
                                <div style={{
                                    fontSize: '1rem',
                                    opacity: '0.8'
                                }}>Xe máy</div>
                            </div>

                            <div style={{
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: '8px'
                                }}>50+</div>
                                <div style={{
                                    fontSize: '1rem',
                                    opacity: '0.8'
                                }}>Chi nhánh</div>
                            </div>

                            <div style={{
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    marginBottom: '8px'
                                }}>10K+</div>
                                <div style={{
                                    fontSize: '1rem',
                                    opacity: '0.8'
                                }}>Khách hàng</div>
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Search Component Section */}
                <div style={{
                    background: 'white',
                    padding: '60px 0',
                    position: 'relative'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 20px'
                    }}>
                        <SearchMotorbikeComponent />
                    </div>
                </div>

                {/* Features Section */}
                <div style={{
                    background: '#f8f9fa',
                    padding: '80px 0',
                    textAlign: 'center'
                }}>
                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 20px'
                    }}>
                        <h2 style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '60px'
                        }}>
                            Tại sao chọn RENREN MOTORBIKE?
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '40px',
                            marginTop: '40px'
                        }}>
                            <div style={{
                                background: 'white',
                                padding: '40px 30px',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s ease',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '20px'
                                }}>🛡️</div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    marginBottom: '15px',
                                    color: '#333'
                                }}>An Toàn Tuyệt Đối</h3>
                                <p style={{
                                    color: '#666',
                                    lineHeight: '1.6'
                                }}>
                                    Tất cả xe đều được bảo hiểm đầy đủ và kiểm tra định kỳ.
                                    Đảm bảo an toàn cho mọi chuyến đi.
                                </p>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '40px 30px',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s ease',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '20px'
                                }}>💰</div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    marginBottom: '15px',
                                    color: '#333'
                                }}>Giá Cả Hợp Lý</h3>
                                <p style={{
                                    color: '#666',
                                    lineHeight: '1.6'
                                }}>
                                    Giá thuê cạnh tranh, không phí ẩn.
                                    Nhiều ưu đãi cho khách hàng thân thiết.
                                </p>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '40px 30px',
                                borderRadius: '15px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                transition: 'transform 0.3s ease',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-5px)'}
                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}>
                                <div style={{
                                    fontSize: '3rem',
                                    marginBottom: '20px'
                                }}>🚀</div>
                                <h3 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '600',
                                    marginBottom: '15px',
                                    color: '#333'
                                }}>Thuê Nhanh Chóng</h3>
                                <p style={{
                                    color: '#666',
                                    lineHeight: '1.6'
                                }}>
                                    Quy trình đơn giản, thủ tục nhanh gọn.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Content>

            <Footer />

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.1; }
                    50% { transform: scale(1.2); opacity: 0.3; }
                }
            `}</style>
        </Layout>
    );
};

export default HomePage;