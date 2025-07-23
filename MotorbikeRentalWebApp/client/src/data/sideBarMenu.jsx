import { Link } from "react-router-dom";
import {
    LaptopOutlined, NotificationOutlined, UserOutlined,
    HomeOutlined, MoneyCollectOutlined, BranchesOutlined,
    SettingOutlined,
} from '@ant-design/icons';
// =================Employee Menu================
export const employeeMenu = [
    {
        path: "/employee",
        icon: HomeOutlined,
        label: "Home"
    },
    {
        path: "/employee/accessory",
        icon: UserOutlined,
        label: "Quản lý sản phẩm"
    },
    {
        path: "/employee/motorbike",
        icon: HomeOutlined,
        label: "Quản lý xe máy"
    },
    {
        path: "/employee/rented-motorbike",
        icon: NotificationOutlined,
        label: "Xe đang được thuê",
    },
    {
        path: "/employee/order",
        icon: NotificationOutlined,
        label: "Quản lý đơn hàng",
    },
    {
        path: "/employee/refund",
        icon: NotificationOutlined,
        label: "Quản lý hoàn tiền",
    },
]

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
        icon: BranchesOutlined,
        label: "Quản lý chi nhánh"
    },
    {
        path: "/admin/motorbike-type",
        icon: HomeOutlined,
        label: "Quản lý loại xe máy"
    },
    {
        path: "/admin/pricing-rule",
        icon: MoneyCollectOutlined,
        label: "Quy tắc giá thuê"
    },
    {
        path: "/admin/specification",
        icon: SettingOutlined,
        label: "Quản lý thông số kỹ thuật"
    },
    {
        path: "/admin/feedback",
        icon: NotificationOutlined,
        label: "Báo cáo từ khách hàng",
    },
]
