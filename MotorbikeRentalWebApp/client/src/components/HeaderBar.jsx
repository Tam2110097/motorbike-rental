import React from 'react';
import { Layout, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LogoutOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Header } = Layout;

const HeaderBar = () => {
    const navigate = useNavigate();

    // Get user information from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '80px',
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <Link to="/" style={{ textDecoration: 'none' }}>
                <div className="logo-container" style={{ cursor: 'pointer' }}>
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        style={{
                            width: '280px',
                            height: 'auto',
                            maxHeight: '175px',
                            objectFit: 'contain',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    />
                </div>
            </Link>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {user ? (
                    <>
                        {/* Show My Orders link only for customers - positioned to the left */}
                        {user.role?.name === 'customer' && (
                            <Link
                                to="/order/my-order"
                                style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    color: 'white',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s ease',
                                    borderBottom: '2px solid transparent',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                                onMouseEnter={(e) => {
                                    const link = e.currentTarget;
                                    link.style.borderBottom = '2px solid white';
                                    link.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    const link = e.currentTarget;
                                    link.style.borderBottom = '2px solid transparent';
                                    link.style.backgroundColor = 'transparent';
                                }}
                            >
                                <ShoppingOutlined style={{ fontSize: '16px' }} />
                                Đơn hàng của tôi
                            </Link>
                        )}

                        <span style={{ color: 'white', fontSize: '16px' }}>
                            Chào mừng, {user.fullName} ({user.role?.name === 'customer' ? 'Khách hàng' : user.role?.name === 'admin' ? 'Quản trị viên' : user.role?.name === 'employee' ? 'Nhân viên' : 'Không xác định'})
                        </span>

                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={{
                                color: 'white',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.3s ease',
                                border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Logout */}
                            Đăng xuất
                        </Button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ fontSize: '18px', fontWeight: '500', color: 'white', textDecoration: 'none' }}>
                            {/* Login */}
                            Đăng nhập
                        </Link>
                        <div style={{ color: "white" }}>/</div>
                        <Link to="/register" style={{ fontSize: '18px', fontWeight: '500', color: 'white', textDecoration: 'none' }}>
                            {/* Register */}
                            Đăng ký
                        </Link>
                    </>
                )}
            </div>
        </Header>
    );
};

export default HeaderBar;
