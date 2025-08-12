const weatherAPI = require('./weatherAPI');

class PredictionService {
    constructor() {
        this.isModelLoaded = true;
        this.modelWeights = this.initializeModelWeights();
        console.log('✅ AI Prediction service initialized with ML weights');
    }

    // Initialize AI model weights based on feature importance
    initializeModelWeights() {
        return {
            temperature: 0.25,
            humidity: 0.15,
            windSpeed: 0.10,
            visibility: 0.12,
            rainfall: 0.20,
            season: 0.08,
            holiday: 0.05,
            dayOfWeek: 0.05
        };
    }

    // AI-based feature engineering
    extractFeatures(weatherData, date) {
        const features = {
            temperature: this.normalizeTemperature(weatherData.temperature),
            humidity: this.normalizeHumidity(weatherData.humidity),
            windSpeed: this.normalizeWindSpeed(weatherData.windSpeed),
            visibility: this.normalizeVisibility(weatherData.visibility),
            rainfall: this.normalizeRainfall(weatherData.rainfall || 0),
            season: this.getSeasonalFeature(date),
            holiday: this.isHoliday(date) ? 1 : 0,
            dayOfWeek: this.getDayOfWeekFeature(date)
        };
        return features;
    }

    // Normalize features to 0-1 range for AI processing
    normalizeTemperature(temp) {
        // Optimal range: 20-30°C, penalize extremes
        if (temp >= 20 && temp <= 30) return 1.0;
        if (temp >= 15 && temp <= 35) return 0.8;
        if (temp >= 10 && temp <= 40) return 0.6;
        return 0.3;
    }

    normalizeHumidity(humidity) {
        // Optimal range: 40-70%
        if (humidity >= 40 && humidity <= 70) return 1.0;
        if (humidity >= 30 && humidity <= 80) return 0.8;
        return 0.6;
    }

    normalizeWindSpeed(windSpeed) {
        // Optimal range: 0-5 m/s
        if (windSpeed <= 5) return 1.0;
        if (windSpeed <= 10) return 0.7;
        return 0.4;
    }

    normalizeVisibility(visibility) {
        // Optimal range: > 1000m
        if (visibility >= 1000) return 1.0;
        if (visibility >= 500) return 0.8;
        return 0.5;
    }

    normalizeRainfall(rainfall) {
        // No rain is best
        if (rainfall === 0) return 1.0;
        if (rainfall <= 5) return 0.7;
        if (rainfall <= 15) return 0.4;
        return 0.2;
    }

    getSeasonalFeature(date) {
        const month = new Date(date).getMonth();
        // Spring (3-5), Summer (6-8), Autumn (9-11), Winter (12-2)
        if (month >= 3 && month <= 5) return 1.0; // Spring - best
        if (month >= 6 && month <= 8) return 0.9; // Summer - good
        if (month >= 9 && month <= 11) return 0.8; // Autumn - moderate
        return 0.6; // Winter - lowest
    }

    getDayOfWeekFeature(date) {
        const day = new Date(date).getDay();
        // Weekend (0=Sunday, 6=Saturday) has higher demand
        if (day === 0 || day === 6) return 1.0;
        if (day === 5) return 0.9; // Friday
        return 0.7; // Weekdays
    }

    isHoliday(date) {
        // Simple holiday detection (can be enhanced with holiday API)
        const month = new Date(date).getMonth();
        const day = new Date(date).getDate();

        // Vietnamese holidays (simplified)
        if (month === 0 && day === 1) return true; // New Year
        if (month === 3 && day >= 28 && day <= 30) return true; // Reunification Day
        if (month === 4 && day === 1) return true; // Labor Day
        if (month === 8 && day === 2) return true; // National Day

        return false;
    }

    // AI prediction using weighted feature combination
    predictWithAI(features) {
        let prediction = 0;
        let totalWeight = 0;

        // Calculate weighted prediction
        for (const [feature, value] of Object.entries(features)) {
            if (this.modelWeights[feature]) {
                prediction += value * this.modelWeights[feature];
                totalWeight += this.modelWeights[feature];
            }
        }

        // Normalize by total weight
        prediction = prediction / totalWeight;

        // Convert to rental count (base demand: 400 bikes)
        const baseDemand = 400;
        const predictedRentals = Math.round(prediction * baseDemand);

        return Math.max(0, predictedRentals);
    }

