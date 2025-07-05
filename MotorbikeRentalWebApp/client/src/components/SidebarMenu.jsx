// src/components/SidebarMenu.jsx
import React from 'react';
import { Menu, Empty } from 'antd';
import { employeeMenu, adminMenu } from '../data/sideBarMenu';
import { Link, useLocation } from 'react-router-dom';


const SidebarMenu = () => {
    const location = useLocation();

    // Get user information from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    // Debug: Log user data to see what's available
    console.log('User data from localStorage:', user);

    // Set menu items based on user type
    let menuItems = [];
    if (user && user.role && user.role.name === 'admin') {
        menuItems = adminMenu;
    } else if (user && user.role && user.role.name === 'employee') {
        menuItems = employeeMenu;
    }

    // If no user or user type is not admin/employee, show empty state
    if (!user || !user.role || (user.role.name !== 'admin' && user.role.name !== 'employee')) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <Empty
                    description="No menu available for this user type"
                    style={{ color: '#666' }}
                />
            </div>
        );
    }

    const items = menuItems.map((item) => {
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
        />
    );
};

export default SidebarMenu;
