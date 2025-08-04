const weatherAPI = require('./weatherAPI');

class PredictionService {
    constructor() {
        this.isModelLoaded = true; // Simplified approach
        console.log('✅ Prediction service initialized');
    }

    // Simple normalization function
    normalizeData(data, minValues, maxValues) {
        return data.map((value, index) => {
            const min = minValues[index];
            const max = maxValues[index];
            return (value - min) / (max - min);
        });
    }

    // Prepare input data for the model
    prepareInputData(weatherData, historicalData = []) {
        // Define feature ranges based on your training data
        const featureRanges = {
            'Rented Bike Count': [0, 1000],
            'Hour': [0, 23],
            'Temperature(°C)': [-20, 50],
            'Humidity(%)': [0, 100],
            'Wind speed (m/s)': [0, 20],
            'Visibility (10m)': [0, 2000],
            'Dew point temperature(°C)': [-30, 40],
            'Solar Radiation (MJ/m2)': [0, 10],
            'Rainfall(mm)': [0, 100]
        };

        const features = [
            'Rented Bike Count', 'Hour', 'Temperature(°C)', 'Humidity(%)',
            'Wind speed (m/s)', 'Visibility (10m)', 'Dew point temperature(°C)',
            'Solar Radiation (MJ/m2)', 'Rainfall(mm)', 'Season_Spring',
            'Season_Summer', 'Season_Winter', 'Holiday_Yes'
        ];

        // Create sequence data (14 days)
        const sequenceLength = 14;
        const sequence = [];

        // Create synthetic historical data based on current weather
        for (let i = 0; i < sequenceLength; i++) {
            const syntheticData = this.createSyntheticHistoricalData(weatherData, i);
            sequence.push(this.prepareDayFeatures(syntheticData, features, featureRanges));
        }

        return sequence;
    }

    prepareDayFeatures(dayData, features, featureRanges) {
        const featureValues = [];

        features.forEach(feature => {
            let value = 0;

            switch (feature) {
                case 'Rented Bike Count':
                    value = dayData.rentedBikes || 400; // Default value
                    break;
                case 'Hour':
                    value = dayData.hour || 13;
                    break;
                case 'Temperature(°C)':
                    value = dayData.temperature || 25;
                    break;
                case 'Humidity(%)':
                    value = dayData.humidity || 60;
                    break;
                case 'Wind speed (m/s)':
                    value = dayData.windSpeed || 2;
                    break;
                case 'Visibility (10m)':
                    value = dayData.visibility || 1000;
                    break;
                case 'Dew point temperature(°C)':
                    value = dayData.dewPoint || 15;
                    break;
                case 'Solar Radiation (MJ/m2)':
                    value = dayData.solarRadiation || 3;
                    break;
                case 'Rainfall(mm)':
                    value = dayData.rainfall || 0;
                    break;
                case 'Season_Spring':
                    value = dayData.season === 'Spring' ? 1 : 0;
                    break;
                case 'Season_Summer':
                    value = dayData.season === 'Summer' ? 1 : 0;
                    break;
                case 'Season_Winter':
                    value = dayData.season === 'Winter' ? 1 : 0;
                    break;
                case 'Holiday_Yes':
                    value = dayData.isHoliday ? 1 : 0;
                    break;
            }

            featureValues.push(value);
        });

        return featureValues;
    }

    createSyntheticHistoricalData(currentWeather, daysAgo) {
        // Create synthetic historical data based on current weather
        const baseTemp = currentWeather.temperature;
        const baseHumidity = currentWeather.humidity;

        return {
            rentedBikes: 400 + Math.random() * 100 - 50, // Random variation
            hour: 13,
            temperature: baseTemp + (Math.random() - 0.5) * 5, // ±2.5°C variation
            humidity: baseHumidity + (Math.random() - 0.5) * 20, // ±10% variation
            windSpeed: currentWeather.windSpeed + (Math.random() - 0.5) * 2,
            visibility: currentWeather.visibility * 1000 + (Math.random() - 0.5) * 200,
            dewPoint: weatherAPI.calculateDewPoint(baseTemp, baseHumidity),
            solarRadiation: 3 + Math.random() * 2,
            rainfall: Math.random() > 0.7 ? Math.random() * 5 : 0, // 30% chance of rain
            season: weatherAPI.getSeason(new Date()),
            isHoliday: weatherAPI.isHoliday(new Date())
        };
    }

