import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import io from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRef } from 'react';

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
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">GPS Location Tracking</h1>
                <p className="text-gray-600">Monitor real-time location of rented motorbikes</p>
            </div>

            {/* Bản đồ vị trí các xe đang thuê */}
            <div className="my-6">
                <h2 className="text-xl font-semibold mb-2">Bản đồ vị trí các xe đang thuê</h2>
                <MapContainer
                    center={userPosition || [10.7769, 106.7009]}
                    zoom={12}
                    style={{ height: '400px', width: '100%' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
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
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Simulation Controls</h2>
                <div className="flex gap-4 mb-4">
                    <button
                        onClick={startAllSimulations}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                        {loading ? 'Starting...' : 'Start All Simulations'}
                    </button>
                    <button
                        onClick={stopAllSimulations}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
                    >
                        {loading ? 'Stopping...' : 'Stop All Simulations'}
                    </button>
                </div>
                <div className="text-sm text-gray-600">
                    Active Simulations: {simulationStatus?.totalActive ?? 0}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rented Motorbikes List */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Rented Motorbikes</h2>
                    {loading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : (
                        <div className="space-y-3">
                            {(rentedMotorbikes || []).map((item) => {
                                const isActive = simulationStatus.activeSimulations?.includes(item.motorbike._id);
                                const currentPosition = motorbikePositions[item.motorbike._id];
                                return (
                                    <div
                                        key={item.motorbike._id}
                                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedMotorbike?._id === item.motorbike._id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        onClick={() => handleMotorbikeSelect(item.motorbike)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">
                                                    {item.motorbike.code}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {item.motorbike.motorbikeType?.name || 'Unknown Type'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Branch: {item.motorbike.branchId?.name || 'Unknown Branch'}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs ${isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            startMotorbikeSimulation(item.motorbike._id);
                                                        }}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                        Start
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            stopMotorbikeSimulation(item.motorbike._id);
                                                        }}
                                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                                    >
                                                        Stop
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        {currentPosition && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                Current Position: {currentPosition[0].toFixed(6)}, {currentPosition[1].toFixed(6)}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Location Details */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Location Details</h2>
                    {selectedMotorbike ? (
                        <div>
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-800 mb-2">
                                    {selectedMotorbike.code}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {selectedMotorbike.motorbikeType?.name || 'Unknown Type'}
                                </p>
                            </div>

                            {/* Current Location */}
                            {locationHistory.length > 0 && (
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <h4 className="font-semibold mb-2">Current Location</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Latitude:</span>
                                            <p className="font-mono">{locationHistory[0].latitude.toFixed(6)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Longitude:</span>
                                            <p className="font-mono">{locationHistory[0].longitude.toFixed(6)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Speed:</span>
                                            <p>{locationHistory[0].speed.toFixed(1)} km/h</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Heading:</span>
                                            <p>{locationHistory[0].heading.toFixed(1)}°</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Location History */}
                            <div>
                                <h4 className="font-semibold mb-2">Location History</h4>
                                <div className="max-h-64 overflow-y-auto">
                                    {locationHistory.length > 0 ? (
                                        <div className="space-y-2">
                                            {locationHistory.slice(0, 10).map((location, index) => (
                                                <div key={index} className="text-xs p-2 bg-gray-50 rounded">
                                                    <div className="flex justify-between">
                                                        <span>
                                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            {new Date(location.timestamp).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-500">
                                                        Speed: {location.speed.toFixed(1)} km/h |
                                                        Heading: {location.heading.toFixed(1)}°
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No location history available</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            Select a motorbike to view location details
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationTrackingPage;