// src/layouts/AdminLayout.jsx
import React from 'react';
import { Layout, theme } from 'antd';
import HeaderBar from '../components/HeaderBar';
import SidebarMenu from '../components/SidebarMenu';

const { Sider, Content } = Layout;

const AdminLayout = ({ children }) => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />

            {/* Layout chia ngang: Sider - Content */}
            <Layout style={{ minHeight: 'calc(100vh - 64px)' }}>
                <Sider
                    width={250} // ✅ tăng chiều rộng ở đây
                    style={{
                        background: colorBgContainer,
                    }}
                >
                    <SidebarMenu />
                </Sider>

                <Layout
                    style={{
                        padding: '0 24px 24px',
                        overflow: 'auto',
                        width: '100%', // ✅ chiếm phần còn lại
                    }}
                >
                    <Content
                        style={{
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </Layout>

    );
};

export default AdminLayout;
