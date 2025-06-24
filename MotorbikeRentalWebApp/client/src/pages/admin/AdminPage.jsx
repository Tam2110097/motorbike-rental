import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu } from 'antd';
import HeaderBar from '../../components/HeaderBar';
import AdminLayout from '../../components/AdminLayout';

const { Header, Content, Sider } = Layout;



const AdminPage = () => {
    // const {
    //     token: { colorBgContainer, borderRadiusLG },
    // } = theme.useToken();
    return (
        <AdminLayout>
            <h1>Admin page</h1>
        </AdminLayout>
    );
};

export default AdminPage;
