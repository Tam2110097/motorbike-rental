import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    DatePicker,
    Spin,
    Alert,
    Tabs,
    Tag,
    Typography,
    Divider
} from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    CarOutlined,
    RiseOutlined,
    BarChartOutlined
} from '@ant-design/icons';
import AdminLayout from '../../components/AdminLayout';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement,
    Filler
);

const { RangePicker } = DatePicker;
const { Title: AntTitle, Text } = Typography;

const AdminPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState(null);

    // Data states
    const [overallStats, setOverallStats] = useState(null);
    const [salesByVehicleType, setSalesByVehicleType] = useState([]);
    const [salesByBranch, setSalesByBranch] = useState([]);
    const [salesByTypeAndBranch, setSalesByTypeAndBranch] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);

    const API_BASE_URL = 'http://localhost:8080/api/v1/admin';

    useEffect(() => {
        fetchDashboardData();
    }, [dateRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get auth token from localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Vui lòng đăng nhập để truy cập dashboard');
                setLoading(false);
                return;
            }

            const params = {};
            if (dateRange && dateRange.length === 2) {
                params.startDate = dateRange[0].format('YYYY-MM-DD');
                params.endDate = dateRange[1].format('YYYY-MM-DD');
            }

            // Configure headers with authentication
            const config = {
                params,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            const [
                overallStatsRes,
                salesByTypeRes,
                salesByBranchRes,
                salesByTypeAndBranchRes,
                recentOrdersRes
            ] = await Promise.all([
                axios.get(`${API_BASE_URL}/dashboard/overall-stats`, config),
                axios.get(`${API_BASE_URL}/dashboard/sales-by-vehicle-type`, config),
                axios.get(`${API_BASE_URL}/dashboard/sales-by-branch`, config),
                axios.get(`${API_BASE_URL}/dashboard/sales-by-vehicle-type-and-branch`, config),
                axios.get(`${API_BASE_URL}/dashboard/recent-orders`, config)
            ]);

            console.log('Overall stats:', overallStatsRes.data.data);
            console.log('Sales by vehicle type:', salesByTypeRes.data.data);
            console.log('Sales by branch:', salesByBranchRes.data.data);
            console.log('Sales by type and branch:', salesByTypeAndBranchRes.data.data);
            console.log('Recent orders:', recentOrdersRes.data.data);

            setOverallStats(overallStatsRes.data.data);
            setSalesByVehicleType(salesByTypeRes.data.data);
            setSalesByBranch(salesByBranchRes.data.data);
            setSalesByTypeAndBranch(salesByTypeAndBranchRes.data.data);
            setRecentOrders(recentOrdersRes.data.data);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            if (error.response?.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else if (error.response?.status === 403) {
                setError('Bạn không có quyền truy cập dashboard này.');
            } else if (error.response?.status === 404) {
                setError('API endpoint không tồn tại. Vui lòng kiểm tra lại.');
            } else if (error.response?.status >= 500) {
                setError('Lỗi server. Vui lòng thử lại sau.');
            } else {
                setError('Có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (number) => {
        return new Intl.NumberFormat('vi-VN').format(number);
    };

    // Chart configurations
    const vehicleTypeChartData = {
        labels: salesByVehicleType.map(item => item.vehicleTypeName),
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: salesByVehicleType.map(item => item.totalRevenue),
                backgroundColor: 'rgba(54, 162, 235, 0.8)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }
        ]
    };

    const branchChartData = {
        labels: salesByBranch.map(item => item.branchName),
        datasets: [
            {
                label: 'Doanh thu (VND)',
                data: salesByBranch.map(item => item.totalRevenue),
                backgroundColor: 'rgba(255, 99, 132, 0.8)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }
        ]
    };

    const monthlyRevenueData = overallStats?.monthlyRevenue ? {
        labels: overallStats.monthlyRevenue.map(item => `Tháng ${item._id}`),
        datasets: [
            {
                label: 'Doanh thu hàng tháng (VND)',
                data: overallStats.monthlyRevenue.map(item => item.revenue),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                fill: true,
                tension: 0.4
            }
        ]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    const lineChartOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value) {
                        return formatCurrency(value);
                    }
                }
            }
        }
    };

    // Table columns
    const vehicleTypeColumns = [
        {
            title: 'Loại xe',
            dataIndex: 'vehicleTypeName',
            key: 'vehicleTypeName',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => a.totalRevenue - b.totalRevenue,
        },
        {
            title: 'Phí bảo hiểm',
            dataIndex: 'totalDamageWaiver',
            key: 'totalDamageWaiver',
            render: (value) => formatCurrency(value || 0),
            sorter: (a, b) => (a.totalDamageWaiver || 0) - (b.totalDamageWaiver || 0),
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            render: (value) => formatNumber(value),
            sorter: (a, b) => a.totalOrders - b.totalOrders,
        },
        {
            title: 'Số lượng xe',
            dataIndex: 'totalQuantity',
            key: 'totalQuantity',
            render: (value) => formatNumber(value),
            sorter: (a, b) => a.totalQuantity - b.totalQuantity,
        },
        {
            title: 'Giá trung bình/ngày',
            dataIndex: 'averagePrice',
            key: 'averagePrice',
            render: (value) => formatCurrency(value),
        }
    ];

    const branchColumns = [
        {
            title: 'Chi nhánh',
            dataIndex: 'branchName',
            key: 'branchName',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'branchAddress',
            key: 'branchAddress',
        },
        {
            title: 'Doanh thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            render: (value) => formatCurrency(value),
            sorter: (a, b) => a.totalRevenue - b.totalRevenue,
        },
        {
            title: 'Số đơn hàng',
            dataIndex: 'totalOrders',
            key: 'totalOrders',
            render: (value) => formatNumber(value),
            sorter: (a, b) => a.totalOrders - b.totalOrders,
        },
        {
            title: 'Giá trị đơn hàng TB',
            dataIndex: 'averageOrderValue',
            key: 'averageOrderValue',
            render: (value) => formatCurrency(value),
        }
    ];

    const recentOrdersColumns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'orderCode',
            key: 'orderCode',
        },
        {
            title: 'Chi nhánh nhận',
            dataIndex: ['branchReceive', 'name'],
            key: 'branchReceive',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'grandTotal',
            key: 'grandTotal',
            render: (value) => formatCurrency(value),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = {
                    pending: { color: 'orange', text: 'Chờ xác nhận' },
                    confirmed: { color: 'blue', text: 'Đã xác nhận' },
                    active: { color: 'green', text: 'Đang thuê' },
                    completed: { color: 'purple', text: 'Hoàn thành' },
                    cancelled: { color: 'red', text: 'Đã hủy' }
                };
                const config = statusConfig[status] || { color: 'default', text: status };
                return <Tag color={config.color}>{config.text}</Tag>;
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        }
    ];

    return (
        <AdminLayout>
            <div className="p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <AntTitle level={2} className="text-center mb-2">
                            <BarChartOutlined className="mr-3 text-indigo-600" />
                            Bảng điều khiển quản trị
                        </AntTitle>
                        <Text className="text-gray-600 text-center block">
                            Thống kê doanh thu và hiệu suất kinh doanh
                        </Text>
                    </div>

                    {/* Date Range Filter */}
                    <Card className="mb-6 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Text strong>Bộ lọc thời gian:</Text>
                                <RangePicker
                                    value={dateRange}
                                    onChange={setDateRange}
                                    format="DD/MM/YYYY"
                                    placeholder={['Từ ngày', 'Đến ngày']}
                                />
                            </div>
                            <Text type="secondary">
                                {dateRange ?
                                    `${dateRange[0].format('DD/MM/YYYY')} - ${dateRange[1].format('DD/MM/YYYY')}` :
                                    'Tất cả thời gian'
                                }
                            </Text>
                        </div>
                    </Card>

                    {error && (
                        <Alert
                            message="Lỗi"
                            description={
                                <div>
                                    <p>{error}</p>
                                    <button
                                        onClick={fetchDashboardData}
                                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                    >
                                        Thử lại
                                    </button>
                                </div>
                            }
                            type="error"
                            showIcon
                            className="mb-6"
                        />
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <Spin size="large" />
                            <div className="mt-4">Đang tải dữ liệu...</div>
                        </div>
                    ) : (
                        <>
                            {/* Overall Statistics */}
                            {overallStats && (
                                <Row gutter={[16, 16]} className="mb-8">
                                    <Col xs={24} sm={12} lg={6}>
                                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                            <Statistic
                                                title="Tổng doanh thu"
                                                value={overallStats.totalRevenue}
                                                precision={0}
                                                valueStyle={{ color: '#3f8600' }}
                                                prefix={<DollarOutlined />}
                                                suffix="VND"
                                                formatter={(value) => formatCurrency(value)}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} lg={6}>
                                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                            <Statistic
                                                title="Tổng đơn hàng"
                                                value={overallStats.totalOrders}
                                                valueStyle={{ color: '#1890ff' }}
                                                prefix={<ShoppingCartOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} lg={6}>
                                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                            <Statistic
                                                title="Giá trị đơn hàng TB"
                                                value={overallStats.averageOrderValue}
                                                precision={0}
                                                valueStyle={{ color: '#722ed1' }}
                                                prefix={<RiseOutlined />}
                                                suffix="VND"
                                                formatter={(value) => formatCurrency(value)}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12} lg={6}>
                                        <Card className="shadow-lg hover:shadow-xl transition-shadow">
                                            <Statistic
                                                title="Tỷ lệ hoàn thành"
                                                value={100}
                                                suffix="%"
                                                valueStyle={{ color: '#52c41a' }}
                                                prefix={<CarOutlined />}
                                            />
                                        </Card>
                                    </Col>
                                </Row>
                            )}

                            {/* Charts and Tables */}
                            <Tabs
                                defaultActiveKey="1"
                                size="large"
                                className="bg-white rounded-lg shadow-lg p-6"
                                items={[
                                    {
                                        key: '1',
                                        label: 'Tổng quan',
                                        children: (
                                            <Row gutter={[24, 24]}>
                                                <Col xs={24} lg={12}>
                                                    <Card title="Doanh thu theo loại xe" className="shadow-md">
                                                        <div style={{ height: '400px' }}>
                                                            {salesByVehicleType.length > 0 && (
                                                                <Bar data={vehicleTypeChartData} options={chartOptions} />
                                                            )}
                                                        </div>
                                                    </Card>
                                                </Col>
                                                <Col xs={24} lg={12}>
                                                    <Card title="Doanh thu theo chi nhánh" className="shadow-md">
                                                        <div style={{ height: '400px' }}>
                                                            {salesByBranch.length > 0 && (
                                                                <Bar data={branchChartData} options={chartOptions} />
                                                            )}
                                                        </div>
                                                    </Card>
                                                </Col>
                                                {monthlyRevenueData && (
                                                    <Col xs={24}>
                                                        <Card title="Doanh thu hàng tháng" className="shadow-md">
                                                            <div style={{ height: '400px' }}>
                                                                <Line data={monthlyRevenueData} options={lineChartOptions} />
                                                            </div>
                                                        </Card>
                                                    </Col>
                                                )}
                                            </Row>
                                        )
                                    },
                                    {
                                        key: '2',
                                        label: 'Theo loại xe',
                                        children: (
                                            <Card title="Thống kê doanh thu theo loại xe" className="shadow-md">
                                                <Table
                                                    columns={vehicleTypeColumns}
                                                    dataSource={salesByVehicleType}
                                                    rowKey="_id"
                                                    pagination={{ pageSize: 10 }}
                                                    scroll={{ x: true }}
                                                />
                                            </Card>
                                        )
                                    },
                                    {
                                        key: '3',
                                        label: 'Theo chi nhánh',
                                        children: (
                                            <Card title="Thống kê doanh thu theo chi nhánh" className="shadow-md">
                                                <Table
                                                    columns={branchColumns}
                                                    dataSource={salesByBranch}
                                                    rowKey="_id"
                                                    pagination={{ pageSize: 10 }}
                                                    scroll={{ x: true }}
                                                />
                                            </Card>
                                        )
                                    },
                                    {
                                        key: '4',
                                        label: 'Chi tiết',
                                        children: (
                                            <Card title="Thống kê chi tiết theo loại xe và chi nhánh" className="shadow-md">
                                                {salesByTypeAndBranch.map((item, index) => (
                                                    <div key={index} className="mb-6">
                                                        <AntTitle level={4} className="mb-4">
                                                            {item.vehicleTypeName}
                                                        </AntTitle>
                                                        <Table
                                                            columns={[
                                                                {
                                                                    title: 'Chi nhánh',
                                                                    dataIndex: 'branchName',
                                                                    key: 'branchName',
                                                                },
                                                                {
                                                                    title: 'Doanh thu',
                                                                    dataIndex: 'totalRevenue',
                                                                    key: 'totalRevenue',
                                                                    render: (value) => formatCurrency(value),
                                                                },
                                                                {
                                                                    title: 'Phí bảo hiểm',
                                                                    dataIndex: 'totalDamageWaiver',
                                                                    key: 'totalDamageWaiver',
                                                                    render: (value) => formatCurrency(value || 0),
                                                                },
                                                                {
                                                                    title: 'Số đơn hàng',
                                                                    dataIndex: 'totalOrders',
                                                                    key: 'totalOrders',
                                                                    render: (value) => formatNumber(value),
                                                                },
                                                                {
                                                                    title: 'Số lượng xe',
                                                                    dataIndex: 'totalQuantity',
                                                                    key: 'totalQuantity',
                                                                    render: (value) => formatNumber(value),
                                                                }
                                                            ]}
                                                            dataSource={item.branches}
                                                            rowKey="branchId"
                                                            pagination={false}
                                                            size="small"
                                                        />
                                                        <Divider />
                                                    </div>
                                                ))}
                                            </Card>
                                        )
                                    },
                                    {
                                        key: '5',
                                        label: 'Đơn hàng gần đây',
                                        children: (
                                            <Card title="10 đơn hàng gần đây" className="shadow-md">
                                                <Table
                                                    columns={recentOrdersColumns}
                                                    dataSource={recentOrders}
                                                    rowKey="_id"
                                                    pagination={false}
                                                    scroll={{ x: true }}
                                                />
                                            </Card>
                                        )
                                    }
                                ]}
                            />
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPage;