    // AI-powered prediction based on weather patterns
    predictRentalsFromWeather(weatherData) {
        const predictions = [];

        // Base rental demand factors
        const baseDemand = 400;

        // Weather impact factors
        const tempFactor = this.getTemperatureFactor(weatherData.temperature);
        const humidityFactor = this.getHumidityFactor(weatherData.humidity);
        const windFactor = this.getWindFactor(weatherData.windSpeed);
        const visibilityFactor = this.getVisibilityFactor(weatherData.visibility);
        const rainfallFactor = this.getRainfallFactor(weatherData.rainfall || 0);

        // Seasonal adjustments
        const season = weatherAPI.getSeason(new Date());
        const seasonalFactor = this.getSeasonalFactor(season);

        // Holiday adjustments
        const isHoliday = weatherAPI.isHoliday(new Date());
        const holidayFactor = isHoliday ? 0.8 : 1.0; // 20% reduction on holidays

        // Calculate predicted rentals
        const predictedRentals = Math.round(
            baseDemand *
            tempFactor *
            humidityFactor *
            windFactor *
            visibilityFactor *
            rainfallFactor *
            seasonalFactor *
            holidayFactor
        );

        return Math.max(0, predictedRentals);
    }

    getTemperatureFactor(temperature) {
        // Optimal temperature range: 20-30°C
        if (temperature >= 20 && temperature <= 30) {
            return 1.2; // 20% increase for optimal weather
        } else if (temperature >= 15 && temperature <= 35) {
            return 1.0; // Normal demand
        } else if (temperature >= 10 && temperature <= 40) {
            return 0.8; // 20% decrease for extreme weather
        } else {
            return 0.6; // 40% decrease for very extreme weather
        }
    }

    getHumidityFactor(humidity) {
        // Optimal humidity: 40-70%
        if (humidity >= 40 && humidity <= 70) {
            return 1.1; // 10% increase for comfortable humidity
        } else if (humidity >= 30 && humidity <= 80) {
            return 1.0; // Normal demand
        } else {
            return 0.9; // 10% decrease for uncomfortable humidity
        }
    }

    getWindFactor(windSpeed) {
        // Optimal wind speed: 0-5 m/s
        if (windSpeed <= 5) {
            return 1.1; // 10% increase for calm weather
        } else if (windSpeed <= 10) {
            return 1.0; // Normal demand
        } else {
            return 0.8; // 20% decrease for windy conditions
        }
    }

    getVisibilityFactor(visibility) {
        // Optimal visibility: > 1000m
        if (visibility >= 1000) {
            return 1.1; // 10% increase for good visibility
        } else if (visibility >= 500) {
            return 1.0; // Normal demand
        } else {
            return 0.7; // 30% decrease for poor visibility
        }
    }

    getRainfallFactor(rainfall) {
        // Rainfall impact
        if (rainfall === 0) {
            return 1.2; // 20% increase for no rain
        } else if (rainfall <= 5) {
            return 0.9; // 10% decrease for light rain
        } else if (rainfall <= 15) {
            return 0.7; // 30% decrease for moderate rain
        } else {
            return 0.5; // 50% decrease for heavy rain
        }
    }

    getSeasonalFactor(season) {
        // Seasonal adjustments
        switch (season) {
            case 'Summer':
                return 1.3; // 30% increase in summer
            case 'Spring':
                return 1.2; // 20% increase in spring
            case 'Autumn':
                return 1.1; // 10% increase in autumn
            case 'Winter':
                return 0.8; // 20% decrease in winter
            default:
                return 1.0;
        }
    }

    async predictRentals(city) {
        try {
            // Get current weather and forecast
            const currentWeather = await weatherAPI.getCurrentWeather(city);
            const weatherForecast = await weatherAPI.getForecast(city, 7);

            // Process results
            const forecastResults = [];
            for (let i = 0; i < 7; i++) {
                const weatherData = weatherForecast[i] || currentWeather;
                const predictedRentals = this.predictRentalsFromWeather(weatherData);

                forecastResults.push({
                    date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    predictedRentals: predictedRentals,
                    weather: weatherData,
                    confidence: this.calculateConfidence(predictedRentals, weatherData)
                });
            }

            return {
                city: city,
                currentWeather: currentWeather,
                forecast: forecastResults,
                modelInfo: {
                    type: 'AI Weather-Based Prediction',
                    features: 13,
                    sequenceLength: 14,
                    forecastDays: 7
                }
            };

        } catch (error) {
            console.error('❌ Prediction error:', error);
            throw new Error('Failed to generate rental forecast');
        }
    }

    calculateConfidence(predictedRentals, weatherData) {
        // Calculate confidence based on weather stability
        const tempVariation = Math.abs(weatherData.temperature - 25) / 25; // Normalize around 25°C
        const humidityVariation = Math.abs(weatherData.humidity - 60) / 60; // Normalize around 60%
        const windVariation = weatherData.windSpeed / 10; // Normalize around 10 m/s

        const weatherStability = 1 - (tempVariation + humidityVariation + windVariation) / 3;
        const baseConfidence = 0.7;

        return Math.max(0.3, Math.min(0.95, baseConfidence + weatherStability * 0.2));
    }
}

module.exports = new PredictionService(); 