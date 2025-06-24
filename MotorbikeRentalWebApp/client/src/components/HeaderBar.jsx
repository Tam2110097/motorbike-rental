import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { Link } from 'react-router-dom';
const { Header, Content, Sider } = Layout;


const items1 = ['1', '2', '3'].map(key => ({
    key,
    label: `nav ${key}`,
}));


const HeaderBar = () => {

    return (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="logo-container">
                <img
                    src="/images/logo.png" // 👉 đúng đường dẫn nếu ảnh nằm ở public/images/logo.png
                    alt="Logo"
                    // style={{ height: '40px', marginRight: '16px', }}
                    style={{ width: '200px', height: 'auto', marginRight: '16px', marginTop: '16px' }}

                />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
                <Link to="/login" style={{ fontSize: '18px', fontWeight: '500', color: 'white', textDecoration: 'none' }}>Login</Link>
                <div style={{ color: "white" }}>/</div>
                <Link to="/register" style={{ fontSize: '18px', fontWeight: '500', color: 'white', textDecoration: 'none' }}>Register</Link>
            </div>
        </Header>
    )
}

export default HeaderBar
