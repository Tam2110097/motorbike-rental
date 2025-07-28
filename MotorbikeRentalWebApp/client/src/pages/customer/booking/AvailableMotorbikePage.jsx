import React, { useEffect, useState } from 'react'
import HeaderBar from '../../../components/HeaderBar'
import { Layout, Card, Row, Col, Typography, Spin, Empty, Tag, Button, Space, Image, Divider, message } from 'antd'
import { CarOutlined, DollarOutlined, SafetyOutlined, ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { useBooking } from '../../../context/BookingContext'
import RecommendationMotorbikeType from '../../../components/RecommendationMotorbikeType'
const { Title, Text, Paragraph } = Typography
const { Content } = Layout

const pageTitleStyle = {
    textAlign: 'center',
    margin: '0px auto 30px auto',
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 10,
};

const AvailableMotorbikePage = () => {
    const { bookingData, setBookingData } = useBooking();
    const [motorbikeTypes, setMotorbikeTypes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [branchName, setBranchName] = useState(null)
    const navigate = useNavigate()

    // Fetch branch info if branchId is present
    const fetchBranchName = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/customer/branch/get-by-id/${id}`)
            if (res.data.success && res.data.branch) {
                setBranchName(res.data.branch.city)
            } else {
                setBranchName(null)
            }
        } catch {
            setBranchName(null)
        }
    }

    const getAvailableMotorbikeTypes = async () => {
        try {
            setLoading(true)
            setError(null)

            let url = 'http://localhost:8080/api/v1/customer/motorbike-type/available';
            if (bookingData.startBranch) {
                url += `?branchId=${bookingData.startBranch}`;
                fetchBranchName(bookingData.startBranch);
            } else {
                setBranchName(null);
            }

            const res = await axios.get(url)
            if (res.data.success) {
                setMotorbikeTypes(res.data.motorbikeTypes || [])
            } else {
                setError(res.data.message || 'Có lỗi xảy ra khi tải dữ liệu')
                message.error(res.data.message || 'Có lỗi xảy ra khi tải dữ liệu')
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi kết nối mạng'
            setError(errorMessage)
            message.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getAvailableMotorbikeTypes()
        console.log('>>>>>>>>>>>>>>>>>>>', bookingData)
        // eslint-disable-next-line
    }, [bookingData.startBranch])

    const handleSelectMotorbikeType = (motorbikeType) => {
        const alreadyExists = (bookingData.motorbikeTypes || []).some(
            (item) => item._id === motorbikeType._id
        );

        if (alreadyExists) {
            message.info('Loại xe này đã được chọn');
            return;
        }

        setBookingData(prev => ({
            ...prev,
            motorbikeTypes: [...(prev.motorbikeTypes || []), motorbikeType],
            motorbikes: [...(prev.motorbikes || []), { motorbikeType, quantity: 1 }]
        }));
        navigate('/booking/confirm-bike-model');
    }


    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    const getStatusColor = (availableCount) => {
        if (availableCount === 0) return 'red'
        if (availableCount <= 2) return 'orange'
        return 'green'
    }

    const getStatusText = (availableCount) => {
        if (availableCount === 0) return 'Hết xe'
        if (availableCount <= 2) return 'Sắp hết'
        return 'Còn xe'
    }

    if (loading) {
        return (
            <Layout>
                <HeaderBar />
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 16 }}>
                        <Text>Đang tải danh sách xe máy...</Text>
                    </div>
                </Content>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout>
                <HeaderBar />
                <Content style={{ padding: '50px', textAlign: 'center' }}>
                    <Empty
                        description={
                            <div>
                                <Text type="danger">{error}</Text>
                                <br />
                                <Button
                                    type="primary"
                                    onClick={getAvailableMotorbikeTypes}
                                    style={{ marginTop: 16 }}
                                >
                                    Thử lại
                                </Button>
                            </div>
                        }
                    />
                </Content>
            </Layout>
        )
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ marginBottom: 24 }}>
                        <Title level={2} style={pageTitleStyle}>
                            Danh sách xe máy khả dụng
                        </Title>
                        {branchName && (
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                Tại {branchName}
                            </Text>
                        )}
                    </div>

                    {/* Recommendation Section */}
                    {(bookingData.tripContext && bookingData.startBranch &&
                        bookingData.tripContext.purpose &&
                        bookingData.tripContext.distanceCategory &&
                        bookingData.tripContext.numPeople &&
                        bookingData.tripContext.terrain &&
                        bookingData.tripContext.luggage &&
                        Array.isArray(bookingData.tripContext.preferredFeatures)) && (
                            <div style={{ marginBottom: 32 }}>
                                {/* <Title level={3} style={{ marginBottom: 12, color: '#1890ff' }}>Gợi ý loại xe phù hợp</Title> */}
                                <RecommendationMotorbikeType
                                    tripContext={bookingData.tripContext}
                                    branchReceiveId={bookingData.startBranch}
                                />
                            </div>
                        )}

                    {/* Available Motorbikes Section */}
                    <div style={{ marginBottom: 16 }}>
                        <Title level={3} style={{ marginBottom: 12, color: '#52c41a' }}>Xe máy có sẵn</Title>
                    </div>

                    {motorbikeTypes.length === 0 ? (
                        <Card>
                            <Empty
                                description="Không có xe máy nào khả dụng tại thời điểm này"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        </Card>
                    ) : (
                        <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
                            {motorbikeTypes.map((motorbikeType) => (
                                <Col xs={24} sm={12} lg={8} xl={6} key={motorbikeType._id} style={{ display: 'flex' }}>
                                    <Card
                                        hoverable
                                        style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                                        cover={
                                            <div style={{
                                                height: 250,
                                                width: '100%',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#fff',
                                                overflow: 'hidden'
                                            }}>
                                                <Image
                                                    alt={motorbikeType.name}
                                                    src={`http://localhost:8080${motorbikeType.image}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'contain',
                                                        background: '#fff',
                                                        display: 'block',
                                                        maxWidth: '100%',
                                                        maxHeight: '100%'
                                                    }}
                                                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                                />
                                                <Tag
                                                    color={getStatusColor(motorbikeType.availableCount)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        fontSize: 12,
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {getStatusText(motorbikeType.availableCount)}
                                                </Tag>
                                            </div>
                                        }
                                        actions={[
                                            <Button
                                                type="primary"
                                                onClick={() => handleSelectMotorbikeType(motorbikeType)}
                                                disabled={motorbikeType.availableCount === 0}
                                                style={{ width: '100%' }}
                                            >
                                                {motorbikeType.availableCount === 0 ? 'Hết xe' : 'Chọn xe'}
                                            </Button>
                                        ]}
                                    >
                                        <Card.Meta
                                            title={
                                                <div>
                                                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                                                        {motorbikeType.name}
                                                    </Title>
                                                    <Tag color="blue" style={{ marginTop: 4 }}>
                                                        {motorbikeType.availableCount} xe có sẵn{bookingData.startBranch ? ' tại chi nhánh' : ' toàn hệ thống'}
                                                    </Tag>
                                                </div>
                                            }
                                            description={
                                                <div>
                                                    <Paragraph
                                                        ellipsis={{ rows: 2, expandable: false }}
                                                        style={{ marginBottom: 12, color: '#666' }}
                                                    >
                                                        {motorbikeType.description || 'Không có mô tả'}
                                                    </Paragraph>

                                                    <Divider style={{ margin: '12px 0' }} />

                                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                        {/* Nếu cùng chi nhánh, chỉ hiển thị giá cùng chi nhánh */}
                                                        {bookingData.startBranch === bookingData.endBranch && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text>
                                                                    <DollarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                                                    Giá thuê cùng chi nhánh:
                                                                </Text>
                                                                <Text style={{ color: '#1890ff' }}>
                                                                    {motorbikeType.pricingRule?.sameBranchPrice !== undefined
                                                                        ? formatPrice(motorbikeType.pricingRule.sameBranchPrice)
                                                                        : 'N/A'}
                                                                </Text>
                                                            </div>
                                                        )}

                                                        {/* Nếu khác chi nhánh, chỉ hiển thị giá khác chi nhánh */}
                                                        {bookingData.startBranch !== bookingData.endBranch && (
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Text>
                                                                    <DollarOutlined style={{ marginRight: 4, color: '#fa541c' }} />
                                                                    Giá thuê khác chi nhánh:
                                                                </Text>
                                                                <Text style={{ color: '#fa541c' }}>
                                                                    {motorbikeType.pricingRule?.differentBranchPrice !== undefined
                                                                        ? formatPrice(motorbikeType.pricingRule.differentBranchPrice)
                                                                        : 'N/A'}
                                                                </Text>
                                                            </div>
                                                        )}


                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text>
                                                                <SafetyOutlined style={{ marginRight: 4, color: '#faad14' }} />
                                                                Tiền cọc:
                                                            </Text>
                                                            <Text style={{ color: '#faad14' }}>
                                                                {formatPrice(motorbikeType.deposit)}
                                                            </Text>
                                                        </div>

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <Text>
                                                                <ClockCircleOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                                                                Bảo hiểm/ngày:
                                                            </Text>
                                                            <Text style={{ color: '#722ed1' }}>
                                                                {formatPrice(motorbikeType.dailyDamageWaiver)}
                                                            </Text>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <Link to={`/motorbike-detail/${motorbikeType._id}`}
                                                                    style={{ color: '#1890ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                                                                >
                                                                    <ArrowRightOutlined />
                                                                    <Text>
                                                                        Xem chi tiết
                                                                    </Text>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </Space>
                                                </div>
                                            }
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </Content>
        </Layout>
    )
}

export default AvailableMotorbikePage