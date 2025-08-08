import React from 'react'
import { Card, Row, Col, Typography, Image, Select, Divider, Button } from 'antd'
import { useBooking } from '../../../../../context/BookingContext'
import dayjs from 'dayjs'
import { DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Option } = Select

const ProductPriceDetail = () => {
    const { bookingData, setBookingData } = useBooking()
    const motorbikes = bookingData.motorbikes || []
    const accessories = bookingData.accessories || []

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

    const calculateDuration = () => {
        const startDateTime = dayjs(`${bookingData.startDate}T${bookingData.startTime}`);
        const endDateTime = dayjs(`${bookingData.endDate}T${bookingData.endTime}`);
        const durationDays = endDateTime.diff(startDateTime, 'day', true);
        return Math.ceil(durationDays <= 0 ? 1 : durationDays);
    }

    const rentalDuration = calculateDuration()

    const handleMotorbikeQuantityChange = (newQuantity, index) => {
        setBookingData(prev => ({
            ...prev,
            motorbikes: prev.motorbikes.map((item, i) =>
                i === index ? { ...item, quantity: newQuantity } : item
            )
        }));
    };

    const handleAccessoryQuantityChange = (newQuantity, index) => {
        setBookingData(prev => ({
            ...prev,
            accessories: prev.accessories.map((item, i) =>
                i === index ? { ...item, quantity: newQuantity } : item
            )
        }));
    };

    const handleDamageWaiverChange = (value, index) => {
        const hasDamageWaiver = value === 'Yes'
        setBookingData(prev => ({
            ...prev,
            motorbikes: prev.motorbikes.map((item, i) =>
                i === index ? { ...item, hasDamageWaiver } : item
            )
        }));
    };

    const handleRemoveMotorbike = (motorbikeTypeId) => {
        setBookingData(prev => ({
            ...prev,
            motorbikes: (prev.motorbikes || []).filter(
                (item) => item.motorbikeType._id !== motorbikeTypeId
            )
        }))
    }

    const handleRemoveAccessory = (accessoryId) => {
        setBookingData(prev => ({
            ...prev,
            accessories: (prev.accessories || []).filter(
                (item) => item.accessory._id !== accessoryId
            )
        }))
    }

    const calculateMotorbikePrice = (motorbikeType, hasDamageWaiver, quantity) => {
        const isSameBranch = bookingData.startBranch === bookingData.endBranch
        const basePrice = isSameBranch
            ? motorbikeType.pricingRule?.sameBranchPrice || motorbikeType.price || 0
            : motorbikeType.pricingRule?.differentBranchPrice || motorbikeType.price || 0

        const deposit = motorbikeType.deposit || 0
        const dailyDamageWaiver = motorbikeType.dailyDamageWaiver || 0

        const discountDay = motorbikeType.pricingRule?.discountDay || 0
        const discountPercent = motorbikeType.pricingRule?.discountPercent || 0
        const discountedPrice = basePrice - (basePrice * discountPercent / 100)

        const fullPriceDays = Math.min(rentalDuration, discountDay)
        const discountDays = Math.max(0, rentalDuration - discountDay)

        const rentalFee = (fullPriceDays * basePrice + discountDays * discountedPrice) * quantity
        const depositFee = deposit * quantity
        const damageWaiverFee = hasDamageWaiver ? dailyDamageWaiver * rentalDuration * quantity : 0

        return {
            rentalFee,
            depositFee,
            damageWaiverFee,
            total: rentalFee + depositFee + damageWaiverFee
        }
    }

    const calculateAccessoryPrice = (accessory, quantity) => {
        const price = accessory.price || 0
        const totalPrice = price * quantity

        return {
            price: totalPrice,
            total: totalPrice
        }
    }

    const generateMotorbikeQuantityOptions = (availableCount) => {
        const maxQuantity = Math.min(availableCount || 1, 10)
        return Array.from({ length: maxQuantity }, (_, i) => i + 1)
    }

    const generateAccessoryQuantityOptions = (accessoryQuantity) => {
        const maxQuantity = Math.min(accessoryQuantity || 1, 50)
        return Array.from({ length: maxQuantity }, (_, i) => i + 1)
    }

    return (
        <div style={{ marginBottom: 24 }}>
            {/* Motorbikes Section */}
            <Title level={3} style={{
                color: '#1890ff',
                fontWeight: 600,
                marginBottom: 24,
                textAlign: 'center'
            }}>
                Chi tiết giá xe máy
            </Title>

            {motorbikes.length === 0 ? (
                <Card style={{
                    textAlign: 'center',
                    padding: 40,
                    borderRadius: 8
                }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                        Chưa chọn xe nào
                    </Text>
                </Card>
            ) : (
                motorbikes.map((item, index) => {
                    const { motorbikeType, quantity, hasDamageWaiver } = item
                    const prices = calculateMotorbikePrice(motorbikeType, hasDamageWaiver, quantity)
                    const motorbikeQuantityOptions = generateMotorbikeQuantityOptions(motorbikeType.availableCount)

                    return (
                        <Card
                            key={motorbikeType._id}
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}>
                                    <span style={{ fontWeight: 600, fontSize: 16 }}>
                                        {motorbikeType.name}
                                    </span>
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleRemoveMotorbike(motorbikeType._id)}
                                        size="small"
                                        disabled={motorbikes.length <= 1}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            }
                            style={{
                                marginBottom: 16,
                                borderRadius: 8
                            }}
                        >
                            <Row gutter={[16, 16]} align="middle">
                                {/* Product Image and Info */}
                                <Col xs={24} md={8}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <Image
                                            alt={motorbikeType.name}
                                            src={`http://localhost:8080${motorbikeType.image}`}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                objectFit: 'cover',
                                                borderRadius: 6
                                            }}
                                            fallback="..."
                                        />
                                        <div>
                                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                Bảo hiểm thiệt hại:
                                            </Text>
                                            <Select
                                                value={hasDamageWaiver ? 'Yes' : 'No'}
                                                onChange={(value) => handleDamageWaiverChange(value, index)}
                                                style={{ width: 120 }}
                                                size="small"
                                            >
                                                <Option value="Yes">Có</Option>
                                                <Option value="No">Không</Option>
                                            </Select>
                                        </div>
                                    </div>
                                </Col>

                                {/* Quantity */}
                                <Col xs={24} md={4}>
                                    <div style={{ textAlign: 'center' }}>
                                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                            Số lượng:
                                        </Text>
                                        <Select
                                            value={quantity}
                                            onChange={(value) => handleMotorbikeQuantityChange(value, index)}
                                            style={{ width: 80 }}
                                            size="small"
                                        >
                                            {motorbikeQuantityOptions.map(option => (
                                                <Option key={option} value={option}>
                                                    {option}
                                                </Option>
                                            ))}
                                        </Select>
                                        <Text style={{ fontSize: 12, color: '#666', marginTop: 4, display: 'block' }}>
                                            Có sẵn: {motorbikeType.availableCount || 0}
                                        </Text>
                                    </div>
                                </Col>

                                {/* Prices */}
                                <Col xs={24} md={12}>
                                    <div style={{
                                        background: '#f8f9fa',
                                        borderRadius: 6,
                                        padding: 12
                                    }}>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text strong>Chi tiết giá:</Text>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 6,
                                            fontSize: 13
                                        }}>
                                            <Text>Tiền cọc:</Text>
                                            <Text style={{ color: '#faad14', fontWeight: 600 }}>
                                                {formatPrice(prices.depositFee)}
                                            </Text>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: 6,
                                            fontSize: 13
                                        }}>
                                            <Text>Tiền thuê ({rentalDuration} ngày):</Text>
                                            <Text style={{ color: '#1890ff', fontWeight: 600 }}>
                                                {formatPrice(prices.rentalFee)}
                                            </Text>
                                        </div>

                                        {hasDamageWaiver && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 6,
                                                fontSize: 13
                                            }}>
                                                <Text>Bảo hiểm thiệt hại:</Text>
                                                <Text style={{ color: '#13c2c2', fontWeight: 600 }}>
                                                    {formatPrice(prices.damageWaiverFee)}
                                                </Text>
                                            </div>
                                        )}

                                        <Divider style={{ margin: '8px 0' }} />

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: 14,
                                            fontWeight: 700,
                                            color: '#52c41a'
                                        }}>
                                            <Text style={{ color: '#52c41a', fontWeight: 700 }}>
                                                Tổng:
                                            </Text>
                                            <Text style={{ color: '#52c41a', fontWeight: 700 }}>
                                                {formatPrice(prices.total)}
                                            </Text>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    )
                })
            )}

            {/* Accessories Section */}
            {accessories.length > 0 && (
                <>
                    <Title level={3} style={{
                        color: '#722ed1',
                        fontWeight: 600,
                        marginTop: 32,
                        marginBottom: 24,
                        textAlign: 'center'
                    }}>
                        Chi tiết giá phụ kiện
                    </Title>

                    {accessories.map((item, index) => {
                        const { accessory, quantity } = item
                        const prices = calculateAccessoryPrice(accessory, quantity)
                        const accessoryQuantityOptions = generateAccessoryQuantityOptions(accessory.quantity)

                        return (
                            <Card
                                key={accessory._id}
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span style={{ fontWeight: 600, fontSize: 16 }}>
                                            {accessory.name}
                                        </span>
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemoveAccessory(accessory._id)}
                                            size="small"
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                }
                                style={{
                                    marginBottom: 16,
                                    borderRadius: 8
                                }}
                            >
                                <Row gutter={[16, 16]} align="middle">
                                    {/* Product Image and Info */}
                                    <Col xs={24} md={8}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <Image
                                                alt={accessory.name}
                                                src={`http://localhost:8080${accessory.image}`}
                                                style={{
                                                    width: 80,
                                                    height: 80,
                                                    objectFit: 'cover',
                                                    borderRadius: 6
                                                }}
                                                fallback="..."
                                            />
                                            <div>
                                                <Text style={{ fontSize: 12, color: '#666' }}>
                                                    Phụ kiện
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>

                                    {/* Quantity */}
                                    <Col xs={24} md={4}>
                                        <div style={{ textAlign: 'center' }}>
                                            <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                                Số lượng:
                                            </Text>
                                            <Select
                                                value={quantity}
                                                onChange={(value) => handleAccessoryQuantityChange(value, index)}
                                                style={{ width: 80 }}
                                                size="small"
                                            >
                                                {accessoryQuantityOptions.map(option => (
                                                    <Option key={option} value={option}>
                                                        {option}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </div>
                                    </Col>

                                    {/* Prices */}
                                    <Col xs={24} md={12}>
                                        <div style={{
                                            background: '#f8f9fa',
                                            borderRadius: 6,
                                            padding: 12
                                        }}>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text strong>Chi tiết giá:</Text>
                                            </div>

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginBottom: 6,
                                                fontSize: 13
                                            }}>
                                                <Text>Giá phụ kiện:</Text>
                                                <Text style={{ color: '#722ed1', fontWeight: 600 }}>
                                                    {formatPrice(prices.price)}
                                                </Text>
                                            </div>

                                            <Divider style={{ margin: '8px 0' }} />

                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                fontSize: 14,
                                                fontWeight: 700,
                                                color: '#722ed1'
                                            }}>
                                                <Text style={{ color: '#722ed1', fontWeight: 700 }}>
                                                    Tổng:
                                                </Text>
                                                <Text style={{ color: '#722ed1', fontWeight: 700 }}>
                                                    {formatPrice(prices.total)}
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        )
                    })}
                </>
            )}
        </div>
    )
}

export default ProductPriceDetail
