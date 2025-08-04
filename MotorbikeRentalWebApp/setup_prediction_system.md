# 🚀 Motorbike Rental Prediction System Setup Guide

This guide will help you integrate your trained LSTM model into your motorbike rental website for demand forecasting.

## 📋 Prerequisites

1. **OpenWeatherMap API Key**: Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
2. **Python Environment**: Your ML model training environment
3. **Node.js**: Your existing backend setup

## 🔧 Step 1: Environment Setup

### 1.1 Add Environment Variables
Add to your `.env` file:
```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### 1.2 Install Backend Dependencies
```bash
npm install @tensorflow/tfjs-node axios
```

### 1.3 Install Frontend Dependencies
```bash
cd client
npm install react-icons
```

## 🤖 Step 2: Convert Your ML Model

### 2.1 Install TensorFlow.js Converter
```bash
cd ml
pip install tensorflowjs
```

### 2.2 Convert Your Model
```bash
python convert_model.py
```

This will:
- Convert your `.h5` model to TensorFlow.js format
- Create `ml/model/tfjs_model/` directory with converted files
- Generate `ml/model/model_info.json` with model specifications

## 🚀 Step 3: Start the System

### 3.1 Start Backend
```bash
npm run server
```

### 3.2 Start Frontend
```bash
npm run client
```

### 3.3 Or Start Both Together
```bash
npm run dev
```

## 📊 Step 4: Test the System

### 4.1 Test API Endpoints
```bash
# Get available cities
curl http://localhost:8080/api/v1/prediction/cities

# Get weather data for Hanoi
curl http://localhost:8080/api/v1/prediction/weather?city=Hanoi

# Get rental forecast for Hanoi
curl http://localhost:8080/api/v1/prediction/forecast?city=Hanoi
```

### 4.2 Access Frontend
Navigate to your React app and add the RentalForecast component to your routes.

## 🎯 API Endpoints

### GET `/api/v1/prediction/cities`
Returns list of available cities for forecasting.

### GET `/api/v1/prediction/weather?city={city}`
Returns current weather and 7-day forecast for the specified city.

### GET `/api/v1/prediction/forecast?city={city}`
Returns 7-day motorbike rental forecast based on weather conditions.

### GET `/api/v1/prediction/model-info`
Returns information about the AI model.

## 🔍 How It Works

### 1. **Weather Data Integration**
- Fetches real-time weather from OpenWeatherMap API
- Processes temperature, humidity, wind speed, visibility, rainfall
- Calculates dew point and determines seasons/holidays

### 2. **ML Model Prediction**
- Uses your trained LSTM model (14-day sequence → 7-day forecast)
- Normalizes input data to match training format
- Generates rental demand predictions with confidence scores

### 3. **Frontend Display**
- Beautiful, responsive UI with weather icons
- Interactive city selection
- Detailed forecast breakdown
- Model information and confidence indicators

## 📈 Model Features

Your LSTM model uses these features:
- **Weather**: Temperature, Humidity, Wind Speed, Visibility, Rainfall
- **Environmental**: Solar Radiation, Dew Point Temperature
- **Temporal**: Season, Holiday Status
- **Historical**: Previous rental data patterns

## 🛠️ Customization Options

### Add More Cities
Edit `routes/prediction.js` in the `/cities` endpoint.

### Modify Weather Features
Update `utils/weatherAPI.js` to include additional weather parameters.

### Adjust Model Input
Modify `utils/predictionService.js` to change feature processing.

### Customize UI
Edit `client/src/components/RentalForecast.jsx` for styling changes.

## 🔧 Troubleshooting

### Model Loading Issues
1. Ensure TensorFlow.js model files exist in `ml/model/tfjs_model/`
2. Check model path in `utils/predictionService.js`
3. Verify model conversion was successful

### Weather API Errors
1. Check your OpenWeatherMap API key
2. Verify city names are correct
3. Check API rate limits

### Frontend Issues
1. Ensure all React dependencies are installed
2. Check API base URL in the component
3. Verify CORS settings

## 📊 Expected Output

The system will provide:
- **Current Weather**: Real-time conditions for selected city
- **7-Day Forecast**: Daily rental predictions with confidence
- **Weather Integration**: How weather affects demand
- **Model Insights**: AI model information and accuracy

## 🎉 Success Indicators

✅ Model loads without errors  
✅ Weather data fetches successfully  
✅ Predictions generate with reasonable values  
✅ Frontend displays all information correctly  
✅ API endpoints respond as expected  

## 🔄 Next Steps

1. **Integrate with Booking System**: Use predictions to adjust pricing
2. **Add Historical Data**: Improve accuracy with real rental history
3. **Real-time Updates**: Refresh forecasts periodically
4. **Mobile Optimization**: Ensure responsive design
5. **Analytics Dashboard**: Add detailed forecasting analytics

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all dependencies are installed
3. Ensure your ML model is properly converted
4. Test API endpoints individually

---

**Happy Forecasting! 🚀** 