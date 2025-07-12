import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, Menu } from 'antd';
import HeaderBar from '../components/HeaderBar';
import Banner from '../components/Banner';
const { Header, Content, Sider } = Layout;
import SearchMotorbikeComponent from './customer/booking/SearchMotorbikeComponent';

const HomePage = () => {
    // const {
    //     token: { colorBgContainer, borderRadiusLG },
    // } = theme.useToken();
    return (
        <Layout>
            <HeaderBar />
            <Banner component={<SearchMotorbikeComponent />} />
        </Layout>
    );
};
export default HomePage;