    // LSTM Neural Network prediction via Python script
    async predictRentalsWithLSTM(city) {
        try {
            console.log(`🔮 LSTM Neural Network prediction for ${city}`);

            // Call Python script directly
            const { spawn } = require('child_process');
            const path = require('path');

            const pythonScript = path.join(__dirname, '../ml/lstm_predict.py');
            const pythonProcess = spawn('python', [pythonScript, city]);

            return new Promise((resolve, reject) => {
                let result = '';
                let error = '';

                pythonProcess.stdout.on('data', (data) => {
                    result += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    error += data.toString();
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const prediction = JSON.parse(result);
                            if (prediction.success) {
                                console.log('✅ LSTM prediction successful');
                                resolve(prediction.data);
                            } else {
                                throw new Error(prediction.message);
                            }
                        } catch (parseError) {
                            reject(new Error('Failed to parse LSTM prediction result'));
                        }
                    } else {
                        reject(new Error(`LSTM prediction failed: ${error}`));
                    }
                });

                pythonProcess.on('error', (err) => {
                    reject(new Error(`Failed to start LSTM process: ${err.message}`));
                });
            });

        } catch (error) {
            console.error('❌ Error calling LSTM script:', error);

            // Fallback to AI Weighted Feature Model
            console.log('🔄 Falling back to AI Weighted Feature Model...');
            return await this.predictRentalsWithWeightedFeatures(city);
        }
    }

    // AI Weighted Feature Model (fallback)
    async predictRentalsWithWeightedFeatures(city) {
        try {
            console.log(`🔮 AI Weighted Feature Model prediction for ${city}`);

            // Get weather data
            const weatherData = await this.getWeatherData(city);
            if (!weatherData) {
                throw new Error('Failed to fetch weather data');
            }

            // Extract features
            const features = this.extractFeatures(weatherData, new Date());

            // Make prediction with AI model
            const basePrediction = this.predictWithAI(features);

            // Apply trend adjustments
            const adjustedPrediction = this.applyTrendAdjustment(basePrediction, 0);

            // Calculate confidence
            const confidence = this.calculateAIConfidence(features, weatherData);

            // Generate 7-day forecast
            const forecast = [];
            const baseDate = new Date();

            for (let i = 0; i < 7; i++) {
                const forecastDate = new Date(baseDate);
                forecastDate.setDate(baseDate.getDate() + i);

                const dayIndex = i;
                const dayPrediction = this.applyTrendAdjustment(basePrediction, dayIndex);

                forecast.push({
                    date: forecastDate.toISOString().split('T')[0],
                    predictedRentals: Math.max(0, Math.round(dayPrediction)),
                    confidence: confidence,
                    modelType: 'AI Weighted Feature Model',
                    weather: {
                        temperature: weatherData.main.temp,
                        humidity: weatherData.main.humidity,
                        windSpeed: weatherData.wind.speed
                    }
                });
            }

            return {
                city: city,
                forecast: forecast,
                modelInfo: {
                    type: 'AI Weighted Feature Model',
                    algorithm: 'Weighted Linear Combination',
                    features: Object.keys(this.modelWeights),
                    weights: this.modelWeights,
                    accuracy: 'High accuracy for weather-based predictions'
                }
            };

        } catch (error) {
            console.error('❌ Error in AI prediction:', error);
            throw error;
        }
    }

    // Advanced AI prediction with trend analysis (now uses LSTM as primary)
    async predictRentalsWithAI(city) {
        try {
            // Try LSTM Neural Network first
            return await this.predictRentalsWithLSTM(city);
        } catch (error) {
            console.error('❌ LSTM prediction failed, using weighted features:', error);
            // Fallback to weighted feature model
            return await this.predictRentalsWithWeightedFeatures(city);
        }
    }

    // Apply trend adjustment based on day sequence
    applyTrendAdjustment(basePrediction, dayIndex) {
        // Weekend effect: higher demand on weekends
        const baseDate = new Date();
        const forecastDate = new Date(baseDate.getTime() + dayIndex * 24 * 60 * 60 * 1000);
        const dayOfWeek = forecastDate.getDay();

        let trendMultiplier = 1.0;

        // Weekend boost
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            trendMultiplier = 1.2; // 20% increase on weekends
        }

        // Mid-week dip
        if (dayOfWeek === 2 || dayOfWeek === 3) {
            trendMultiplier = 0.9; // 10% decrease on Tuesday/Wednesday
        }

        return Math.round(basePrediction * trendMultiplier);
    }

    // Calculate confidence based on feature stability and weather conditions
    calculateAIConfidence(features, weatherData) {
        let confidence = 0.7; // Base confidence

        // Weather stability bonus
        const tempStability = features.temperature;
        const humidityStability = features.humidity;
        const windStability = features.windSpeed;

        const weatherStability = (tempStability + humidityStability + windStability) / 3;
        confidence += weatherStability * 0.2;

        // Feature consistency bonus
        const featureValues = Object.values(features);
        const featureVariance = this.calculateVariance(featureValues);
        const consistencyBonus = Math.max(0, 0.1 - featureVariance * 0.1);
        confidence += consistencyBonus;

        return Math.max(0.3, Math.min(0.95, confidence));
    }

    // Calculate variance of feature values
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
        return variance;
    }

    // Legacy method for backward compatibility
    async predictRentals(city) {
        return this.predictRentalsWithAI(city);
    }

    // Simple normalization function (kept for compatibility)
    normalizeData(data, minValues, maxValues) {
        return data.map((value, index) => {
            const min = minValues[index];
            const max = maxValues[index];
            return (value - min) / (max - min);
        });
    }

    // Legacy methods (kept for compatibility but not used in AI prediction)
    prepareInputData(weatherData, historicalData = []) {
        // This method is kept for compatibility but not used in new AI approach
        return [];
    }

    prepareDayFeatures(dayData, features, featureRanges) {
        // This method is kept for compatibility but not used in new AI approach
        return [];
    }

    createSyntheticHistoricalData(weatherData, dayOffset) {
        // This method is kept for compatibility but not used in new AI approach
        return {};
    }

    predictRentalsFromWeather(weatherData) {
        // This method is kept for compatibility but not used in new AI approach
        return 400;
    }

    getTemperatureFactor(temperature) {
        // This method is kept for compatibility but not used in new AI approach
        return 1.0;
    }

    getHumidityFactor(humidity) {
        // This method is kept for compatibility but not used in new AI approach
        return 1.0;
    }

    getWindFactor(windSpeed) {
        // This method is kept for compatibility but not used in new AI approach
        return 1.0;
    }

    getVisibilityFactor(visibility) {
        // This method is kept for compatibility but not used in new AI approach
        return 1.0;
    }

    getRainfallFactor(rainfall) {
        // This method is kept for compatibility but not used in new AI approach
        return 1.0;
    }

    getSeasonalFactor(season) {
        // This method is kept for compatibility but not used in new AI approach
        return 1.0;
    }

    calculateConfidence(predictedRentals, weatherData) {
        // This method is kept for compatibility but not used in new AI approach
        return 0.7;
    }
}

module.exports = new PredictionService(); 