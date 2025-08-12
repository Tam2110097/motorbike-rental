const express = require('express');
const router = express.Router();
const predictionService = require('../utils/predictionService');
const weatherAPI = require('../utils/weatherAPI');
const branchModel = require('../models/branchModels');
const { spawn } = require('child_process');
const path = require('path');

// GET /api/prediction/forecast?city=Hanoi
router.get('/forecast', async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City parameter is required'
            });
        }

        console.log(`🔮 Generating AI rental forecast for ${city}...`);

        const forecast = await predictionService.predictRentalsWithAI(city);

        console.log(`✅ AI forecast generated for ${city}:`, {
            modelType: forecast.modelInfo.type,
            algorithm: forecast.modelInfo.algorithm,
            features: forecast.modelInfo.features,
            weights: forecast.modelInfo.weights
        });

        res.json({
            success: true,
            data: forecast,
            message: `AI rental forecast generated for ${city}`,
            modelInfo: {
                type: 'AI Weighted Feature Model',
                algorithm: 'Weighted Feature Combination with Trend Analysis',
                features: forecast.modelInfo.features,
                weights: forecast.modelInfo.weights
            }
        });

    } catch (error) {
        console.error('❌ AI Forecast API error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate AI forecast',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// GET /api/prediction/weather?city=Hanoi
router.get('/weather', async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                success: false,
                message: 'City parameter is required'
            });
        }

        console.log(`🌤️ Fetching weather data for ${city}...`);

        const currentWeather = await weatherAPI.getCurrentWeather(city);
        const weatherForecast = await weatherAPI.getForecast(city, 7);

        res.json({
            success: true,
            data: {
                current: currentWeather,
                forecast: weatherForecast
            },
            message: `Weather data fetched for ${city}`
        });

    } catch (error) {
        console.error('❌ Weather API error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch weather data',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// GET /api/prediction/cities
router.get('/cities', async (req, res) => {
    try {
        // Lấy danh sách thành phố từ các chi nhánh trong database
        const branches = await branchModel.find({ isActive: true });

        // Tạo danh sách thành phố duy nhất từ các chi nhánh
        const citiesMap = new Map();

        branches.forEach(branch => {
            if (!citiesMap.has(branch.city)) {
                citiesMap.set(branch.city, {
                    name: branch.city,
                    country: 'Vietnam',
                    coordinates: getCityCoordinates(branch.city),
                    branchCount: 1
                });
            } else {
                citiesMap.get(branch.city).branchCount++;
            }
        });

        const cities = Array.from(citiesMap.values());

        // Sắp xếp theo số lượng chi nhánh (nhiều nhất trước)
        cities.sort((a, b) => b.branchCount - a.branchCount);

        res.json({
            success: true,
            data: cities,
            message: `Found ${cities.length} cities with active branches`
        });

    } catch (error) {
        console.error('❌ Error fetching cities from database:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cities from database',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Hàm helper để lấy tọa độ thành phố
const getCityCoordinates = (cityName) => {
    const coordinates = {
        // Tên tiếng Anh
        'Hanoi': { lat: 21.0285, lon: 105.8542 },
        'Ho Chi Minh': { lat: 10.8231, lon: 106.6297 },
        'Da Nang': { lat: 16.0544, lon: 108.2022 },
        'Hue': { lat: 16.4637, lon: 107.5909 },
        'Nha Trang': { lat: 12.2388, lon: 109.1967 },
        'Phu Quoc': { lat: 10.2277, lon: 103.9602 },
        'Sapa': { lat: 22.3364, lon: 103.8440 },
        'Mai Chau': { lat: 20.6576, lon: 105.0333 },
        'Can Tho': { lat: 10.0452, lon: 105.7469 },
        'Hai Phong': { lat: 20.8449, lon: 106.6881 },
        'Vung Tau': { lat: 10.3459, lon: 107.0843 },
        'Dalat': { lat: 11.9404, lon: 108.4583 },
        'Phan Thiet': { lat: 10.9333, lon: 108.1000 },
        'Quy Nhon': { lat: 13.7667, lon: 109.2333 },
        'Buon Ma Thuot': { lat: 12.6667, lon: 108.0500 },

        // Tên tiếng Việt
        'Hà Nội': { lat: 21.0285, lon: 105.8542 },
        'Hồ Chí Minh': { lat: 10.8231, lon: 106.6297 },
        'Đà Nẵng': { lat: 16.0544, lon: 108.2022 },
        'Huế': { lat: 16.4637, lon: 107.5909 },
        'Nha Trang': { lat: 12.2388, lon: 109.1967 },
        'Phú Quốc': { lat: 10.2277, lon: 103.9602 },
        'Sapa': { lat: 22.3364, lon: 103.8440 },
        'Mai Châu': { lat: 20.6576, lon: 105.0333 },
        'Cần Thơ': { lat: 10.0452, lon: 105.7469 },
        'Hải Phòng': { lat: 20.8449, lon: 106.6881 },
        'Vũng Tàu': { lat: 10.3459, lon: 107.0843 },
        'Đà Lạt': { lat: 11.9404, lon: 108.4583 },
        'Phan Thiết': { lat: 10.9333, lon: 108.1000 },
        'Quy Nhơn': { lat: 13.7667, lon: 109.2333 },
        'Buôn Ma Thuột': { lat: 12.6667, lon: 108.0500 }
    };

    return coordinates[cityName] || { lat: 0, lon: 0 };
};

// GET /api/prediction/model-info
router.get('/model-info', (req, res) => {
    res.json({
        success: true,
        data: {
            modelType: 'AI Weighted Feature Model',
            purpose: 'Motorbike rental demand forecasting using machine learning',
            algorithm: 'Weighted Feature Combination with Trend Analysis',
            features: [
                {
                    name: 'Temperature (°C)',
                    weight: 0.25,
                    description: 'Normalized temperature impact on rental demand'
                },
                {
                    name: 'Humidity (%)',
                    weight: 0.15,
                    description: 'Humidity level influence on customer comfort'
                },
                {
                    name: 'Wind Speed (m/s)',
                    weight: 0.10,
                    description: 'Wind conditions affecting riding experience'
                },
                {
                    name: 'Visibility (10m)',
                    weight: 0.12,
                    description: 'Visibility conditions for safe riding'
                },
                {
                    name: 'Rainfall (mm)',
                    weight: 0.20,
                    description: 'Rain impact on rental demand (highest weight)'
                },
                {
                    name: 'Season',
                    weight: 0.08,
                    description: 'Seasonal patterns in rental behavior'
                },
                {
                    name: 'Holiday',
                    weight: 0.05,
                    description: 'Holiday effect on rental demand'
                },
                {
                    name: 'Day of Week',
                    weight: 0.05,
                    description: 'Weekend vs weekday patterns'
                }
            ],
            featureEngineering: [
                'Temperature normalization (optimal: 20-30°C)',
                'Humidity normalization (optimal: 40-70%)',
                'Wind speed normalization (optimal: 0-5 m/s)',
                'Visibility normalization (optimal: >1000m)',
                'Rainfall normalization (optimal: 0mm)',
                'Seasonal feature extraction',
                'Holiday detection',
                'Day-of-week pattern recognition'
            ],
            predictionMethod: 'Weighted linear combination of normalized features',
            trendAnalysis: 'Weekend boost (20% increase), mid-week dip (10% decrease)',
            confidenceCalculation: 'Based on feature stability and weather consistency',
            forecastPeriod: '7 days',
            accuracy: 'High accuracy for weather-dependent demand patterns',
            lastUpdated: new Date().toISOString(),
            version: '2.0 - AI Enhanced'
        },
        message: 'AI model information retrieved successfully'
    });
});

module.exports = router; 