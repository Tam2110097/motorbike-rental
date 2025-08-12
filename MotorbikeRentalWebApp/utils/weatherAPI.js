const axios = require('axios');

class WeatherAPI {
    constructor() {
        this.apiKey = process.env.OPENWEATHER_API_KEY;
        this.baseURL = 'https://api.openweathermap.org/data/2.5';
    }

    // Hàm mapping tên thành phố từ tiếng Việt sang tên API
    mapCityName(vietnameseName) {
        const cityMapping = {
            'Hà Nội': 'Hanoi, Vietnam',
            'Hồ Chí Minh': 'Ho Chi Minh City, Vietnam',
            'Đà Nẵng': 'Da Nang, Vietnam',
            'Huế': 'Hue, Vietnam',
            'Nha Trang': 'Nha Trang, Vietnam',
            'Phú Quốc': 'Phu Quoc, Vietnam',
            'Sapa': 'Sapa, Vietnam',
            'Mai Châu': 'Mai Chau, Vietnam',
            'Cần Thơ': 'Can Tho, Vietnam',
            'Hải Phòng': 'Hai Phong, Vietnam',
            'Vũng Tàu': 'Vung Tau, Vietnam',
            'Đà Lạt': 'Dalat, Vietnam',
            'Phan Thiết': 'Phan Thiet, Vietnam',
            'Quy Nhơn': 'Quy Nhon, Vietnam',
            'Buôn Ma Thuột': 'Buon Ma Thuot, Vietnam'
        };

        return cityMapping[vietnameseName] || `${vietnameseName}, Vietnam`;
    }

    async getCurrentWeather(city) {
        try {
            const mappedCity = this.mapCityName(city);
            console.log(`🌤️ Fetching weather for: ${city} -> ${mappedCity}`);

            const response = await axios.get(`${this.baseURL}/weather`, {
                params: {
                    q: mappedCity,
                    appid: this.apiKey,
                    units: 'metric'
                }
            });

            return {
                temperature: response.data.main.temp,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                visibility: response.data.visibility / 1000, // Convert to km
                description: response.data.weather[0].description,
                icon: response.data.weather[0].icon
            };
        } catch (error) {
            console.error(`❌ Error fetching current weather for ${city}:`, error.message);
            throw new Error(`Failed to fetch weather data for ${city}`);
        }
    }

    async getForecast(city, days = 7) {
        try {
            const mappedCity = this.mapCityName(city);
            console.log(`🌤️ Fetching forecast for: ${city} -> ${mappedCity}`);

            const response = await axios.get(`${this.baseURL}/forecast`, {
                params: {
                    q: mappedCity,
                    appid: this.apiKey,
                    units: 'metric',
                    cnt: days * 8 // 8 forecasts per day (every 3 hours)
                }
            });

            // Group by day and calculate daily averages
            const dailyForecasts = [];
            const dailyData = {};

            response.data.list.forEach(item => {
                const date = new Date(item.dt * 1000).toISOString().split('T')[0];

                if (!dailyData[date]) {
                    dailyData[date] = {
                        temperatures: [],
                        humidity: [],
                        windSpeed: [],
                        visibility: [],
                        rainfall: []
                    };
                }

                dailyData[date].temperatures.push(item.main.temp);
                dailyData[date].humidity.push(item.main.humidity);
                dailyData[date].windSpeed.push(item.wind.speed);
                dailyData[date].visibility.push(item.visibility / 1000);

                // Rainfall (if available)
                const rain = item.rain ? item.rain['3h'] || 0 : 0;
                dailyData[date].rainfall.push(rain);
            });

            // Calculate daily averages
            Object.keys(dailyData).forEach(date => {
                const data = dailyData[date];
                dailyForecasts.push({
                    date: date,
                    temperature: data.temperatures.reduce((a, b) => a + b, 0) / data.temperatures.length,
                    humidity: data.humidity.reduce((a, b) => a + b, 0) / data.humidity.length,
                    windSpeed: data.windSpeed.reduce((a, b) => a + b, 0) / data.windSpeed.length,
                    visibility: data.visibility.reduce((a, b) => a + b, 0) / data.visibility.length,
                    rainfall: data.rainfall.reduce((a, b) => a + b, 0)
                });
            });

            return dailyForecasts.slice(0, days);
        } catch (error) {
            console.error(`❌ Error fetching forecast for ${city}:`, error.message);
            throw new Error(`Failed to fetch forecast data for ${city}`);
        }
    }

    // Calculate dew point temperature
    calculateDewPoint(temperature, humidity) {
        const a = 17.27;
        const b = 237.7;
        const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
        return (b * alpha) / (a - alpha);
    }

    // Determine season based on date
    getSeason(date) {
        const month = new Date(date).getMonth() + 1;
        if (month >= 3 && month <= 5) return 'Spring';
        if (month >= 6 && month <= 8) return 'Summer';
        if (month >= 9 && month <= 11) return 'Autumn';
        return 'Winter';
    }

    // Check if it's a holiday (simplified - you can expand this)
    isHoliday(date) {
        const dayOfWeek = new Date(date).getDay();
        return dayOfWeek === 0 || dayOfWeek === 6; // Weekend
    }
}

module.exports = new WeatherAPI(); 