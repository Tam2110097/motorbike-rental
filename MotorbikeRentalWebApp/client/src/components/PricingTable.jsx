import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Typography,
    Spin,
    Empty,
    Tag,
    Space,
    Button,
    Input,
    Select,
    Row,
    Col,
    Image,
    Tooltip,
    message,
    Divider
} from 'antd';
import {
    SearchOutlined,
    DollarOutlined,
    SafetyOutlined,
    CarOutlined,
    EyeOutlined,
    BookOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const PricingTable = ({
    // showBookButton = false,
    showViewButton = false,
    // onBookClick = () => { },
    onViewClick = () => { },
    branchId = null,
    title = "Bảng Giá Thuê Xe",
    showFilters = true
}) => {
    const [motorbikeTypes, setMotorbikeTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [sortOrder, setSortOrder] = useState('name');
    const [filterStatus, setFilterStatus] = useState('all');

    // Fetch motorbike types data
    const fetchMotorbikeTypes = async () => {
        try {
            setLoading(true);
            setError(null);

            let url = 'http://localhost:8080/api/v1/customer/motorbike-type/available';
            if (branchId) {
                url += `?branchId=${branchId}`;
            }

            const res = await axios.get(url);
            if (res.data.success) {
                setMotorbikeTypes(res.data.motorbikeTypes || []);
            } else {
                setError(res.data.message || 'Có lỗi xảy ra khi tải dữ liệu');
                message.error(res.data.message || 'Có lỗi xảy ra khi tải dữ liệu');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi kết nối mạng';
            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMotorbikeTypes();
    }, [branchId]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    // Filter and sort data
    const getFilteredData = () => {
        let filtered = motorbikeTypes.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchText.toLowerCase());

            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'available' && item.availableCount > 0) ||
                (filterStatus === 'unavailable' && item.availableCount === 0);

            return matchesSearch && matchesStatus;
        });

        // Sort data
        filtered.sort((a, b) => {
            switch (sortOrder) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'price':
                    return a.price - b.price;
                case 'sameBranchPrice':
                    return a.price - b.price;
                case 'diffBranchPrice':
                    return (a.price * 1.2) - (b.price * 1.2);
                case 'damageWaiver':
                    return a.dailyDamageWaiver - b.dailyDamageWaiver;
                default:
                    return 0;
            }
        });

        return filtered;
    };

    // Table columns configuration
    const columns = [
        {
            title: 'Tên Xe',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <Text strong>{text}</Text>
                    {record.description && (
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {/* {record.description} */}
                            </Text>
                        </div>
                    )}
                </div>
            ),
            sorter: true
        },
        {
            title: 'Giá Cùng Chi Nhánh',
            dataIndex: 'price',
            key: 'sameBranchPrice',
            render: (price) => (
                <Text strong style={{ color: '#52c41a' }}>
                    {formatCurrency(price)}
                </Text>
            ),
            sorter: true
        },
        {
            title: 'Giá Khác Chi Nhánh',
            dataIndex: 'price',
            key: 'diffBranchPrice',
            render: (price) => (
                <Text strong style={{ color: '#fa8c16' }}>
                    {formatCurrency(price * 1.2)}
                </Text>
            ),
            sorter: true
        },
        {
            title: 'Bảo Hiểm/Ngày',
            dataIndex: 'dailyDamageWaiver',
            key: 'damageWaiver',
            render: (waiver) => (
                <Text style={{ color: '#1890ff' }}>
                    {formatCurrency(waiver)}
                </Text>
            ),
            sorter: true
        },
        {
            title: 'Thao Tác',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    {showViewButton && (
                        <Tooltip title="Xem chi tiết">
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                size="small"
                                onClick={() => onViewClick && onViewClick(record)}
                                title='Xem chi tiết'
                            />
                        </Tooltip>
                    )}
                </Space>
            )
        }
    ];

    // Handle table change (sorting, pagination)
    const handleTableChange = (pagination, filters, sorter) => {
        if (sorter.field) {
            setSortOrder(sorter.field);
        }
    };

    const filteredData = getFilteredData();

    return (
        <Card>
            <div style={{ marginBottom: 16 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Title level={4} style={{ margin: 0 }}>
                            {title}
                        </Title>
                    </Col>
                    {showFilters && (
                        <>
                            <Col xs={24} sm={12} md={8}>
                                <Search
                                    placeholder="Tìm kiếm theo tên xe..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    prefix={<SearchOutlined />}
                                    allowClear
                                />
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Select
                                    placeholder="Lọc theo trạng thái"
                                    value={filterStatus}
                                    onChange={setFilterStatus}
                                    style={{ width: '100%' }}
                                >
                                    <Option value="all">Tất cả</Option>
                                    <Option value="available">Có sẵn</Option>
                                    <Option value="unavailable">Hết xe</Option>
                                </Select>
                            </Col>
                        </>
                    )}
                </Row>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text>Đang tải dữ liệu...</Text>
                    </div>
                </div>
            ) : error ? (
                <Empty
                    description={error}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : filteredData.length === 0 ? (
                <Empty
                    description="Không tìm thấy loại xe nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <>
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">
                            Hiển thị {filteredData.length} loại xe
                        </Text>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) =>
                                `${range[0]}-${range[1]} của ${total} loại xe`
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 800 }}
                    />
                </>
            )}
        </Card>
    );
};

export default PricingTable;
