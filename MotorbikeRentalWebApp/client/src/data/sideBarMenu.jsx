import { Link } from "react-router-dom";
import { LaptopOutlined, NotificationOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
// =================Employee Menu================
export const employeeMenu = [
    {
        name: "Home",
        path: "/",
        icon: "fa-solid fa-house",
    },
];
// =================Employee Menu================

//admin menu
// export const adminMenu = [
//     {
//         name: "Home",
//         path: "/",
//         icon: "fa-solid fa-house",
//     },
//     {
//         name: "Quản lý tài khoản",
//         path: "/admin/account",
//         icon: "fas fa-users",
//     }
// ];

//admin menu
export const adminMenu = [
    {
        path: "/admin",
        icon: HomeOutlined,
        label: "Home"
    },
    {
        path: "/admin/account",
        icon: UserOutlined,
        label: "Quản lý tài khoản"
    },
    {
        path: "/admin/branch",
        icon: HomeOutlined,
        label: "Quản lý chi nhánh"
    },
    {
        path: "/admin/feedback",
        icon: NotificationOutlined,
        label: "Báo cáo từ khách hàng",
    },
]
