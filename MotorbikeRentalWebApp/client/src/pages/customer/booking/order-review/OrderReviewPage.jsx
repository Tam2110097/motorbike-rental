import React, { useState, useEffect } from 'react'
import { Layout } from 'antd'
import HeaderBar from '../../../../components/HeaderBar'
import Footer from '../../../../components/Footer'
import TripInformation from '../common/TripInformation'
import ProductPriceDetail from './components/ProductPriceDetail'
import CartsTotal from './components/CartsTotal'
import PolicyAgreement from './components/PolicyAgreement'
import ContinueButton from '../common/ContinueButton'
import { useNavigate } from 'react-router-dom'
import { useBooking } from '../../../../context/BookingContext'
import TimeLine from '../../../../components/TimeLine'

const { Content } = Layout

const pageTitleStyle = {
    textAlign: 'center',
    margin: '0px auto 30px auto',
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 10,
};

const OrderReviewPage = () => {
    const [policiesAccepted, setPoliciesAccepted] = useState(false)
    const [showPolicyError, setShowPolicyError] = useState(false)
    const navigate = useNavigate()
    const { bookingData } = useBooking();

    // Auto scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const handlePolicyChange = (policies) => {
        const allAccepted = policies.rentalPolicy && policies.safetyPolicy
        setPoliciesAccepted(allAccepted)
        setShowPolicyError(false) // Hide error when policies are accepted
    }

    const handleContinueClick = () => {
        if (!policiesAccepted) {
            setShowPolicyError(true)
            return
        }
        console.log('>>>>>>>>>>>>>>', bookingData)
        navigate('/booking/checkout')
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <TimeLine />
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={pageTitleStyle}>
                            Xem lại đơn hàng
                        </h1>
                    </div>
                    <div style={{
                        maxWidth: 1000,
                        margin: '0 auto',
                        background: '#fff',
                        borderRadius: 16,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        padding: 32,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 32
                    }}>
                        <TripInformation />
                        <ProductPriceDetail />
                        <CartsTotal />
                        <PolicyAgreement onPolicyChange={handlePolicyChange} />

                        {showPolicyError && (
                            <div style={{
                                background: '#fff2f0',
                                border: '1px solid #ffccc7',
                                borderRadius: '8px',
                                padding: '16px',
                                color: '#cf1322',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(207, 19, 34, 0.1)'
                            }}>
                                ⚠️ Vui lòng đọc và chấp nhận cả hai chính sách trước khi tiếp tục.
                            </div>
                        )}

                        <div style={{ marginTop: 16 }}>
                            <ContinueButton
                                path="/booking/checkout"
                                disabled={!policiesAccepted}
                                onClick={handleContinueClick}
                            />
                        </div>
                    </div>
                </div>
            </Content>
            <Footer />
        </Layout>
    )
}

export default OrderReviewPage
