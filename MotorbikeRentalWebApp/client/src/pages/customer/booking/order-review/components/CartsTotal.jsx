import React from 'react'
import { Card, Typography, Divider } from 'antd'
import { useBooking } from '../../../../../context/BookingContext'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const CartsTotal = () => {
    const { bookingData } = useBooking()
    const motorbikes = bookingData.motorbikes || []
    const accessories = bookingData.accessories || []

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

    const calculateDuration = () => {
        const startDateTime = dayjs(`${bookingData.startDate}T${bookingData.startTime}`);
        const endDateTime = dayjs(`${bookingData.endDate}T${bookingData.endTime}`);
        const durationDays = endDateTime.diff(startDateTime, 'day', true); // tính số ngày (có thể là số thập phân)
        return Math.ceil(durationDays <= 0 ? 1 : durationDays); // tối thiểu là 1
    }

    const rentalDuration = calculateDuration()

    // Calculate totals
    let totalRentalFee = 0
    let totalAccessoryFee = 0
    let totalDeposit = 0
    let totalPreDeposit = 0
    let totalDamageWaiver = 0

    // Calculate motorbike totals
    motorbikes.forEach((item) => {
        const { motorbikeType, quantity, hasDamageWaiver } = item
        const isSameBranch = bookingData.startBranch === bookingData.endBranch
        const basePrice = isSameBranch
            ? motorbikeType.pricingRule?.sameBranchPrice || motorbikeType.price || 0
            : motorbikeType.pricingRule?.differentBranchPrice || motorbikeType.price || 0

        const deposit = motorbikeType.deposit || 0
        const preDeposit = motorbikeType.preDeposit || 0
        const dailyDamageWaiver = motorbikeType.dailyDamageWaiver || 0

        // Calculate discount
        const discountDay = motorbikeType.pricingRule?.discountDay || 0
        const discountPercent = motorbikeType.pricingRule?.discountPercent || 0
        const discountedPrice = basePrice - (basePrice * discountPercent / 100)

        const fullPriceDays = Math.min(rentalDuration, discountDay)
        const discountDays = Math.max(0, rentalDuration - discountDay)

        const rentalFee = (fullPriceDays * basePrice + discountDays * discountedPrice) * quantity
        const depositFee = deposit * quantity
        const preDepositFee = preDeposit * quantity
        const damageWaiverFee = hasDamageWaiver ? dailyDamageWaiver * rentalDuration * quantity : 0

        totalRentalFee += rentalFee
        totalDeposit += depositFee
        totalPreDeposit += preDepositFee
        totalDamageWaiver += damageWaiverFee
    })

    // Calculate accessory totals
    accessories.forEach((item) => {
        const { accessory, quantity } = item
        const price = accessory.price || 0
        const accessoryFee = price * quantity
        totalAccessoryFee += accessoryFee
    })

    const grandTotal = totalRentalFee + totalAccessoryFee + totalDamageWaiver
    const totalBikeDeposit = totalDeposit + totalPreDeposit

    return (
        <Card
            title={
                <span style={{
                    color: '#52c41a',
                    fontWeight: 700,
                    fontSize: 24,
                    textAlign: 'center',
                    display: 'block'
                }}>
                    💳 Tổng đơn hàng
                </span>
            }
            style={{
                marginTop: 24,
                borderRadius: 20,
                boxShadow: '0 8px 32px rgba(82,196,26,0.15)',
                border: '2px solid #d9f7be',
                background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)',
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto'
            }}
            bodyStyle={{
                padding: '24px',
                background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ff 100%)'
            }}
        >
            <div style={{
                background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%)',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 4px 20px rgba(24,144,255,0.12)',
                border: '2px solid #91d5ff',
                marginBottom: '20px'
            }}>
                <div style={{ marginBottom: 16 }}>
                    <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                        🏍️ Chi phí xe máy
                    </Text>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: '600'
                }}>
                    <Text>Tiền thuê ({rentalDuration} ngày):</Text>
                    <Text style={{ color: '#1890ff', fontWeight: 700, fontSize: '18px' }}>
                        {formatPrice(totalRentalFee)}
                    </Text>
                </div>

                {totalDamageWaiver > 0 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 12,
                        fontSize: 16,
                        fontWeight: '600'
                    }}>
                        <Text>Bảo hiểm thiệt hại:</Text>
                        <Text style={{ color: '#13c2c2', fontWeight: 700, fontSize: '18px' }}>
                            {formatPrice(totalDamageWaiver)}
                        </Text>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: '600'
                }}>
                    <Text>Tiền cọc:</Text>
                    <Text style={{ color: '#faad14', fontWeight: 700, fontSize: '18px' }}>
                        {formatPrice(totalDeposit)}
                    </Text>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    fontSize: 16,
                    fontWeight: '600'
                }}>
                    <Text>Tiền đặt cọc:</Text>
                    <Text style={{ color: '#fa8c16', fontWeight: 700, fontSize: '18px' }}>
                        {formatPrice(totalPreDeposit)}
                    </Text>
                </div>

                <Divider style={{ margin: '16px 0', borderColor: '#91d5ff' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#1890ff'
                }}>
                    <Text style={{ color: '#1890ff', fontWeight: 700, fontSize: '20px' }}>
                        Tổng tiền cọc xe:
                    </Text>
                    <Text style={{ color: '#1890ff', fontWeight: 700, fontSize: '22px' }}>
                        {formatPrice(totalBikeDeposit)}
                    </Text>
                </div>
            </div>

            {totalAccessoryFee > 0 && (
                <div style={{
                    background: 'linear-gradient(135deg, #f8f0ff 0%, #f0e6ff 100%)',
                    borderRadius: 16,
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(114,46,209,0.12)',
                    border: '2px solid #d6b3ff',
                    marginBottom: '20px'
                }}>
                    <div style={{ marginBottom: 16 }}>
                        <Text strong style={{ fontSize: 18, color: '#722ed1' }}>
                            🔧 Chi phí phụ kiện
                        </Text>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 16,
                        fontWeight: '600'
                    }}>
                        <Text>Tổng phụ kiện:</Text>
                        <Text style={{ color: '#722ed1', fontWeight: 700, fontSize: '18px' }}>
                            {formatPrice(totalAccessoryFee)}
                        </Text>
                    </div>
                </div>
            )}

            <div style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                borderRadius: 16,
                padding: '24px',
                boxShadow: '0 4px 20px rgba(82,196,26,0.3)',
                border: '2px solid #52c41a',
                color: 'white'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 22,
                    fontWeight: 700,
                    marginBottom: 16
                }}>
                    <Text style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>
                        💰 Tổng chi phí thuê:
                    </Text>
                    <Text style={{ color: 'white', fontSize: '28px', fontWeight: 700, letterSpacing: '1px' }}>
                        {formatPrice(grandTotal)}
                    </Text>
                </div>

                <Divider style={{ margin: '16px 0', borderColor: 'rgba(255,255,255,0.3)' }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 20,
                    fontWeight: 700
                }}>
                    <Text style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>
                        💳 Tổng tiền cọc:
                    </Text>
                    <Text style={{ color: 'white', fontSize: '26px', fontWeight: 700, letterSpacing: '1px' }}>
                        {formatPrice(totalBikeDeposit)}
                    </Text>
                </div>
            </div>

            <div style={{
                marginTop: 20,
                padding: 16,
                background: 'rgba(255,255,255,0.8)',
                borderRadius: 12,
                border: '1px solid #d9f7be'
            }}>
                <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', display: 'block' }}>
                    💡 <strong>Lưu ý:</strong> Tiền cọc sẽ được hoàn trả sau khi trả xe và kiểm tra tình trạng xe
                </Text>
            </div>
        </Card>
    )
}

export default CartsTotal
