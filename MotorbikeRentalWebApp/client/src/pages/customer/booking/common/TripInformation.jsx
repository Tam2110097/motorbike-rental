import React, { useEffect, useState } from 'react'
import { useBooking } from '../../../../context/BookingContext'
import axios from 'axios';
import dayjs from 'dayjs';
import { Card, Typography, Row, Col } from 'antd';

const { Title, Text } = Typography;

const TripInformation = () => {
    const { bookingData } = useBooking();
    const [branchNameStart, setBranchNameStart] = useState(null);
    const [branchNameEnd, setBranchNameEnd] = useState(null);

    const fetchBranchNameStart = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/customer/branch/get-by-id/${id}`)
            if (res.data.success && res.data.branch) {
                setBranchNameStart(res.data.branch.city)
            } else {
                setBranchNameStart(null)
            }
        } catch {
            setBranchNameStart(null)
        }
    }
    const fetchBranchNameEnd = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/customer/branch/get-by-id/${id}`)
            if (res.data.success && res.data.branch) {
                setBranchNameEnd(res.data.branch.city)
            } else {
                setBranchNameEnd(null)
            }
        } catch {
            setBranchNameEnd(null)
        }
    }

    const getDuration = () => {
        const startDateOnly = dayjs(bookingData.startDate).startOf('day');
        const endDateOnly = dayjs(bookingData.endDate).startOf('day');
        const durationDays = endDateOnly.diff(startDateOnly, 'day') + 1;
        return durationDays <= 0 ? 1 : durationDays;        // tối thiểu là 1
    };

    useEffect(() => {
        fetchBranchNameStart(bookingData.startBranch);
    }, [bookingData.startBranch]);
    useEffect(() => {
        fetchBranchNameEnd(bookingData.endBranch);
    }, [bookingData.endBranch]);

    return (
        <Card
            title={<Title level={4} style={{ margin: 0, color: '#1890ff' }}>Thông tin chuyến đi</Title>}
            style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                border: '1px solid #f0f0f0',
                background: '#fafcff',
                marginBottom: 0
            }}
        >
            <Row gutter={[24, 16]}>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong>Nơi bắt đầu</Text>
                        <div style={{ color: '#1890ff', fontWeight: 500 }}>{branchNameStart || '-'}</div>
                        <div style={{ color: '#888' }}>{bookingData.startDate} - {bookingData.startTime}</div>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong>Nơi kết thúc</Text>
                        <div style={{ color: '#fa541c', fontWeight: 500 }}>{branchNameEnd || '-'}</div>
                        <div style={{ color: '#888' }}>{bookingData.endDate} - {bookingData.endTime}</div>
                    </div>
                </Col>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong>Thời gian thuê</Text>
                        <div style={{ color: '#52c41a', fontWeight: 600, fontSize: 18 }}>{getDuration()} ngày</div>
                    </div>
                </Col>
            </Row>
        </Card>
    )
}

export default TripInformation