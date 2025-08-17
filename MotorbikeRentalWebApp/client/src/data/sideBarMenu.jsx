import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMotorcycle, faHome, faUser, faTools, faReceipt, faMoneyBillWave, faMapMarkerAlt, faBuilding, faCog, faChartLine } from '@fortawesome/free-solid-svg-icons';
// =================Employee Menu================
export const employeeMenu = [
    {
        path: "/employee",
        icon: () => <FontAwesomeIcon icon={faHome} />,
        label: "Home"
    },
    {
        path: "/employee/accessory",
        icon: () => <FontAwesomeIcon icon={faUser} />,
        label: "Quản lý phụ kiện"
    },
    {
        path: "/employee/motorbike",
        icon: () => <FontAwesomeIcon icon={faMotorcycle} />,
        label: "Quản lý xe máy"
    },
    {
        path: "/employee/maintenance",
        icon: () => <FontAwesomeIcon icon={faTools} />,
        label: "Quản lý bảo trì",
    },
    {
        path: "/employee/order",
        icon: () => <FontAwesomeIcon icon={faReceipt} />,
        label: "Quản lý đơn hàng",
    },
    {
        path: "/employee/refund",
        icon: () => <FontAwesomeIcon icon={faMoneyBillWave} />,
        label: "Quản lý hoàn tiền",
    },
    {
        path: "/employee/location",
        icon: () => <FontAwesomeIcon icon={faMapMarkerAlt} />,
        label: "Theo dõi vị trí xe máy"
    }
]

//admin menu
export const adminMenu = [
    {
        path: "/admin",
        icon: () => <FontAwesomeIcon icon={faHome} />,
        label: "Home"
    },
    {
        path: "/admin/account",
        icon: () => <FontAwesomeIcon icon={faUser} />,
        label: "Quản lý tài khoản"
    },
    {
        path: "/admin/branch",
        icon: () => <FontAwesomeIcon icon={faBuilding} />,
        label: "Quản lý chi nhánh"
    },
    {
        path: "/admin/motorbike-type",
        icon: () => <FontAwesomeIcon icon={faMotorcycle} />,
        label: "Quản lý loại xe máy"
    },
    {
        path: "/admin/pricing-rule",
        icon: () => <FontAwesomeIcon icon={faMoneyBillWave} />,
        label: "Quy tắc giá thuê"
    },
    {
        path: "/admin/specification",
        icon: () => <FontAwesomeIcon icon={faCog} />,
        label: "Quản lý thông số kỹ thuật"
    },
    {
        path: "/admin/feedback",
        icon: () => <FontAwesomeIcon icon={faReceipt} />,
        label: "Báo cáo từ khách hàng",
    },
    {
        path: "/admin/demand-prediction",
        icon: () => <FontAwesomeIcon icon={faChartLine} />,
        label: "Xem dự đoán nhu cầu",
    },
]
