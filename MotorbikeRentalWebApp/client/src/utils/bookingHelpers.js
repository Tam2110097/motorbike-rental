import { message } from 'antd'

export const addMotorbikeToBooking = ({
    motorbikeType,
    isAddingAnother,
    bookingData,
    setBookingData,
}) => {
    const currentMotorbikeId = motorbikeType._id?.toString()
    const max = motorbikeType.availableCount || 10

    if (isAddingAnother) {
        if (
            bookingData.selectedMotorbike &&
            bookingData.selectedMotorbike._id?.toString() === currentMotorbikeId
        ) {
            const newQuantity = (bookingData.quantity || 1) + 1
            if (newQuantity > max) {
                message.warning('Đã đạt giới hạn số lượng cho xe chính')
                return
            }

            setBookingData(prev => ({
                ...prev,
                quantity: newQuantity,
            }))
        } else {
            const existingIndex = bookingData.additionalMotorbikes?.findIndex(
                item => item.motorbikeType._id?.toString() === currentMotorbikeId
            )

            if (existingIndex !== -1) {
                const existingItem = bookingData.additionalMotorbikes[existingIndex]
                const newQuantity = existingItem.quantity + 1
                if (newQuantity > max) {
                    message.warning('Đã đạt giới hạn số lượng cho xe bổ sung')
                    return
                }

                setBookingData(prev => ({
                    ...prev,
                    additionalMotorbikes: prev.additionalMotorbikes.map((item, index) =>
                        index === existingIndex
                            ? { ...item, quantity: newQuantity }
                            : item
                    )
                }))
            } else {
                setBookingData(prev => ({
                    ...prev,
                    additionalMotorbikes: [
                        ...(prev.additionalMotorbikes || []),
                        {
                            motorbikeType,
                            quantity: 1
                        }
                    ]
                }))
            }
        }
    } else {
        setBookingData(prev => ({
            ...prev,
            selectedMotorbike: motorbikeType,
            quantity: 1,
            additionalMotorbikes: []
        }))
    }
}

export const removeMotorbikeFromBooking = ({
    motorbikeTypeId,
    isMainMotorbike,
    bookingData,
    setBookingData,
}) => {
    const id = motorbikeTypeId.toString()

    if (isMainMotorbike) {
        if (
            bookingData.selectedMotorbike &&
            bookingData.selectedMotorbike._id?.toString() === id
        ) {
            const newQuantity = (bookingData.quantity || 1) - 1
            if (newQuantity <= 0) {
                setBookingData(prev => ({
                    ...prev,
                    selectedMotorbike: null,
                    quantity: 0
                }))
                message.info('Đã xóa xe chính khỏi đơn hàng')
            } else {
                setBookingData(prev => ({
                    ...prev,
                    quantity: newQuantity
                }))
            }
        }
    } else {
        const index = bookingData.additionalMotorbikes?.findIndex(
            item => item.motorbikeType._id?.toString() === id
        )
        if (index !== -1) {
            const item = bookingData.additionalMotorbikes[index]
            const newQuantity = item.quantity - 1

            if (newQuantity <= 0) {
                const updatedList = bookingData.additionalMotorbikes.filter(
                    (_, i) => i !== index
                )
                setBookingData(prev => ({
                    ...prev,
                    additionalMotorbikes: updatedList
                }))
                message.info('Đã xóa xe bổ sung khỏi đơn hàng')
            } else {
                setBookingData(prev => ({
                    ...prev,
                    additionalMotorbikes: bookingData.additionalMotorbikes.map((item, i) =>
                        i === index ? { ...item, quantity: newQuantity } : item
                    )
                }))
            }
        }
    }
}
