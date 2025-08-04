import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

// Icon tùy chỉnh vì Leaflet không load icon mặc định
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ onLocationChange, initialPosition }) => {
    const [position, setPosition] = useState(initialPosition);

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);

            // Gọi Nominatim để lấy địa chỉ
            axios
                .get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then((res) => {
                    const address = res.data.display_name;
                    onLocationChange({ lat, lng, address });
                })
                .catch((err) => {
                    console.error('Error getting address:', err);
                });
        },
    });

    // Update position when initialPosition changes
    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    return position ? <Marker position={position} /> : null;
};

const PickAddress = ({ onAddressPicked }) => {
    const [currentPosition, setCurrentPosition] = useState([10.762622, 106.660172]); // default: TP.HCM
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Get current location when component mounts
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentPosition([latitude, longitude]);

                    // Don't automatically set address, let user click to select
                    setIsLoading(false);
                },
                (error) => {
                    console.error('Error getting current location:', error);
                    setIsLoading(false);
                }
            );
        } else {
            setIsLoading(false);
        }
    }, [onAddressPicked]);

    const containerStyle = {
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        border: '1px solid #e8f0fe'
    };

    const headerStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    };

    const mapContainerStyle = {
        height: '400px',
        position: 'relative'
    };

    const instructionStyle = {
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '12px 16px',
        borderRadius: '12px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
        fontSize: '14px',
        color: '#374151',
        fontWeight: '500',
        zIndex: 400,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '280px'
    };

    const loadingStyle = {
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        borderRadius: '16px',
        color: '#4b5563',
        fontSize: '16px',
        fontWeight: '500'
    };

    if (isLoading) {
        return (
            <div style={containerStyle}>
                <div style={headerStyle}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    Chọn địa điểm nhận xe
                </div>
                <div style={loadingStyle}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '12px' }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeDashoffset="31.416">
                                    <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite" />
                                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite" />
                                </circle>
                            </svg>
                        </div>
                        Đang tải vị trí hiện tại...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Chọn địa điểm nhận xe
            </div>
            <div style={mapContainerStyle}>
                <MapContainer
                    center={currentPosition}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        // attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        //     attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri'
                    // url="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=AP53YlPcyRpMVUGIW48D"
                    // attribution='&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
                    />
                    <LocationMarker onLocationChange={onAddressPicked} initialPosition={currentPosition} />
                </MapContainer>
                <div style={instructionStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <strong>Hướng dẫn</strong>
                    </div>
                    Nhấp vào bản đồ để chọn địa điểm nhận xe
                </div>
            </div>
        </div>
    );
};

export default PickAddress;
