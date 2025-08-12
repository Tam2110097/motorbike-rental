import tensorflow as tf
import numpy as np
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

def convert_model_to_tfjs_simple():
    """
    Convert the trained LSTM model to TensorFlow.js format (simplified version)
    """
    try:
        # Load the trained model
        model_path = 'model/lstm_model_7days.h5'
        print(f"🔄 Loading model from {model_path}...")
        
        model = tf.keras.models.load_model(model_path)
        print(f"✅ Model loaded successfully")
        print(f"Model summary:")
        model.summary()
        
        # Create output directory for TF.js model
        tfjs_output_dir = 'model/tfjs_model'
        os.makedirs(tfjs_output_dir, exist_ok=True)
        
        # Save model in SavedModel format first
        saved_model_dir = 'model/saved_model'
        os.makedirs(saved_model_dir, exist_ok=True)
        
        print(f"💾 Saving model in SavedModel format...")
        model.save(saved_model_dir, save_format='tf')
        
        # Convert to TensorFlow.js format using tfjs-converter
        try:
            import tensorflowjs as tfjs
            print(f"🔄 Converting to TensorFlow.js format...")
            tfjs.converters.convert_tf_saved_model(
                saved_model_dir, 
                tfjs_output_dir
            )
            print(f"✅ Model converted and saved to {tfjs_output_dir}")
            
        except ImportError:
            print("⚠️ tensorflowjs not installed. Installing...")
            os.system("pip install tensorflowjs")
            import tensorflowjs as tfjs
            
            print(f"🔄 Converting to TensorFlow.js format...")
            tfjs.converters.convert_tf_saved_model(
                saved_model_dir, 
                tfjs_output_dir
            )
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
        
        if np.all(prediction_diff < 1e-5):
            print("✅ Conversion successful! Predictions match.")
            return True
        else:
            print("⚠️ Conversion completed but predictions don't match exactly.")
            return False
            
    except Exception as error:
        print(f"❌ Error during conversion: {error}")
        return False

if __name__ == "__main__":
    print("🚀 Starting LSTM model conversion...")
    success = convert_model_to_tfjs_simple()
    
    if success:
        print("\n🎉 Model conversion completed successfully!")
        print("📁 Files created:")
        print("   - ml/model/tfjs_model/model.json")
        print("   - ml/model/tfjs_model/group*-shard*.bin")
        print("\n📋 Next steps:")
        print("   1. Update utils/predictionService.js to load the LSTM model")
        print("   2. Replace weighted feature model with LSTM predictions")
    else:
        print("\n❌ Model conversion failed!")
        print("📋 Fallback options:")
        print("   1. Continue using current AI Weighted Feature Model")
        print("   2. Try manual conversion with different TensorFlow version")
        print("   3. Use Python API endpoint for LSTM predictions")
