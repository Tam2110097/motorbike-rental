import React, { useState, useEffect } from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const CustomerInformation = ({ bookingData }) => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        if (token) {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);
            } catch {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    }, []);

    const handleLogin = () => {
        if (bookingData) {
            localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        }
        navigate('/login?redirect=/booking/checkout');
    };

    return (
        <div
            style={{
                maxWidth: 400,
                margin: '0 auto',
                padding: 24,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                textAlign: 'center',
            }}
        >
            {isLoggedIn && user ? (
                <Title level={5} style={{ color: '#1890ff', fontWeight: 600 }}>
                    👋 Chào mừng, {user.name} ({user.email})!
                </Title>
            ) : (
                <>
                    <Title level={5} style={{ color: '#fa541c' }}>
                        Bạn chưa đăng nhập
                    </Title>
                    <Button type="primary" style={{ marginTop: 12 }} onClick={handleLogin}>
                        Đăng nhập ngay
                    </Button>
                </>
            )}
        </div>
    );
};

export default CustomerInformation;
