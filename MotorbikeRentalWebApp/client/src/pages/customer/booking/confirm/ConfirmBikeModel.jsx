import React, { useEffect } from 'react'
import HeaderBar from '../../../../components/HeaderBar'
import Footer from '../../../../components/Footer'
import { Layout } from 'antd'
import TripInformation from '../common/TripInformation'
import OrderMotorbikeDetail from './components/OrderMotorbikeDetail'
import Accessory from './components/Accessory'
import ContinueButton from '../common/ContinueButton'
// import { useBooking } from '../../../context/BookingContext'
import Prices from './components/Prices'
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

const ConfirmBikeModel = () => {
    // const { bookingData } = useBooking()

    // Auto scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{ padding: '24px', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <TimeLine />
                    <div style={{ marginBottom: 24 }}>
                        <h1 style={pageTitleStyle}>
                            Xác nhận đặt xe
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
                        <OrderMotorbikeDetail />
                        <Accessory />
                        <Prices />
                        <div style={{ marginTop: 16 }}>
                            <ContinueButton path='/booking/order-review' />
                        </div>
                    </div>
                </div>
            </Content>
            <Footer />
        </Layout>
    )
}

export default ConfirmBikeModel