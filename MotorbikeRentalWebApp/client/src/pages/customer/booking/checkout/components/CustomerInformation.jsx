import React, { useState } from 'react';
import { Typography, Button } from 'antd';
import { Link } from 'react-router-dom';

const { Title } = Typography;

// Mô phỏng trạng thái đăng nhập
const mockUser = {
    isLoggedIn: true, // Đổi thành true nếu muốn test trạng thái đã đăng nhập
    name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
};

const CustomerInformation = () => {
    const [user] = useState(mockUser);

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
            {user.isLoggedIn ? (
                <Title level={5} style={{ color: '#1890ff', fontWeight: 600 }}>
                    👋 Chào mừng, {user.name} ({user.email})!
                </Title>
            ) : (
                <>
                    <Title level={5} style={{ color: '#fa541c' }}>
                        Bạn chưa đăng nhập
                    </Title>
                    <Link to="/login">
                        <Button type="primary" style={{ marginTop: 12 }}>
                            Đăng nhập ngay
                        </Button>
                    </Link>
                </>
            )}
        </div>
    );
};

export default CustomerInformation;
