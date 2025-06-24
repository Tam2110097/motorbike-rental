// src/components/SidebarMenu.jsx
import React from 'react';
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { employeeMenu, adminMenu } from '../data/sideBarMenu';
import { Link, useLocation } from 'react-router-dom';


const SidebarMenu = () => {

    const location = useLocation()
    const menuItems = adminMenu;
    const items = menuItems.map((item, index) => {
        const key = item.path;
        return {
            key,
            icon: React.createElement(item.icon),
            label: <Link to={item.path} style={{ textDecoration: "none" }}>{item.label}</Link>,
        };
    });
    return (
        <Menu
            mode="inline"
            defaultSelectedKeys={[location.pathname]}
            style={{ height: '100%', borderRight: 0, width: "220px" }}
            items={items}
        />)
};

export default SidebarMenu;
