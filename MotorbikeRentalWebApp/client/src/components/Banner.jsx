import React from 'react'
import banner from '../assets/banner2.jpg'

const Banner = ({ component }) => {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
            <img
                src={banner}
                alt="Banner"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                }}
            />
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontFamily: 'Arial, sans-serif',
                // color: 'black',
                // color: 'rgba(53,186,245,255)',
                color: 'white',
                fontSize: '4rem',
                fontWeight: 'bold',
            }}>
                RENREN MOTORBIKE
            </div>
            <div style={{
                position: 'absolute',
                top: '60%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            }}>
                {component}
            </div>
        </div>

    )
}

export default Banner
