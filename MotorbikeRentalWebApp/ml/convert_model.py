import tensorflow as tf
import numpy as np
import joblib
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

def convert_model_to_tfjs():
    """
    Convert the trained LSTM model to TensorFlow.js format
    """
    try:
        # Load the trained model
        model_path = 'ml/model/lstm_model_7days.h5'
        model = tf.keras.models.load_model(model_path)
        
        print(f"✅ Loaded model from {model_path}")
        print(f"Model summary:")
        model.summary()
        
        # Create output directory for TF.js model
        tfjs_output_dir = 'ml/model/tfjs_model'
        os.makedirs(tfjs_output_dir, exist_ok=True)
        
        # Convert to TensorFlow.js format
        tfjs.converters.save_keras_model(model, tfjs_output_dir)
        
        print(f"✅ Model converted and saved to {tfjs_output_dir}")
        
        # Test the converted model
        print("🧪 Testing converted model...")
        
        # Create a sample input (14 days, 13 features)
        sample_input = np.random.random((1, 14, 13))
        
        # Make prediction with original model
        original_prediction = model.predict(sample_input)
        print(f"Original model prediction shape: {original_prediction.shape}")
        print(f"Original model prediction: {original_prediction[0]}")
        
        # Load the converted model
        converted_model = tfjs.converters.load_keras_model(f"{tfjs_output_dir}/model.json")
        
        # Make prediction with converted model
        converted_prediction = converted_model.predict(sample_input)
        print(f"Converted model prediction shape: {converted_prediction.shape}")
        print(f"Converted model prediction: {converted_prediction[0]}")
        
        # Compare predictions
        prediction_diff = np.abs(original_prediction - converted_prediction)
        print(f"Prediction difference: {prediction_diff}")
        print(f"Max difference: {np.max(prediction_diff)}")
        
        if np.max(prediction_diff) < 1e-6:
            print("✅ Model conversion successful! Predictions match.")
        else:
            print("⚠️ Warning: Predictions don't match exactly.")
            
        return True
        
    except Exception as e:
        print(f"❌ Error converting model: {e}")
        return False

def create_model_info():
    """
    Create model information file for the Node.js application
    """
    model_info = {
        "modelType": "LSTM",
        "inputShape": [14, 13],  # 14 days, 13 features
        "outputShape": [7],      # 7 days forecast
        "features": [
            "Rented Bike Count",
            "Hour", 
            "Temperature(°C)",
            "Humidity(%)",
            "Wind speed (m/s)",
            "Visibility (10m)",
            "Dew point temperature(°C)",
            "Solar Radiation (MJ/m2)",
            "Rainfall(mm)",
            "Season_Spring",
            "Season_Summer", 
            "Season_Winter",
            "Holiday_Yes"
        ],
        "featureRanges": {
            "Rented Bike Count": [0, 1000],
            "Hour": [0, 23],
            "Temperature(°C)": [-20, 50],
            "Humidity(%)": [0, 100],
            "Wind speed (m/s)": [0, 20],
            "Visibility (10m)": [0, 2000],
            "Dew point temperature(°C)": [-30, 40],
            "Solar Radiation (MJ/m2)": [0, 10],
            "Rainfall(mm)": [0, 100]
        },
        "conversionDate": str(np.datetime64('now'))
    }
    
    # Save model info
    import json
    with open('ml/model/model_info.json', 'w') as f:
        json.dump(model_info, f, indent=2)
    
    print("✅ Model information saved to ml/model/model_info.json")
    return model_info

if __name__ == "__main__":
    print("🔄 Converting LSTM model to TensorFlow.js format...")
    
    # Fix NumPy compatibility issue
    try:
        # Patch numpy to fix the deprecated np.object issue
        import numpy as np
        if not hasattr(np, 'object'):
            np.object = object
    except:
        pass
    
    # Install tensorflowjs if not available
    try:
        import tensorflowjs as tfjs
    except ImportError:
        print("Installing tensorflowjs...")
        os.system("pip install tensorflowjs")
        import tensorflowjs as tfjs
    
    # Convert model
    success = convert_model_to_tfjs()
    
    if success:
        # Create model info
        create_model_info()
        print("\n🎉 Model conversion completed successfully!")
        print("You can now use the model in your Node.js application.")
    else:
        print("\n❌ Model conversion failed!")