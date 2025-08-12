import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Rate, Input, Button, message } from 'antd';
import HeaderBar from '../../../components/HeaderBar';
import Footer from '../../../components/Footer';
import BackButton from '../../../components/BackButton';

const { Title } = Typography;

const satisfactionLabels = {
    1: 'Rất không hài lòng',
    2: 'Không hài lòng',
    3: 'Bình thường',
    4: 'Hài lòng',
    5: 'Rất hài lòng',
};

const RateOrderPage = () => {
    const { id: orderId } = useParams();
    const navigate = useNavigate();
    const [score, setScore] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    console.log('>>>>>>>orderId', orderId);

    const handleSubmit = async () => {
        if (!score || !comment.trim()) {
            message.error('Vui lòng nhập nhận xét và chọn mức độ hài lòng.');
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/v1/customer/order/${orderId}/feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ comment, satisfactionScore: score })
            });
            const data = await res.json();
            if (data.success) {
                message.success('Cảm ơn bạn đã đánh giá!');
                setTimeout(() => navigate('/order/my-order'), 1000);
            } else {
                message.error(data.message || 'Gửi đánh giá thất bại.');
            }
        } catch {
            message.error('Lỗi khi gửi đánh giá.');
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = !!score && comment.trim().length > 0;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <HeaderBar />
            <div style={{ flex: 1, padding: '32px 16px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div style={{ maxWidth: 720, margin: '0 auto' }}>
                    <BackButton path={'/order/my-order'} />

                    <Card
                        style={{
                            marginBottom: 24,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 16,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                        }}
                    >
                        <Title level={3} style={{ color: 'white', margin: 0, textAlign: 'center' }}>
                            ⭐ Đánh giá đơn hàng
                        </Title>
                    </Card>

                    <Card
                        style={{
                            borderRadius: 16,
                            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
                            border: '1px solid #eef2f7'
                        }}
                        bodyStyle={{ padding: 24 }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Rate
                                allowClear={false}
                                value={score}
                                onChange={setScore}
                                tooltips={Object.values(satisfactionLabels)}
                                style={{ fontSize: 28, color: '#faad14' }}
                            />
                            <div style={{ marginTop: 8, color: '#6b7280', fontWeight: 600 }}>{satisfactionLabels[score]}</div>
                        </div>

                        <div style={{ marginBottom: 8, color: '#374151', fontWeight: 600 }}>Nhận xét</div>
                        <Input.TextArea
                            rows={5}
                            placeholder="Hãy chia sẻ trải nghiệm của bạn (dịch vụ, chất lượng xe, thời gian giao nhận, ... )"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            maxLength={500}
                            style={{
                                borderRadius: 12,
                                padding: 12,
                                borderColor: '#e5e7eb'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, color: '#9ca3af', fontSize: 12 }}>
                            <span>Vui lòng không chia sẻ thông tin cá nhân hoặc nhạy cảm.</span>
                            <span>{comment.length}/500</span>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 20 }}>
                            <Button
                                type="primary"
                                size="large"
                                loading={loading}
                                onClick={handleSubmit}
                                disabled={!canSubmit}
                                style={{
                                    minWidth: 220,
                                    height: 44,
                                    borderRadius: 10,
                                    boxShadow: '0 6px 18px rgba(24,144,255,0.3)'
                                }}
                            >
                                Gửi đánh giá
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default RateOrderPage;
