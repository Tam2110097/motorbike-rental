import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    WiThermometer,
    WiHumidity,
    WiStrongWind,
    WiRain,
    WiDaySunny,
    WiCloudy,
    WiRainMix,
    WiSnow,
    WiThunderstorm
} from 'react-icons/wi';
import { FaMotorcycle, FaChartLine, FaMapMarkerAlt } from 'react-icons/fa';
import { BsCalendarDate, BsGraphUp } from 'react-icons/bs';
import AdminLayout from '../../../components/AdminLayout';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const RentalForecast = () => {
    const [selectedCity, setSelectedCity] = useState('');
    const [cities, setCities] = useState([]);
    const [forecast, setForecast] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // API base URL
    const API_BASE_URL = 'http://localhost:8080/api/v1';

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (selectedCity && selectedCity.trim() !== '') {
            fetchForecast();
            fetchWeather();
        }
    }, [selectedCity]);

    const fetchCities = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/prediction/cities`);
            setCities(response.data.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchForecast = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/prediction/forecast?city=${selectedCity}`);
            console.log('Forecast data:', response.data.data);
            setForecast(response.data.data);
        } catch (error) {
            setError('Không thể tải dữ liệu dự báo. Vui lòng thử lại.');
            console.error('Error fetching forecast:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWeather = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/prediction/weather?city=${selectedCity}`);
            console.log('Weather data:', response.data.data);
            setWeather(response.data.data);
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    };

    const getWeatherIcon = (description) => {
        if (!description) return <WiDaySunny className="text-yellow-500" />;

        const desc = description.toLowerCase();
        if (desc.includes('rain')) return <WiRain className="text-blue-500" />;
        if (desc.includes('cloud')) return <WiCloudy className="text-gray-500" />;
        if (desc.includes('sun') || desc.includes('clear')) return <WiDaySunny className="text-yellow-500" />;
        if (desc.includes('snow')) return <WiSnow className="text-blue-300" />;
        if (desc.includes('thunder')) return <WiThunderstorm className="text-purple-500" />;
        return <WiDaySunny className="text-yellow-500" />;
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getConfidenceText = (confidence) => {
        if (confidence >= 0.8) return 'Cao';
        if (confidence >= 0.6) return 'Trung bình';
        return 'Thấp';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateForChart = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            month: 'short',
            day: 'numeric'
        });
    };

    const prepareChartData = (forecastData) => {
        if (!forecastData || !forecastData.forecast) return null;

        const labels = forecastData.forecast.map(day => formatDateForChart(day.date));
        const rentalData = forecastData.forecast.map(day => day.predictedRentals);
        const temperatureData = forecastData.forecast.map(day => day.weather?.temperature || 0);
        const confidenceData = forecastData.forecast.map(day => day.confidence * 100);

        return {
            labels,
            datasets: [
                {
                    label: 'Dự báo thuê xe',
                    data: rentalData,
                    borderColor: 'rgb(99, 102, 241)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(99, 102, 241)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'y'
                },
                {
                    label: 'Nhiệt độ (°C)',
                    data: temperatureData,
                    borderColor: 'rgb(239, 68, 68)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(239, 68, 68)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                },
                {
                    label: 'Độ tin cậy (%)',
                    data: confidenceData,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(34, 197, 94)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y2'
                }
            ]
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        weight: '600'
                    }
                }
            },
            title: {
                display: true,
                text: 'Xu hướng dự báo thuê xe 7 ngày',
                font: {
                    size: 18,
                    weight: 'bold'
                },
                color: '#374151'
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        if (label.includes('Dự báo thuê xe')) {
                            return `${label}: ${value} xe`;
                        } else if (label.includes('Nhiệt độ')) {
                            return `${label}: ${value}°C`;
                        } else if (label.includes('Độ tin cậy')) {
                            return `${label}: ${value.toFixed(1)}%`;
                        }
                        return `${label}: ${value}`;
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Ngày',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    color: '#6B7280'
                },
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#6B7280'
                }
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Dự báo thuê xe',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    color: '#6B7280'
                },
                grid: {
                    color: 'rgba(156, 163, 175, 0.1)'
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#6B7280'
                }
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Nhiệt độ (°C)',
                    font: {
                        size: 14,
                        weight: '600'
                    },
                    color: '#6B7280'
                },
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        weight: '500'
                    },
                    color: '#6B7280'
                }
            },
            y2: {
                type: 'linear',
                display: false,
                position: 'right',
                grid: {
                    drawOnChartArea: false,
                }
            }
        }
    };

    return (
        <AdminLayout>
            <div className="p-2">
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 transform hover:scale-105 transition-transform duration-300">
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center justify-center">
                                    <FaMotorcycle className="mr-4 text-indigo-600 text-4xl" />
                                    Dự Báo Thuê Xe Máy
                                </h1>
                                <p className="text-gray-600 text-xl font-medium">
                                    Dự báo nhu cầu thông minh dựa trên điều kiện thời tiết
                                </p>
                            </div>
                        </div>

                        {/* City Selection */}
                        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center">
                                    <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-full mr-4">
                                        <FaMapMarkerAlt className="text-white text-xl" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-800">Chọn Thành Phố</h2>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">
                                        Tổng cộng: <span className="font-semibold text-indigo-600">{cities.length} thành phố</span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-green-600">
                                            {cities.reduce((total, city) => total + city.branchCount, 0)} chi nhánh
                                        </span> hoạt động
                                    </p>
                                </div>
                            </div>
                            <select
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-500 focus:border-transparent text-lg font-medium transition-all duration-300 hover:border-indigo-300"
                            >
                                <option value="">Chọn thành phố để xem dự báo</option>
                                {cities.map((city) => (
                                    <option key={city.name} value={city.name}>
                                        {city.name}, {city.country} ({city.branchCount} chi nhánh)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Current Weather */}
                        {!selectedCity && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 text-center">
                                <div className="text-blue-600 mb-4">
                                    <FaMapMarkerAlt className="text-4xl mx-auto mb-4" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Chọn Thành Phố</h3>
                                <p className="text-gray-600">
                                    Vui lòng chọn một thành phố từ danh sách trên để xem dự báo thuê xe và thông tin thời tiết.
                                </p>
                            </div>
                        )}

                        {weather && selectedCity && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform hover:shadow-2xl transition-shadow duration-300">
                                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full mr-4">
                                        <WiDaySunny className="text-white text-xl" />
                                    </div>
                                    Thời tiết hiện tại tại {selectedCity}
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex items-center mb-3">
                                            <WiThermometer className="text-red-500 mr-3 text-2xl" />
                                            <span className="text-sm font-medium text-gray-600">Nhiệt độ</span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-600">{weather.current.temperature}°C</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex items-center mb-3">
                                            <WiHumidity className="text-blue-500 mr-3 text-2xl" />
                                            <span className="text-sm font-medium text-gray-600">Độ ẩm</span>
                                        </div>
                                        <p className="text-2xl font-bold text-blue-600">{weather.current.humidity}%</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex items-center mb-3">
                                            <WiStrongWind className="text-gray-500 mr-3 text-2xl" />
                                            <span className="text-sm font-medium text-gray-600">Tốc độ gió</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-600">{weather.current.windSpeed} m/s</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-shadow duration-300">
                                        <div className="flex items-center mb-3">
                                            <div className="mr-3 text-2xl">
                                                {getWeatherIcon(weather.current?.description)}
                                            </div>
                                            <span className="text-sm font-medium text-gray-600">Điều kiện</span>
                                        </div>
                                        <p className="text-lg font-bold text-green-600 capitalize">{weather.current?.description || 'Không xác định'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {loading && selectedCity && (
                            <div className="bg-white rounded-2xl shadow-xl p-12 text-center transform hover:shadow-2xl transition-shadow duration-300">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-6"></div>
                                <p className="text-gray-600 text-lg font-medium">Đang tạo dự báo thuê xe...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && selectedCity && (
                            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                                <p className="text-red-600 text-lg font-medium">{error}</p>
                                <button
                                    onClick={fetchForecast}
                                    className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 font-medium transition-all duration-300 transform hover:scale-105"
                                >
                                    Thử lại
                                </button>
                            </div>
                        )}

                        {/* Forecast Results */}
                        {forecast && forecast.forecast && !loading && selectedCity && (
                            <div className="space-y-8">
                                {/* Summary Card */}
                                <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-shadow duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full mr-4">
                                            <BsGraphUp className="text-white text-xl" />
                                        </div>
                                        Tóm tắt dự báo thuê xe 7 ngày
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-lg transition-shadow duration-300">
                                            <p className="text-sm text-gray-600 font-medium mb-2">Thuê xe trung bình/ngày</p>
                                            <p className="text-3xl font-bold text-green-600">
                                                {Math.round(forecast.forecast.reduce((sum, day) => sum + day.predictedRentals, 0) / 7)}
                                            </p>
                                        </div>
                                        <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
                                            <p className="text-sm text-gray-600 font-medium mb-2">Ngày cao điểm</p>
                                            <p className="text-xl font-bold text-blue-600">
                                                {formatDate(forecast.forecast.reduce((max, day) =>
                                                    day.predictedRentals > max.predictedRentals ? day : max
                                                ).date)}
                                            </p>
                                        </div>
                                        <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-300">
                                            {/* <p className="text-sm text-gray-600 font-medium mb-2">Độ tin cậy mô hình</p> */}
                                            {/* <p className="text-xl font-bold text-purple-600">
                                                {Math.round(forecast.forecast.reduce((sum, day) => sum + day.confidence, 0) / 7 * 100)}%
                                            </p> */}
                                        </div>
                                    </div>
                                </div>

                                {/* Line Chart */}
                                <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-shadow duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full mr-4">
                                            <FaChartLine className="text-white text-xl" />
                                        </div>
                                        Phân tích xu hướng dự báo
                                    </h2>
                                    <div className="h-96">
                                        {prepareChartData(forecast) && (
                                            <Line data={prepareChartData(forecast)} options={chartOptions} />
                                        )}
                                    </div>
                                </div>

                                {/* Daily Forecast */}
                                <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-shadow duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full mr-4">
                                            <BsCalendarDate className="text-white text-xl" />
                                        </div>
                                        Chi tiết dự báo hàng ngày
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {forecast.forecast.map((day, index) => (
                                            <div key={index} className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-indigo-300 transition-all duration-300 transform hover:scale-105">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-bold text-gray-800 text-lg">
                                                        {formatDate(day.date)}
                                                    </h3>
                                                    <div className="text-3xl">
                                                        {getWeatherIcon(day.weather?.description)}
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium">Dự báo thuê xe:</span>
                                                        <span className="font-bold text-indigo-600 text-lg">
                                                            {day.predictedRentals}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium">Nhiệt độ:</span>
                                                        <span className="font-bold text-red-600">{day.weather?.temperature || 'N/A'}°C</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium">Độ ẩm:</span>
                                                        <span className="font-bold text-blue-600">{day.weather?.humidity || 'N/A'}%</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 font-medium">Độ tin cậy:</span>
                                                        <span className={`font-bold ${getConfidenceColor(day.confidence)}`}>
                                                            {getConfidenceText(day.confidence)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Model Information */}
                                <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:shadow-2xl transition-shadow duration-300">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full mr-4">
                                            <FaChartLine className="text-white text-xl" />
                                        </div>
                                        Thông tin mô hình AI
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                                            <h3 className="font-bold text-gray-700 mb-4 text-lg">Chi tiết mô hình</h3>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                    Loại: {forecast.modelInfo.type}
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                    Tính năng đầu vào: {forecast.modelInfo.features}
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                    Độ dài chuỗi: {forecast.modelInfo.sequenceLength} ngày
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                                                    Chu kỳ dự báo: {forecast.modelInfo.forecastDays} ngày
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-200">
                                            <h3 className="font-bold text-gray-700 mb-4 text-lg">Tính năng sử dụng</h3>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    Nhiệt độ & Độ ẩm
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    Tốc độ gió & Tầm nhìn
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    Lượng mưa & Bức xạ mặt trời
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    Mô hình theo mùa
                                                </li>
                                                <li className="flex items-center">
                                                    <span className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></span>
                                                    Hiệu ứng ngày lễ
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default RentalForecast; 