import React, { useState } from 'react'
import { Button, Input } from 'antd'
import { MinusOutlined, PlusOutlined } from '@ant-design/icons'

const IncrementAnDecrementButton = ({ min = 0, max = 100, step = 1, defaultValue = 0, onChange, disabled = false }) => {
    const [value, setValue] = useState(defaultValue)

    const handleDecrement = () => {
        if (!disabled && value > min) {
            const newValue = value - step
            setValue(newValue)
            if (onChange) onChange(newValue)
        }
    }

    const handleIncrement = () => {
        if (!disabled && value < max) {
            const newValue = value + step
            setValue(newValue)
            if (onChange) onChange(newValue)
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'default',
                pointerEvents: disabled ? 'auto' : 'auto',
            }}
        >
            <Button
                type="primary"
                shape="circle"
                icon={<MinusOutlined />}
                onClick={handleDecrement}
                disabled={disabled || value <= min}
                size="middle"
            />
            <Input
                value={value}
                readOnly
                style={{ width: 48, textAlign: 'center', fontWeight: 'bold', background: '#fff' }}
                disabled={disabled}
            />
            <Button
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
                onClick={handleIncrement}
                disabled={disabled || value >= max}
                size="middle"
            />
        </div>
    )
}

export default IncrementAnDecrementButton
