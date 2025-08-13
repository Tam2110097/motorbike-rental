import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TimeLine = () => {
    const location = useLocation();

    // Auto scroll to top when location changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Define the booking flow steps
    const steps = [
        {
            id: 'confirm',
            title: 'Xác nhận đặt xe',
            path: '/booking/confirm-bike-model',
            icon: '✓',
            description: 'Xác nhận thông tin xe và phụ kiện'
        },
        {
            id: 'review',
            title: 'Xem lại đơn hàng',
            path: '/booking/order-review',
            icon: '📋',
            description: 'Kiểm tra và đồng ý với chính sách'
        },
        {
            id: 'checkout',
            title: 'Thanh toán',
            path: '/booking/checkout',
            icon: '💳',
            description: 'Hoàn tất đặt hàng và thanh toán'
        }
    ];

    // Determine current step based on current path
    const getCurrentStepIndex = () => {
        const currentPath = location.pathname;
        const stepIndex = steps.findIndex(step => step.path === currentPath);
        return stepIndex >= 0 ? stepIndex : 0;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                maxWidth: '800px',
                margin: '0 auto'
            }}>
                {/* Progress bar background */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                    transform: 'translateY(-50%)',
                    zIndex: 1
                }} />

                {/* Progress bar fill */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '2px',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    transition: 'width 0.5s ease-in-out',
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
                }} />

                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div
                            key={step.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                position: 'relative',
                                zIndex: 3,
                                flex: 1
                            }}
                        >
                            {/* Step circle */}
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                marginBottom: '12px',
                                transition: 'all 0.3s ease',
                                background: isCompleted
                                    ? 'rgba(255, 255, 255, 0.95)'
                                    : isCurrent
                                        ? 'rgba(255, 255, 255, 0.9)'
                                        : 'rgba(255, 255, 255, 0.4)',
                                color: isCompleted
                                    ? '#667eea'
                                    : isCurrent
                                        ? '#764ba2'
                                        : 'rgba(255, 255, 255, 0.7)',
                                border: isCurrent
                                    ? '3px solid rgba(255, 255, 255, 0.9)'
                                    : '3px solid transparent',
                                boxShadow: isCurrent
                                    ? '0 4px 16px rgba(255, 255, 255, 0.4)'
                                    : 'none',
                                transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
                            }}>
                                {isCompleted ? '✓' : step.icon}
                            </div>

                            {/* Step title */}
                            <div style={{
                                textAlign: 'center',
                                marginBottom: '4px'
                            }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: isCompleted || isCurrent
                                        ? 'rgba(255, 255, 255, 0.95)'
                                        : 'rgba(255, 255, 255, 0.6)',
                                    transition: 'color 0.3s ease',
                                    lineHeight: '1.2'
                                }}>
                                    {step.title}
                                </div>
                            </div>

                            {/* Step description */}
                            <div style={{
                                textAlign: 'center',
                                fontSize: '12px',
                                color: isCompleted || isCurrent
                                    ? 'rgba(255, 255, 255, 0.8)'
                                    : 'rgba(255, 255, 255, 0.5)',
                                transition: 'color 0.3s ease',
                                lineHeight: '1.3',
                                maxWidth: '120px'
                            }}>
                                {step.description}
                            </div>

                            {/* Step number indicator */}
                            <div style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: isCurrent
                                    ? 'rgba(255, 255, 255, 0.9)'
                                    : 'rgba(255, 255, 255, 0.3)',
                                color: isCurrent ? '#764ba2' : 'rgba(255, 255, 255, 0.7)',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid rgba(255, 255, 255, 0.8)',
                                transition: 'all 0.3s ease'
                            }}>
                                {index + 1}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Progress text */}
            <div style={{
                textAlign: 'center',
                marginTop: '20px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '14px',
                fontWeight: '500'
            }}>
                Bước {currentStepIndex + 1} trong {steps.length}: {steps[currentStepIndex]?.title}
            </div>
        </div>
    );
};

export default TimeLine;
