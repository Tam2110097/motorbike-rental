import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRef } from 'react';
import AdminLayout from '../../../components/AdminLayout';

// Sửa lỗi không hiển thị icon marker mặc định của Leaflet khi dùng với Vite/React
// (dùng link trực tiếp từ unpkg giống PickAddress.jsx)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationTrackingPage = () => {
    const [rentedMotorbikes, setRentedMotorbikes] = useState([]);
    const [selectedMotorbike, setSelectedMotorbike] = useState(null);
    const [locationHistory, setLocationHistory] = useState([]);
    const [simulationStatus, setSimulationStatus] = useState({});
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [userPosition, setUserPosition] = useState(null);

    // State lưu vị trí của từng xe (giống như markers trong REALTIME_TRACKER)
    const [motorbikePositions, setMotorbikePositions] = useState({});
    const intervalsRef = useRef({});

    // Initialize Socket.IO connection
    useEffect(() => {
        const newSocket = io('http://localhost:8080');
        setSocket(newSocket);

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    // Listen for real-time location updates
    useEffect(() => {
        if (socket && selectedMotorbike) {
            socket.emit('join-location-room', selectedMotorbike._id);

            socket.on('location-update', (data) => {
                if (data.motorbikeId === selectedMotorbike._id) {
                    setLocationHistory(prev => [data, ...prev.slice(0, 99)]);
                }
            });

            return () => {
                socket.emit('leave-location-room', selectedMotorbike._id);
                socket.off('location-update');
            };
        }
    }, [socket, selectedMotorbike]);

    // Lắng nghe location-update từ socket để cập nhật vị trí marker realtime
    useEffect(() => {
        if (socket) {
            const handleLocationUpdate = (data) => {
                console.log('Nhận location-update từ socket:', data);
                setRentedMotorbikes(prev =>
                    prev.map(item =>
                        item.motorbike._id.toString() === data.motorbikeId.toString()
                            ? {
                                ...item,
                                location: {
                                    ...item.location,
                                    latitude: data.latitude,
                                    longitude: data.longitude,
                                    speed: data.speed,
                                    heading: data.heading,
                                    timestamp: data.timestamp
                                }
                            }
                            : item
                    )
                );
            };
            socket.on('location-update', handleLocationUpdate);
            return () => {
                socket.off('location-update', handleLocationUpdate);
            };
        }
    }, [socket]);

    // Lấy vị trí hiện tại của người dùng khi component mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserPosition([
                        position.coords.latitude,
                        position.coords.longitude
                    ]);
                },
                (error) => {
                    console.error('Không lấy được vị trí hiện tại:', error);
                }
            );
        }
    }, []);

    // Khởi tạo vị trí ban đầu cho từng xe khi có danh sách xe rented
    useEffect(() => {
        if (rentedMotorbikes.length > 0) {
            console.log('Khởi tạo vị trí cho', rentedMotorbikes.length, 'xe');
            const initialPositions = {};
            rentedMotorbikes.forEach(item => {
                const motorbikeId = item.motorbike._id;
                // Luôn tạo vị trí mới cho xe chưa có vị trí
                if (!motorbikePositions[motorbikeId]) {
                    const baseLat = 10.7769;
                    const baseLng = 106.7009;
                    const randomLat = baseLat + (Math.random() - 0.5) * 0.01;
                    const randomLng = baseLng + (Math.random() - 0.5) * 0.01;

                    initialPositions[motorbikeId] = [randomLat, randomLng];
                    console.log(`Tạo vị trí ban đầu cho xe ${item.motorbike.code}:`, [randomLat, randomLng]);
                }
            });
            setMotorbikePositions(prev => {
                const newPositions = { ...prev, ...initialPositions };
                console.log('Tất cả vị trí sau khi khởi tạo:', newPositions);
                return newPositions;
            });
        }
    }, [rentedMotorbikes]);

    // Tạo timer di chuyển độc lập cho từng xe (giống như mỗi tab trong REALTIME_TRACKER)
    useEffect(() => {
        console.log('Tạo timer cho', rentedMotorbikes.length, 'xe, vị trí hiện tại:', motorbikePositions);

        // Dọn dẹp intervals cũ
        Object.values(intervalsRef.current).forEach(clearInterval);
        intervalsRef.current = {};

        // Tạo interval mới cho từng xe
        rentedMotorbikes.forEach(item => {
            const motorbikeId = item.motorbike._id;

            // Chỉ tạo interval nếu xe có vị trí
            if (motorbikePositions[motorbikeId]) {
                console.log(`Tạo timer cho xe ${item.motorbike.code} (${motorbikeId})`);

                intervalsRef.current[motorbikeId] = setInterval(() => {
                    setMotorbikePositions(prev => {
                        const currentPos = prev[motorbikeId];
                        if (!currentPos) {
                            console.log(`Không tìm thấy vị trí cho xe ${motorbikeId}`);
                            return prev;
                        }

                        const [lat, lng] = currentPos;

                        // Di chuyển ngẫu nhiên (giống như REALTIME_TRACKER)
                        const movementDistance = 0.00005 + Math.random() * 0.00005; // 5-10 meters
                        const angle = Math.random() * 2 * Math.PI; // Random direction

                        const newLat = lat + Math.cos(angle) * movementDistance;
                        const newLng = lng + Math.sin(angle) * movementDistance;

                        const newPos = [newLat, newLng];
                        console.log(`Xe ${item.motorbike.code} di chuyển từ [${lat.toFixed(6)}, ${lng.toFixed(6)}] đến [${newLat.toFixed(6)}, ${newLng.toFixed(6)}]`);

                        // Gửi vị trí mới về backend
                        const token = localStorage.getItem('token');
                        const locationData = {
                            motorbikeId: motorbikeId,
                            latitude: newLat,
                            longitude: newLng,
                            speed: Math.random() * 50 + 10, // Tốc độ ngẫu nhiên 10-60 km/h
                            heading: Math.random() * 360, // Hướng ngẫu nhiên 0-360 độ
                            timestamp: new Date().toISOString(),
                            isActive: true
                        };

                        axios.post('/api/v1/employee/location/simulation/manual', locationData, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        })
                            .then(response => {
                                console.log(`Đã lưu vị trí xe ${item.motorbike.code}:`, response.data);
                            })
                            .catch(err => {
                                console.error(`Lỗi gửi vị trí xe ${item.motorbike.code}:`, err);
                            });

                        return { ...prev, [motorbikeId]: newPos };
                    });
                }, 3000); // Mỗi 3 giây di chuyển một lần (giống REALTIME_TRACKER)
            } else {
                console.log(`Bỏ qua xe ${item.motorbike.code} vì chưa có vị trí`);
            }
        });

        // Cleanup khi component unmount
        return () => {
            console.log('Dọn dẹp timers');
            Object.values(intervalsRef.current).forEach(clearInterval);
        };
    }, [rentedMotorbikes, motorbikePositions]); // Thêm motorbikePositions vào dependency

    // Fetch all rented motorbikes
    const fetchRentedMotorbikes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/employee/location/rented-motorbikes', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setRentedMotorbikes(response.data.data);
        } catch (error) {
            console.error('Error fetching rented motorbikes:', error);
            toast.error('Failed to fetch rented motorbikes');
        } finally {
            setLoading(false);
        }
    };

    // Get and save location data only from rented motorbikes
    const getAndSaveRentedMotorbikeLocations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/employee/location/rented-motorbikes/save', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.data.length > 0) {
                toast.success(`Retrieved and saved location data for ${response.data.data.length} rented motorbikes`);
                // Update the rented motorbikes list with new location data
                setRentedMotorbikes(response.data.data);
            } else {
                toast.info('No rented motorbikes found');
            }
        } catch (error) {
            console.error('Error getting and saving rented motorbike locations:', error);
            toast.error('Failed to get and save motorbike locations');
        } finally {
            setLoading(false);
        }
    };

    // Fetch simulation status
    const fetchSimulationStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/v1/employee/location/simulation/status', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSimulationStatus(response.data.data);
        } catch (error) {
            console.error('Error fetching simulation status:', error);
        }
    };

    // Start simulation for all rented motorbikes
    const startAllSimulations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('/api/v1/employee/location/simulation/start-all', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('GPS simulation started for all rented motorbikes');
            fetchSimulationStatus();
        } catch (error) {
            console.error('Error starting simulations:', error);
            toast.error('Failed to start GPS simulations');
        } finally {
            setLoading(false);
        }
    };

    // Stop all simulations
    const stopAllSimulations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            await axios.post('/api/v1/employee/location/simulation/stop-all', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('All GPS simulations stopped');
            fetchSimulationStatus();
        } catch (error) {
            console.error('Error stopping simulations:', error);
            toast.error('Failed to stop GPS simulations');
        } finally {
            setLoading(false);
        }
    };

    // Start simulation for specific motorbike
    const startMotorbikeSimulation = async (motorbikeId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/v1/employee/location/simulation/start/${motorbikeId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('GPS simulation started for this motorbike');
            fetchSimulationStatus();
        } catch (error) {
            console.error('Error starting simulation:', error);
            toast.error('Failed to start GPS simulation');
        }
    };

    // Stop simulation for specific motorbike
    const stopMotorbikeSimulation = async (motorbikeId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/v1/employee/location/simulation/stop/${motorbikeId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('GPS simulation stopped for this motorbike');
            fetchSimulationStatus();
        } catch (error) {
            console.error('Error stopping simulation:', error);
            toast.error('Failed to stop GPS simulation');
        }
    };

    // Fetch location history for selected motorbike
    const fetchLocationHistory = async (motorbikeId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/v1/employee/location/motorbike/${motorbikeId}/history`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLocationHistory(response.data.data.locationHistory);
        } catch (error) {
            console.error('Error fetching location history:', error);
            toast.error('Failed to fetch location history');
        }
    };

    // Handle motorbike selection
    const handleMotorbikeSelect = (motorbike) => {
        setSelectedMotorbike(motorbike);
        fetchLocationHistory(motorbike._id);
    };

    // Initial data fetch
    useEffect(() => {
        fetchRentedMotorbikes();
        fetchSimulationStatus();
    }, []);

    console.log('Tất cả vị trí:', (rentedMotorbikes || []).map(i => i.location));
    console.log('Vị trí các xe đang di chuyển:', motorbikePositions);

    return (
        <AdminLayout>
            <div className="p-2" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh' }}>
                <style>
                    {`
                    .location-tracking-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 32px;
                        border-radius: 16px;
                        margin-bottom: 32px;
                        text-align: center;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    }

                    .location-tracking-header h1 {
                        margin: 0;
                        font-size: 32px;
                        font-weight: 700;
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
                        margin-bottom: 8px;
                    }

                    .location-tracking-header p {
                        margin: 0;
                        font-size: 16px;
                        opacity: 0.9;
                        font-weight: 400;
                    }

                    .map-container {
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                        overflow: hidden;
                        border: 1px solid #f0f0f0;
                        margin-bottom: 24px;
                    }

                    .map-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px;
                        border-bottom: 1px solid #dee2e6;
                        font-weight: 600;
                        color: #495057;
                        font-size: 18px;
                    }

                    .control-panel {
                        background: white;
                        border-radius: 16px;
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                        overflow: hidden;
                        border: 1px solid #f0f0f0;
                        margin-bottom: 24px;
                    }

                    .control-panel-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px;
                        border-bottom: 1px solid #dee2e6;
                        font-weight: 600;
                        color: #495057;
                        font-size: 18px;
                    }

                    .control-buttons {
                        padding: 24px;
                        display: flex;
                        gap: 16px;
                        flex-wrap: wrap;
                    }

                    .control-button {
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        border: none;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                        min-width: 180px;
                    }

                    .control-button:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                    }

                    .control-button:disabled {
                        opacity: 0.6;
                        cursor: not-allowed;
                        transform: none;
                    }

                    .btn-start {
                        background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
                        color: white;
                    }

                    .btn-stop {
                        background: linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%);
                        color: white;
                    }

                    .btn-get {
                        background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
                        color: white;
                    }

                    .status-info {
                        padding: 16px 24px;
                        background: #f8f9ff;
                        border-top: 1px solid #e9ecef;
                        font-size: 14px;
                        color: #6c757d;
                    }

                    .motorbike-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        border: 1px solid #f0f0f0;
                        transition: all 0.3s ease;
                        cursor: pointer;
                    }

                    .motorbike-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
                    }

                    .motorbike-card.selected {
                        border-color: #1890ff;
                        background: #f0f8ff;
                        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
                    }

                    .motorbike-card-content {
                        padding: 20px;
                    }

                    .motorbike-info h3 {
                        font-weight: 600;
                        color: #1890ff;
                        margin-bottom: 4px;
                        font-size: 16px;
                    }

                    .motorbike-info p {
                        color: #6c757d;
                        margin-bottom: 4px;
                        font-size: 14px;
                    }

                    .status-badge {
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        text-transform: uppercase;
                    }

                    .status-active {
                        background: #f6ffed;
                        color: #52c41a;
                        border: 1px solid #b7eb8f;
                    }

                    .status-inactive {
                        background: #f5f5f5;
                        color: #8c8c8c;
                        border: 1px solid #d9d9d9;
                    }

                    .action-buttons {
                        display: flex;
                        gap: 8px;
                        margin-top: 12px;
                    }

                    .action-btn {
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        font-weight: 600;
                        border: none;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }

                    .action-btn:hover {
                        transform: translateY(-1px);
                    }

                    .btn-start-small {
                        background: #1890ff;
                        color: white;
                    }

                    .btn-stop-small {
                        background: #ff4d4f;
                        color: white;
                    }

                    .position-info {
                        margin-top: 12px;
                        padding: 8px 12px;
                        background: #f8f9fa;
                        border-radius: 6px;
                        font-size: 11px;
                        color: #6c757d;
                        font-family: monospace;
                    }

                    .location-details-card {
                        background: white;
                        border-radius: 12px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        border: 1px solid #f0f0f0;
                    }

                    .location-details-header {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px;
                        border-bottom: 1px solid #dee2e6;
                        font-weight: 600;
                        color: #495057;
                        font-size: 18px;
                    }

                    .location-details-content {
                        padding: 20px;
                    }

                    .current-location-box {
                        background: linear-gradient(135deg, #f0f8ff 0%, #e6f7ff 100%);
                        border: 1px solid #91d5ff;
                        border-radius: 8px;
                        padding: 16px;
                        margin-bottom: 20px;
                    }

                    .location-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 16px;
                    }

                    .location-item {
                        display: flex;
                        flex-direction: column;
                    }

                    .location-label {
                        font-size: 12px;
                        color: #6c757d;
                        margin-bottom: 4px;
                        font-weight: 500;
                    }

                    .location-value {
                        font-family: monospace;
                        font-size: 14px;
                        font-weight: 600;
                        color: #1890ff;
                    }

                    .location-history {
                        max-height: 300px;
                        overflow-y: auto;
                    }

                    .history-item {
                        background: #f8f9fa;
                        border-radius: 6px;
                        padding: 12px;
                        margin-bottom: 8px;
                        border: 1px solid #e9ecef;
                    }

                    .history-coordinates {
                        font-family: monospace;
                        font-size: 12px;
                        color: #495057;
                        margin-bottom: 4px;
                    }

                    .history-time {
                        font-size: 11px;
                        color: #6c757d;
                        text-align: right;
                    }

                    .history-details {
                        font-size: 11px;
                        color: #6c757d;
                        margin-top: 4px;
                    }

                    .empty-state {
                        text-align: center;
                        padding: 40px 20px;
                        color: #6c757d;
                    }

                    .empty-state-icon {
                        font-size: 48px;
                        margin-bottom: 16px;
                        opacity: 0.5;
                    }
                `}
                </style>

                <div className="location-tracking-header">
                    <h1>🚗 GPS Location Tracking</h1>
                    <p>Monitor real-time location of rented motorbikes with live updates</p>
                </div>

                {/* Bản đồ vị trí các xe đang thuê */}
                <div className="map-container">
                    <div className="map-header">
                        🗺️ Bản đồ vị trí các xe đang thuê
                    </div>
                    <MapContainer
                        center={userPosition || [10.7769, 106.7009]}
                        zoom={12}
                        style={{ height: '500px', width: '100%' }}
                    >
                        <TileLayer
                            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            // attribution="&copy; OpenStreetMap contributors"
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri'
                        />
                        {/* Marker vị trí hiện tại của bạn */}
                        {userPosition && (
                            <Marker position={userPosition}>
                                <Popup>Vị trí của bạn</Popup>
                            </Marker>
                        )}

                        {/* Render marker cho từng xe đang di chuyển (giống như REALTIME_TRACKER) */}
                        {Object.entries(motorbikePositions).map(([motorbikeId, position]) => {
                            const motorbike = rentedMotorbikes.find(item => item.motorbike._id === motorbikeId);
                            if (!motorbike) return null;

                            const [lat, lng] = position;
                            return (
                                <Marker
                                    key={motorbikeId}
                                    position={[lat, lng]}
                                    icon={L.icon({
                                        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                                        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                                        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                                        iconSize: [25, 41],
                                        iconAnchor: [12, 41],
                                        popupAnchor: [1, -34],
                                        shadowSize: [41, 41],
                                    })}
                                >
                                    <Popup>
                                        <div>
                                            <strong>{motorbike.motorbike.code}</strong><br />
                                            {motorbike.motorbike.motorbikeType?.name}<br />
                                            Vĩ độ: {lat.toFixed(5)}<br />
                                            Kinh độ: {lng.toFixed(5)}<br />
                                            <span style={{ color: 'green' }}>🔄 Đang di chuyển</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MapContainer>
                </div>

                {/* Control Panel */}
                <div className="control-panel">
                    <div className="control-panel-header">
                        🎮 Simulation Controls
                    </div>
                    <div className="control-buttons">
                        <button
                            onClick={startAllSimulations}
                            disabled={loading}
                            className="control-button btn-start"
                        >
                            {loading ? '🔄 Starting...' : '▶️ Start All Simulations'}
                        </button>
                        <button
                            onClick={stopAllSimulations}
                            disabled={loading}
                            className="control-button btn-stop"
                        >
                            {loading ? '🔄 Stopping...' : '⏹️ Stop All Simulations'}
                        </button>
                        <button
                            onClick={getAndSaveRentedMotorbikeLocations}
                            disabled={loading}
                            className="control-button btn-get"
                        >
                            {loading ? '🔄 Processing...' : '📥 Get & Save Rented Locations'}
                        </button>
                    </div>
                    <div className="status-info">
                        <strong>📊 Status:</strong> Active Simulations: {simulationStatus?.totalActive ?? 0}
                        {simulationStatus?.hasRentedMotorbikes !== undefined && (
                            <span style={{ marginLeft: '16px' }}>
                                Has Rented Motorbikes: {simulationStatus.hasRentedMotorbikes ? '✅ Yes' : '❌ No'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rented Motorbikes List */}
                    <div className="motorbike-card">
                        <div className="location-details-header">
                            🏍️ Rented Motorbikes
                        </div>
                        <div className="location-details-content">
                            {loading ? (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🔄</div>
                                    <div>Loading motorbikes...</div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(rentedMotorbikes || []).map((item) => {
                                        const isActive = simulationStatus.activeSimulations?.includes(item.motorbike._id);
                                        const currentPosition = motorbikePositions[item.motorbike._id];
                                        return (
                                            <div
                                                key={item.motorbike._id}
                                                className={`motorbike-card ${selectedMotorbike?._id === item.motorbike._id ? 'selected' : ''}`}
                                                onClick={() => handleMotorbikeSelect(item.motorbike)}
                                            >
                                                <div className="motorbike-card-content">
                                                    <div className="flex justify-between items-start">
                                                        <div className="motorbike-info">
                                                            <h3>{item.motorbike.code}</h3>
                                                            <p>{item.motorbike.motorbikeType?.name || 'Unknown Type'}</p>
                                                            <p>Branch: {item.motorbike.branchId?.name || 'Unknown Branch'}</p>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
                                                                {isActive ? '🟢 Active' : '⚪ Inactive'}
                                                            </span>
                                                            <div className="action-buttons">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startMotorbikeSimulation(item.motorbike._id);
                                                                    }}
                                                                    className="action-btn btn-start-small"
                                                                >
                                                                    ▶️ Start
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        stopMotorbikeSimulation(item.motorbike._id);
                                                                    }}
                                                                    className="action-btn btn-stop-small"
                                                                >
                                                                    ⏹️ Stop
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {currentPosition && (
                                                        <div className="position-info">
                                                            📍 Current Position: {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Details */}
                    <div className="location-details-card">
                        <div className="location-details-header">
                            📍 Location Details
                        </div>
                        <div className="location-details-content">
                            {selectedMotorbike ? (
                                <div>
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-800 mb-2" style={{ color: '#1890ff', fontSize: '18px' }}>
                                            {selectedMotorbike.code}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {selectedMotorbike.motorbikeType?.name || 'Unknown Type'}
                                        </p>
                                    </div>

                                    {/* Current Location */}
                                    {locationHistory.length > 0 && (
                                        <div className="current-location-box">
                                            <h4 className="font-semibold mb-3" style={{ color: '#1890ff' }}>📍 Current Location</h4>
                                            <div className="location-grid">
                                                <div className="location-item">
                                                    <span className="location-label">Latitude:</span>
                                                    <span className="location-value">{locationHistory[0].latitude.toFixed(6)}</span>
                                                </div>
                                                <div className="location-item">
                                                    <span className="location-label">Longitude:</span>
                                                    <span className="location-value">{locationHistory[0].longitude.toFixed(6)}</span>
                                                </div>
                                                <div className="location-item">
                                                    <span className="location-label">Speed:</span>
                                                    <span className="location-value" style={{ color: '#52c41a' }}>{locationHistory[0].speed.toFixed(1)} km/h</span>
                                                </div>
                                                <div className="location-item">
                                                    <span className="location-label">Heading:</span>
                                                    <span className="location-value" style={{ color: '#fa8c16' }}>{locationHistory[0].heading.toFixed(1)}°</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Location History */}
                                    <div>
                                        <h4 className="font-semibold mb-3" style={{ color: '#1890ff' }}>📊 Location History</h4>
                                        <div className="location-history">
                                            {locationHistory.length > 0 ? (
                                                <div className="space-y-2">
                                                    {locationHistory.slice(0, 10).map((location, index) => (
                                                        <div key={index} className="history-item">
                                                            <div className="flex justify-between">
                                                                <span className="history-coordinates">
                                                                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                                                </span>
                                                                <span className="history-time">
                                                                    {new Date(location.timestamp).toLocaleTimeString()}
                                                                </span>
                                                            </div>
                                                            <div className="history-details">
                                                                Speed: {location.speed.toFixed(1)} km/h | Heading: {location.heading.toFixed(1)}°
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="empty-state">
                                                    <div className="empty-state-icon">📊</div>
                                                    <div>No location history available</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-state-icon">🏍️</div>
                                    <div>Select a motorbike to view location details</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default LocationTrackingPage;