import React from 'react';
import { Layout, Button } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@ant-design/icons';

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
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="logo-container">
                <img
                    src="/images/logo.png"
                    alt="Logo"
                    style={{ width: '200px', height: 'auto', marginRight: '16px', marginTop: '16px' }}
                />
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {user ? (
                    <>
                        <span style={{ color: 'white', fontSize: '16px' }}>
                            Welcome, {user.fullName} ({user.role?.name || 'Unknown'})
                        </span>
                        <Button
                            type="text"
                            icon={<LogoutOutlined />}
                            onClick={handleLogout}
                            style={{ color: 'white', fontSize: '16px' }}
                        >
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={{ fontSize: '18px', fontWeight: '500', color: 'white', textDecoration: 'none' }}>
                            Login
                        </Link>
                        <div style={{ color: "white" }}>/</div>
                        <Link to="/register" style={{ fontSize: '18px', fontWeight: '500', color: 'white', textDecoration: 'none' }}>
                            Register
                        </Link>
                    </>
                )}
            </div>
        </Header>
    );
};

export default HeaderBar;
