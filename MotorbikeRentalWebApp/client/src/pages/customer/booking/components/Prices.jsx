import React from 'react'
import { useBooking } from '../../../../context/BookingContext'
import { Card, Typography, Divider } from 'antd'

const { Title, Text } = Typography

const Prices = () => {
    const { bookingData } = useBooking()
    const motorbikes = bookingData.motorbikes || []
    const accessories = bookingData.accessories || []

    // Helper to format currency
    const formatPrice = (price) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

    // Calculate totals
    let totalRental = 0
    let totalDeposit = 0
    let totalAccessory = 0

    return (
        <Card
            title={<span style={{ color: '#1890ff', fontWeight: 700, fontSize: 20 }}>Tổng chi phí</span>}
            style={{
                marginTop: 24,
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(24,144,255,0.07)',
                border: '1px solid #e6f7ff',
                background: '#fafdff',
                maxWidth: 500,
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: 0
            }}
            bodyStyle={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '16px',
                scrollbarWidth: 'thin',
                scrollbarColor: '#1890ff #f0f0f0'
            }}
        >
            {motorbikes.length === 0 && accessories.length === 0 ? (
                <Text type="secondary">Chưa chọn xe hoặc phụ kiện nào</Text>
            ) : (
                <>
                    {motorbikes.map((item) => {
                        const { motorbikeType, quantity } = item
                        // Rental fee logic (same/different branch)
                        const isSameBranch = bookingData.startBranch === bookingData.endBranch
                        const rentalFee =
                            isSameBranch
                                ? motorbikeType.pricingRule?.sameBranchPrice || motorbikeType.price || 0
                                : motorbikeType.pricingRule?.differentBranchPrice || motorbikeType.price || 0
                        const deposit = motorbikeType.deposit || 0

                        const subtotalRental = rentalFee * quantity
                        const subtotalDeposit = deposit * quantity

                        totalRental += subtotalRental
                        totalDeposit += subtotalDeposit

                        return null // Don't render individual items
                    })}

                    {accessories.map((item) => {
                        const { accessory, quantity } = item
                        const price = accessory.price || 0
                        const subtotal = price * quantity
                        totalAccessory += subtotal
                        return null // Don't render individual items
                    })}

                    <div
                        style={{
                            fontWeight: 700,
                            fontSize: 18,
                            marginTop: 16,
                            background: '#e6f7ff',
                            borderRadius: 12,
                            padding: 18,
                            boxShadow: '0 2px 8px rgba(82,196,26,0.07)',
                            border: '1.5px solid #52c41a',
                            color: '#222',
                        }}
                    >
                        <div>
                            <Text>Tổng tiền thuê: </Text>
                            <Text style={{ color: '#1890ff', fontWeight: 700 }}>{formatPrice(totalRental)}</Text>
                        </div>
                        <div>
                            <Text>Tổng tiền cọc: </Text>
                            <Text style={{ color: '#faad14', fontWeight: 700 }}>{formatPrice(totalDeposit)}</Text>
                        </div>
                        {totalAccessory > 0 && (
                            <div>
                                <Text>Tổng phụ kiện: </Text>
                                <Text style={{ color: '#722ed1', fontWeight: 700 }}>{formatPrice(totalAccessory)}</Text>
                            </div>
                        )}
                        <Divider style={{ margin: '8px 0' }} />
                        <div>
                            <Text strong style={{ fontSize: 20 }}>Tổng cộng: </Text>
                            <Text strong style={{ color: '#52c41a', fontSize: 24, letterSpacing: 1 }}>
                                {formatPrice(totalRental + totalDeposit + totalAccessory)}
                            </Text>
                        </div>
                    </div>
                </>
            )}
        </Card>
    )
}

export default Prices
