const express = require('express');
const router = express.Router();
const predictionService = require('../utils/predictionService');
const weatherAPI = require('../utils/weatherAPI');

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

        console.log(`🔮 Generating rental forecast for ${city}...`);

        const forecast = await predictionService.predictRentals(city);

        res.json({
            success: true,
            data: forecast,
            message: `Rental forecast generated for ${city}`
        });

    } catch (error) {
        console.error('❌ Forecast API error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate forecast',
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
router.get('/cities', (req, res) => {
    // Popular cities for motorbike rental
    const popularCities = [
        { name: 'Hanoi', country: 'Vietnam', coordinates: { lat: 21.0285, lon: 105.8542 } },
        { name: 'Ho Chi Minh City', country: 'Vietnam', coordinates: { lat: 10.8231, lon: 106.6297 } },
        { name: 'Da Nang', country: 'Vietnam', coordinates: { lat: 16.0544, lon: 108.2022 } },
        { name: 'Hue', country: 'Vietnam', coordinates: { lat: 16.4637, lon: 107.5909 } },
        { name: 'Nha Trang', country: 'Vietnam', coordinates: { lat: 12.2388, lon: 109.1967 } },
        { name: 'Phu Quoc', country: 'Vietnam', coordinates: { lat: 10.2277, lon: 103.9602 } },
        { name: 'Sapa', country: 'Vietnam', coordinates: { lat: 22.3364, lon: 103.8440 } },
        { name: 'Mai Chau', country: 'Vietnam', coordinates: { lat: 20.6576, lon: 105.0333 } }
    ];

    res.json({
        success: true,
        data: popularCities,
        message: 'Popular cities for motorbike rental'
    });
});

// GET /api/prediction/model-info
router.get('/model-info', (req, res) => {
    res.json({
        success: true,
        data: {
            modelType: 'LSTM (Long Short-Term Memory)',
            purpose: 'Motorbike rental demand forecasting',
            features: [
                'Temperature (°C)',
                'Humidity (%)',
                'Wind speed (m/s)',
                'Visibility (10m)',
                'Dew point temperature (°C)',
                'Solar Radiation (MJ/m²)',
                'Rainfall (mm)',
                'Season (Spring/Summer/Autumn/Winter)',
                'Holiday (Yes/No)',
                'Historical rental data'
            ],
            inputSequence: '14 days of historical data',
            outputForecast: '7 days of rental predictions',
            accuracy: 'High accuracy for weather-dependent demand patterns',
            lastUpdated: new Date().toISOString()
        },
        message: 'Model information retrieved successfully'
    });
});

module.exports = router; 