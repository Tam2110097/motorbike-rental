import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, Row, Col, message, Tag, Button, Divider, Space } from 'antd';
import axios from 'axios';
import { DollarOutlined, SafetyOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const RecommendationMotorbikeType = ({ tripContext, branchReceiveId }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [fallback, setFallback] = useState(false);

    useEffect(() => {
        if (!tripContext || !branchReceiveId) return;
        setFallback(false);
        console.log('RecommendationMotorbikeType: tripContext', tripContext);
        console.log('RecommendationMotorbikeType: branchReceiveId', branchReceiveId);
        const fetchRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.post('http://localhost:8080/api/v1/recommendation/suggest-motorbikes', {
                    tripContext,
                    branchReceiveId
                });
                if (res.data.success && res.data.data && res.data.data.length > 0) {
                    setRecommendations(res.data.data);
                    setFallback(false);
                    console.log('RecommendationMotorbikeType: recommendations', res.data.data);
                } else {
                    // Fallback: fetch top 3 popular motorbike types
                    const fallbackRes = await axios.get(`http://localhost:8080/api/v1/recommendation/top-popular?branchReceiveId=${branchReceiveId}`);
                    if (fallbackRes.data.success && fallbackRes.data.data && fallbackRes.data.data.length > 0) {
                        setRecommendations(fallbackRes.data.data);
                        setFallback(true);
                    } else {
                        setRecommendations([]);
                        setFallback(true);
                    }
                }
            } catch {
                setError('Lỗi khi lấy gợi ý xe');
                message.error('Lỗi khi lấy gợi ý xe');
            } finally {
                setLoading(false);
            }
        };
        fetchRecommendations();
    }, [tripContext, branchReceiveId]);

    if (!tripContext || !branchReceiveId) return null;

    // Calculate summary stats for recommendations (if not fallback)
    let summary = null;
    if (!fallback && recommendations.length > 0) {
        // Calculate total usedCount and weighted avgSatisfaction
        const totalUsed = recommendations.reduce((sum, t) => sum + (t.usedCount || 0), 0);
        const totalScore = recommendations.reduce((sum, t) => sum + ((t.avgSatisfaction || 0) * (t.usedCount || 0)), 0);
        const avgRating = totalUsed > 0 ? (totalScore / totalUsed) : 0;
        // Assume "liked" means avgSatisfaction >= 4
        const likedCount = recommendations.filter(t => (t.avgSatisfaction || 0) >= 4).reduce((sum, t) => sum + (t.usedCount || 0), 0);
        const percentLiked = totalUsed > 0 ? Math.round((likedCount / totalUsed) * 100) : 0;
        summary = `${percentLiked}% khách hàng hài lòng, đánh giá trung bình ${avgRating.toFixed(1)}★`;
    }

    return (
        <div style={{ margin: '24px 0' }}>
            <Title level={3} style={{ marginBottom: 12, color: '#1890ff' }}>
                {fallback ? 'Top 3 xe phổ biến nhất tại chi nhánh' : 'Gợi ý loại xe phù hợp'}
            </Title>
            {!fallback && summary && (
                <div style={{ marginBottom: 16, fontSize: 16, color: '#faad14', fontWeight: 500 }}>
                    {summary}
                </div>
            )}
            {loading ? (
                <Spin />
            ) : error ? (
                <Text type="danger">{error}</Text>
            ) : recommendations.length === 0 ? (
                <Empty description="Không có gợi ý phù hợp" />
            ) : (
                <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {recommendations.map((type) => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={type._id} style={{ display: 'flex' }}>
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
                                        <img
                                            alt={type.name}
                                            src={`http://localhost:8080${type.image}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'contain',
                                                background: '#fff',
                                                display: 'block',
                                                maxWidth: '100%',
                                                maxHeight: '100%'
                                            }}
                                            onError={e => {
                                                e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN'
                                            }}
                                        />
                                        <Tag color={fallback ? 'gold' : 'purple'} style={{ position: 'absolute', top: 8, right: 8, fontSize: 12, fontWeight: 'bold' }}>
                                            {fallback ? 'Phổ biến' : 'Đề xuất'}
                                        </Tag>
                                    </div>
                                }
                                actions={[
                                    <Button
                                        type="primary"
                                        disabled={type.availableCount === 0}
                                        style={{ width: '100%' }}
                                    >
                                        {type.availableCount === 0 ? 'Hết xe' : 'Chọn xe'}
                                    </Button>
                                ]}
                            >
                                <Card.Meta
                                    title={
                                        <div>
                                            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>{type.name}</Title>
                                            <div style={{ fontSize: 15, color: '#faad14', fontWeight: 500, margin: '4px 0' }}>
                                                {type.avgSatisfaction ? `${type.avgSatisfaction.toFixed(1)}★` : '-'}
                                                {type.usedCount ? ` | ${type.usedCount} lượt thuê` : ''}
                                            </div>
                                            <Tag color="blue" style={{ marginTop: 4 }}>
                                                {type.availableCount !== undefined ? `${type.availableCount} xe có sẵn` : (fallback ? 'Phổ biến' : 'Đề xuất')}
                                            </Tag>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <Paragraph
                                                ellipsis={{ rows: 2, expandable: false }}
                                                style={{ marginBottom: 12, color: '#666' }}
                                            >
                                                {type.description || 'Không có mô tả'}
                                            </Paragraph>
                                            <Divider style={{ margin: '12px 0' }} />
                                            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                                {type.pricingRule && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text>
                                                            <DollarOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                                            Giá thuê:
                                                        </Text>
                                                        <Text style={{ color: '#1890ff' }}>
                                                            {type.pricingRule.sameBranchPrice !== undefined
                                                                ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(type.pricingRule.sameBranchPrice)
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
                                                        {type.deposit !== undefined
                                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(type.deposit)
                                                            : 'N/A'}
                                                    </Text>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Text>
                                                        <ClockCircleOutlined style={{ marginRight: 4, color: '#722ed1' }} />
                                                        Bảo hiểm/ngày:
                                                    </Text>
                                                    <Text style={{ color: '#722ed1' }}>
                                                        {type.dailyDamageWaiver !== undefined
                                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(type.dailyDamageWaiver)
                                                            : 'N/A'}
                                                    </Text>
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
    );
};

export default RecommendationMotorbikeType;