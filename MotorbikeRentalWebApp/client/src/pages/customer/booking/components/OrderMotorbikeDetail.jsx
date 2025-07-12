import React, { } from 'react'
import { Card, Row, Col, Typography, Image, Tag } from 'antd'
import IncrementAnDecrementButton from '../../../../components/IncrementAnDecrementButton'
import { useBooking } from '../../../../context/BookingContext'
import RemoveButton from './RemoveButton'
import MotorbikeOptions from './MotorbikeOptions'

const { Title, Text } = Typography

const OrderMotorbikeDetail = () => {
    const { bookingData, setBookingData } = useBooking()

    // useEffect(() => {
    //     // Sync motorbikes with motorbikeTypes
    //     if (Array.isArray(bookingData.motorbikeTypes)) {
    //         setBookingData(prev => ({
    //             ...prev,
    //             motorbikes: prev.motorbikeTypes.map(motorbikeType => ({
    //                 motorbikeType,
    //                 quantity: 1
    //             }))
    //         }))
    //     }
    // }, [bookingData.motorbikeTypes, setBookingData])

    const handleQuantityChange = (newQuantity, index) => {
        setBookingData(prev => ({
            ...prev,
            motorbikes: prev.motorbikes.map((item, i) =>
                i === index ? { ...item, quantity: newQuantity } : item
            )
        }));
    };

    const handleRemove = (motorbikeTypeId) => {
        setBookingData(prev => ({
            ...prev,
            motorbikes: (prev.motorbikes || []).filter(
                (item) => item.motorbikeType._id !== motorbikeTypeId
            )
        }))
    }

    return (
        <>
            <div>
                <MotorbikeOptions />
            </div>
            {bookingData.motorbikes?.length > 0 ? (
                bookingData.motorbikes.map((item, index) => (
                    <Card
                        key={item.motorbikeType._id}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span style={{ fontWeight: 600, fontSize: 18 }}>{`Xe máy ${index + 1}`}</span>
                                <RemoveButton onClick={() => handleRemove(item.motorbikeType._id)} />
                            </div>
                        }
                        style={{
                            marginBottom: 20,
                            borderRadius: 14,
                            boxShadow: '0 2px 12px rgba(24,144,255,0.07)',
                            background: '#fafdff',
                            border: '1px solid #e6f7ff'
                        }}
                    >
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={8}>
                                <Image
                                    alt={item.motorbikeType.name}
                                    src={`http://localhost:8080${item.motorbikeType.image}`}
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: 10,
                                        border: '1px solid #e6f7ff',
                                        boxShadow: '0 1px 4px rgba(24,144,255,0.08)'
                                    }}
                                    fallback="..."
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Title level={4} style={{ margin: 0, color: '#1890ff', fontWeight: 700 }}>
                                    {item.motorbikeType.name}
                                </Title>
                                <Tag color="blue" style={{ marginTop: 8, fontSize: 15, borderRadius: 6, padding: '2px 10px' }}>
                                    {item.motorbikeType.availableCount} xe có sẵn
                                </Tag>
                            </Col>
                            <Col xs={24} sm={8}>
                                <Text strong style={{ fontSize: 15 }}>Số lượng:</Text>
                                <div style={{ marginTop: 8 }}>
                                    <IncrementAnDecrementButton
                                        min={1}
                                        max={item.motorbikeType.availableCount || 10}
                                        step={1}
                                        defaultValue={item.quantity}
                                        onChange={(val) => handleQuantityChange(val, index)}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Card>
                ))
            ) : (
                <Card>
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <Text type="secondary">Chưa chọn xe nào</Text>
                    </div>
                </Card>
            )}
        </>
    )
}

export default OrderMotorbikeDetail