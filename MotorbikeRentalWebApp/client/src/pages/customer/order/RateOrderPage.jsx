import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Rate, Input, Button, message } from 'antd';

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

    return (
        <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
            <Card>
                <Title level={3} style={{ textAlign: 'center' }}>Đánh giá đơn hàng</Title>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                    <Rate
                        allowClear={false}
                        value={score}
                        onChange={setScore}
                        tooltips={Object.values(satisfactionLabels)}
                    />
                    <div style={{ marginTop: 8, color: '#888' }}>{satisfactionLabels[score]}</div>
                </div>
                <Input.TextArea
                    rows={4}
                    placeholder="Nhận xét của bạn về đơn hàng..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                    style={{ marginBottom: 16 }}
                />
                <Button type="primary" block loading={loading} onClick={handleSubmit}>
                    Gửi đánh giá
                </Button>
            </Card>
        </div>
    );
};

export default RateOrderPage;
