import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Spin, Empty, Button, Tag, Row, Col, Divider, Space, Image, Tabs, Select } from 'antd';
import { ArrowLeftOutlined, DollarOutlined, SafetyOutlined, ClockCircleOutlined, NumberOutlined, BarcodeOutlined } from '@ant-design/icons';
import axios from 'axios';
import HeaderBar from '../../../components/HeaderBar';
import Footer from '../../../components/Footer';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { Option } = Select;

const MotorbikeDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [motorbikeType, setMotorbikeType] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allMotorbikeTypes, setAllMotorbikeTypes] = useState([]);

    // Fetch motorbike type detail
    const fetchMotorbikeType = async (typeId) => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`http://localhost:8080/api/v1/admin/motorbike-type/get-by-id/${typeId}`);
            if (res.data.success && res.data.motorbikeType) {
                setMotorbikeType(res.data.motorbikeType);
            } else {
                setError(res.data.message || 'Không tìm thấy thông tin loại xe');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi kết nối mạng');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all motorbike types for select
    const getAllMotorbikeTypes = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/motorbike-type/get-all');
            if (res.data.success) {
                setAllMotorbikeTypes(res.data.motorbikeTypes);
            } else {
                setError(res.data.message || 'Không tìm thấy thông tin loại xe');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi kết nối mạng');
        }
    };

    useEffect(() => {
        fetchMotorbikeType(id);
        getAllMotorbikeTypes();
    }, [id]);

    const handleChangeType = (value) => {
        navigate(`/motorbike-detail/${value}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    if (loading) {
        return (
            <Layout>
                <HeaderBar />
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text>Đang tải thông tin loại xe...</Text>
                    </div>
                </Content>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <HeaderBar />
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Empty description={<Text type="danger">{error}</Text>} />
                    <Button type="primary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
                        <ArrowLeftOutlined /> Quay lại
                    </Button>
                </Content>
            </Layout>
        );
    }

    const generalTab = (
        <Row gutter={[32, 16]} align="middle">
            <Col xs={24} md={10}>
                <Image
                    src={`http://localhost:8080${motorbikeType.image}`}
                    alt={motorbikeType.name}
                    style={{ width: '100%', maxHeight: 350, objectFit: 'contain', borderRadius: 8, background: '#fff' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                />
            </Col>
            <Col xs={24} md={14}>
                <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>{motorbikeType.name}</Title>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div>
                        <Tag color="blue" style={{ fontSize: 16, padding: '4px 12px' }}>
                            <NumberOutlined /> Số lượng: {motorbikeType.totalQuantity}
                        </Tag>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <DollarOutlined style={{ color: '#1890ff' }} />
                        <Text strong>Giá thuê cùng chi nhánh:</Text>
                        <Text>{formatPrice(motorbikeType.pricingRule?.sameBranchPrice)}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <DollarOutlined style={{ color: '#fa541c' }} />
                        <Text strong>Giá thuê khác chi nhánh:</Text>
                        <Text>{formatPrice(motorbikeType.pricingRule?.differentBranchPrice)}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <SafetyOutlined style={{ color: '#faad14' }} />
                        <Text strong>Tiền cọc:</Text>
                        <Text>{formatPrice(motorbikeType.deposit)}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <SafetyOutlined style={{ color: '#faad14' }} />
                        <Text strong>Tiền cọc trước:</Text>
                        <Text>{formatPrice(motorbikeType.preDeposit)}</Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <ClockCircleOutlined style={{ color: '#722ed1' }} />
                        <Text strong>Bảo hiểm/ngày:</Text>
                        <Text>{formatPrice(motorbikeType.dailyDamageWaiver)}</Text>
                    </div>
                    <Divider style={{ margin: '8px 0' }} />
                    <Paragraph style={{ color: '#555', fontSize: 16 }}>
                        {motorbikeType.description || 'Không có mô tả cho loại xe này.'}
                    </Paragraph>
                </Space>
            </Col>
        </Row>
    );

    const specTab = (
        <div style={{ padding: 16 }}>
            {motorbikeType.specifications.length > 0 ? (
                <Row gutter={[16, 16]}>
                    {motorbikeType.specifications.map((spec, index) => (
                        <React.Fragment key={index}>
                            <Col xs={24} sm={12} md={8}><b>Truyền động:</b> {spec.transmission}</Col>
                            <Col xs={24} sm={12} md={8}><b>Số cấp:</b> {spec.gears}</Col>
                            <Col xs={24} sm={12} md={8}><b>Dung tích động cơ:</b> {spec.engineSize}</Col>
                            <Col xs={24} sm={12} md={8}><b>Chiều cao yên:</b> {spec.seatHeight}</Col>
                            <Col xs={24} sm={12} md={8}><b>Trọng lượng:</b> {spec.weight}</Col>
                            <Col xs={24} sm={12} md={8}><b>Công suất:</b> {spec.horsePower}</Col>
                            <Col xs={24} sm={12} md={8}><b>Dung tích bình xăng:</b> {spec.tankSize}</Col>
                        </React.Fragment>
                    ))}
                </Row>
            ) : (
                <Text type="secondary">Không có thông số kỹ thuật cho loại xe này.</Text>
            )}

        </div>
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
                        Quay lại
                    </Button>
                    <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span>Chọn loại xe khác:</span>
                        <Select
                            showSearch
                            style={{ minWidth: 220 }}
                            value={motorbikeType._id}
                            onChange={handleChangeType}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {allMotorbikeTypes.map((type) => (
                                <Option key={type._id} value={type._id}>{type.name}</Option>
                            ))}
                        </Select>
                    </div>
                    <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                        <Tabs
                            defaultActiveKey="general"
                            items={[
                                {
                                    key: 'general',
                                    label: 'Tổng quát',
                                    children: generalTab,
                                },
                                {
                                    key: 'spec',
                                    label: 'Thông số kỹ thuật',
                                    children: specTab,
                                },
                            ]}
                        />
                    </Card>
                </div>
            </Content>
            <Footer />
        </Layout>
    );
};

export default MotorbikeDetailPage;
