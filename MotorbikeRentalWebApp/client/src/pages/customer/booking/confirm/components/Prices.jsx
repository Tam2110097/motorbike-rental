import React from 'react'
import { useBooking } from '../../../../../context/BookingContext'
import { Card, Typography, Divider } from 'antd'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const Prices = () => {
    const { bookingData } = useBooking()
    const motorbikes = bookingData.motorbikes || []
    const accessories = bookingData.accessories || []

    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

    const calculateDuration = () => {
        // const startDateOnly = dayjs(bookingData.startDate).startOf('day');
        // const endDateOnly = dayjs(bookingData.endDate).startOf('day');
        // const durationDays = endDateOnly.diff(startDateOnly, 'day') + 1;
        // return durationDays <= 0 ? 1 : durationDays;
        // tối thiểu là 1

        const startDateTime = dayjs(`${bookingData.startDate}T${bookingData.startTime}`);
        const endDateTime = dayjs(`${bookingData.endDate}T${bookingData.endTime}`);

        const durationInDays = endDateTime.diff(startDateTime, 'day', true); // tính số ngày có phần thập phân
        const roundedDuration = Math.ceil(durationInDays); // làm tròn lên

        return roundedDuration <= 0 ? 1 : roundedDuration;
    }

    const rentalDuration = calculateDuration()

    let totalRental = 0
    let totalDeposit = 0
    let totalAccessory = 0
    let totalDiscount = 0
    let totalDamageWaiver = 0

    return (
        <Card
            title={
                <span style={{
                    color: '#1890ff',
                    fontWeight: 700,
                    fontSize: 24,
                    textAlign: 'center',
                    display: 'block'
                }}>
                    💰 Tổng chi phí
                </span>
            }
            style={{
                marginTop: 24,
                borderRadius: 20,
                boxShadow: '0 8px 32px rgba(24,144,255,0.12)',
                border: '2px solid #e6f7ff',
                background: 'linear-gradient(135deg, #fafdff 0%, #f0f8ff 100%)',
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: 0
            }}
            bodyStyle={{
                maxHeight: '500px',
                overflowY: 'auto',
                padding: '24px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#1890ff #f0f0f0'
            }}
        >
            {motorbikes.length === 0 && accessories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>Chưa chọn xe hoặc phụ kiện nào</Text>
                </div>
            ) : (
                <>
                    {motorbikes.map((item) => {
                        const { motorbikeType, quantity, hasDamageWaiver } = item
                        const isSameBranch = bookingData.startBranch === bookingData.endBranch
                        const basePrice = isSameBranch
                            ? motorbikeType.pricingRule?.sameBranchPrice || motorbikeType.price || 0
                            : motorbikeType.pricingRule?.differentBranchPrice || motorbikeType.price || 0
                        const deposit = motorbikeType.deposit || 0

                        // Tính giảm giá mới theo ngày
                        const discountDay = motorbikeType.pricingRule?.discountDay || 0
                        const discountPercent = motorbikeType.pricingRule?.discountPercent || 0
                        const discountedPrice = basePrice - (basePrice * discountPercent / 100)

                        const fullPriceDays = Math.min(rentalDuration, discountDay)
                        const discountDays = Math.max(0, rentalDuration - discountDay)

                        const subtotalRental = (fullPriceDays * basePrice + discountDays * discountedPrice) * quantity
                        const subtotalDeposit = deposit * quantity
                        const subtotalDiscount = (basePrice - discountedPrice) * discountDays * quantity

                        // Calculate damage waiver cost
                        const damageWaiverCost = hasDamageWaiver ? motorbikeType.dailyDamageWaiver * rentalDuration * quantity : 0

                        totalRental += subtotalRental
                        totalDeposit += subtotalDeposit
                        totalDiscount += subtotalDiscount
                        totalDamageWaiver += damageWaiverCost

                        return null // không hiển thị từng item
                    })}

                    {accessories.map((item) => {
                        const { accessory, quantity } = item
                        const price = accessory.price || 0
                        const subtotal = price * quantity
                        totalAccessory += subtotal
                        return null
                    })}

                    <div
                        style={{
                            background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f8ff 100%)',
                            borderRadius: 16,
                            padding: '24px',
                            boxShadow: '0 4px 20px rgba(82,196,26,0.15)',
                            border: '2px solid #52c41a',
                            marginTop: '20px'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            fontSize: '18px',
                            fontWeight: '600'
                        }}>
                            <Text>🏍️ Tổng tiền thuê ({rentalDuration} ngày):</Text>
                            <Text style={{ color: '#1890ff', fontWeight: 700, fontSize: '20px' }}>
                                {formatPrice(totalRental)}
                            </Text>
                        </div>

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px',
                            fontSize: '18px',
                            fontWeight: '600'
                        }}>
                            <Text>💰 Tổng tiền cọc:</Text>
                            <Text style={{ color: '#faad14', fontWeight: 700, fontSize: '20px' }}>
                                {formatPrice(totalDeposit)}
                            </Text>
                        </div>

                        {totalAccessory > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                <Text>🔧 Tổng phụ kiện:</Text>
                                <Text style={{ color: '#722ed1', fontWeight: 700, fontSize: '20px' }}>
                                    {formatPrice(totalAccessory)}
                                </Text>
                            </div>
                        )}

                        {totalDamageWaiver > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                <Text>🛡️ Bảo hiểm thiệt hại ({rentalDuration} ngày):</Text>
                                <Text style={{ color: '#13c2c2', fontWeight: 700, fontSize: '20px' }}>
                                    {formatPrice(totalDamageWaiver)}
                                </Text>
                            </div>
                        )}

                        {totalDiscount > 0 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                <Text>🎉 Giảm giá sau {motorbikes[0]?.motorbikeType.pricingRule?.discountDay || 0} ngày:</Text>
                                <Text style={{ color: '#52c41a', fontWeight: 700, fontSize: '20px' }}>
                                    -{formatPrice(totalDiscount)}
                                </Text>
                            </div>
                        )}

                        <Divider style={{
                            margin: '20px 0',
                            borderColor: '#52c41a',
                            borderWidth: '2px'
                        }} />

                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '22px',
                            fontWeight: '700',
                            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                            color: 'white',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 15px rgba(82,196,26,0.3)'
                        }}>
                            <Text style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>
                                Tổng cộng:
                            </Text>
                            <Text style={{ color: 'white', fontSize: '28px', fontWeight: '700', letterSpacing: '1px' }}>
                                {formatPrice(totalRental + totalDeposit + totalAccessory + totalDamageWaiver)}
                            </Text>
                        </div>
                    </div>
                </>
            )}
        </Card>
    )
}

export default Prices
