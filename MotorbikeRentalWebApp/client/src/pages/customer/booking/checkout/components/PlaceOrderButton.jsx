import React from "react";

const PlaceOrderButton = ({ onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                background: '#1890ff',
                color: 'white',
                fontWeight: 600,
                fontSize: 18,
                padding: '12px 36px',
                border: 'none',
                borderRadius: 8,
                cursor: disabled ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(24,144,255,0.12)',
                marginTop: 24,
                transition: 'background 0.2s',
                opacity: disabled ? 0.6 : 1
            }}
        >
            Đặt xe
        </button>
    );
};

export default PlaceOrderButton;
