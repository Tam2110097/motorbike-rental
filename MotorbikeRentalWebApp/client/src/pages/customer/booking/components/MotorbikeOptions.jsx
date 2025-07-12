import React, { useState, useEffect } from 'react'
import { Select, Card, Typography, Space } from 'antd'
import { useBooking } from '../../../../context/BookingContext'
import axios from 'axios'

const { Option } = Select
const { Text } = Typography

const MotorbikeOptions = () => {
    const { bookingData, setBookingData } = useBooking()
    const [motorbikeOptions, setMotorbikeOptions] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedValue, setSelectedValue] = useState(null)

    const getMotorbikeOptions = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`http://localhost:8080/api/v1/customer/motorbike-type/available?branchId=${bookingData.startBranch}`)
            if (res.data.success) {
                // Exclude all already chosen types
                const chosenIds = (bookingData.motorbikes || []).map(item => item.motorbikeType._id)
                const filteredOptions = res.data.motorbikeTypes.filter(
                    motorbike => !chosenIds.includes(motorbike._id)
                )
                setMotorbikeOptions(filteredOptions)
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getMotorbikeOptions()
    }, [bookingData.startBranch, bookingData.motorbikes])

    const handleMotorbikeSelect = (motorbikeId) => {
        const selected = motorbikeOptions.find(motorbike => motorbike._id === motorbikeId)
        setBookingData(prev => {
            const alreadyExists = (prev.motorbikes || []).some(item => item.motorbikeType._id === selected._id)
            if (alreadyExists) return prev
            return {
                ...prev,
                motorbikes: [...(prev.motorbikes || []), { motorbikeType: selected, quantity: 1 }],
                motorbikeTypes: [...(prev.motorbikeTypes || []), selected]
            }
        })
        // Clear the select after selection
        setSelectedValue(null)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price)
    }

    const getRentalPrice = (motorbike) => {
        // Check if same branch or different branch
        const isSameBranch = bookingData.startBranch === bookingData.endBranch

        if (isSameBranch) {
            return motorbike.pricingRule?.sameBranchPrice || motorbike.price || 0
        } else {
            return motorbike.pricingRule?.differentBranchPrice || motorbike.price || 0
        }
    }

    return (
        <Card
            title="Chọn thêm xe máy khác"
            style={{
                marginBottom: 16,
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                background: '#fafcff',
                border: '1px solid #e6f7ff'
            }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Text strong>Chọn loại xe:</Text>
                    <Select
                        placeholder="Chọn loại xe máy"
                        style={{
                            width: '100%',
                            marginTop: 8,
                            borderRadius: 8,
                            background: '#f5faff',
                            border: '1px solid #e6f7ff'
                        }}
                        dropdownStyle={{
                            borderRadius: 10,
                            boxShadow: '0 4px 16px rgba(24,144,255,0.08)'
                        }}
                        onChange={handleMotorbikeSelect}
                        loading={loading}
                        value={selectedValue}
                        allowClear
                    >
                        {motorbikeOptions.map((motorbike) => (
                            <Option key={motorbike._id} value={motorbike._id}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: 6,
                                        borderRadius: 8,
                                        transition: 'background 0.2s',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={`http://localhost:8080${motorbike.image}`}
                                        alt={motorbike.name}
                                        style={{
                                            width: 44,
                                            height: 44,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            border: '1px solid #e6f7ff',
                                            background: '#fff'
                                        }}
                                        onError={(e) => {
                                            e.target.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
                                        }}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 16 }}>{motorbike.name}</div>
                                        <div style={{ fontSize: 13, color: '#1890ff', fontWeight: 500 }}>
                                            {formatPrice(getRentalPrice(motorbike))}/ngày
                                        </div>
                                    </div>
                                </div>
                            </Option>
                        ))}
                    </Select>
                </div>
            </Space>
        </Card>
    )
}

export default MotorbikeOptions