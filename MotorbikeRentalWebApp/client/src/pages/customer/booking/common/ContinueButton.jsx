import React from 'react'
import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

const ContinueButton = ({ path, disabled = false, onClick }) => {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            navigate(path)
        }
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: '16px',
            marginTop: 'auto'
        }}>
            <Button
                type="primary"
                size="small"
                disabled={disabled}
                style={{
                    // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    padding: '8px 16px',
                    height: '36px',
                    opacity: disabled ? 0.6 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                    if (!disabled) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.5)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                    }
                }}
                onClick={handleClick}
            >
                Tiếp tục
            </Button>
        </div>
    )
}

export default ContinueButton
