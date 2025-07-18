import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotAllowed = () => {
    const navigate = useNavigate();
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8f8f8',
        }}>
            <h1 style={{ color: '#fa541c', fontSize: 36, marginBottom: 16 }}>🚫 Không được phép truy cập</h1>
            <p style={{ fontSize: 18, marginBottom: 32 }}>
                Bạn không có quyền truy cập vào trang này. Vui lòng quay lại trang chủ hoặc đăng nhập với tài khoản phù hợp.
            </p>
            <Button type="primary" size="large" onClick={() => navigate('/')}>Về trang chủ</Button>
        </div>
    );
};

export default NotAllowed;