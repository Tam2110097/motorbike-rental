import numpy as np
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import os
import matplotlib.pyplot as plt

# Load dữ liệu chuỗi
X = np.load('ml/data/X.npy')
y = np.load('ml/data/y.npy')

print(f"✅ Dữ liệu huấn luyện: X shape = {X.shape}, y shape = {y.shape}")
# X: (samples, 14, features)
# y: (samples, 7)

# Khởi tạo mô hình LSTM để dự đoán 7 ngày
model = Sequential()
model.add(LSTM(64, activation='relu', return_sequences=False, input_shape=(X.shape[1], X.shape[2])))
model.add(Dropout(0.2))  # giúp tránh overfitting
model.add(Dense(32, activation='relu'))
model.add(Dense(7))  # 7 đầu ra ứng với 7 ngày tiếp theo

model.compile(optimizer='adam', loss='mse')

# Cấu hình callbacks
model_dir = 'ml/model'
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'lstm_model_7days.h5')

early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
checkpoint = ModelCheckpoint(model_path, monitor='val_loss', save_best_only=True)

# Huấn luyện
history = model.fit(
    X, y,
    epochs=100,
    batch_size=32,
    validation_split=0.2,
    callbacks=[early_stop, checkpoint],
    verbose=1
)


# Vẽ biểu đồ loss
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss (MSE)')
plt.title('Training vs Validation Loss')
plt.legend()
plt.grid()
plt.show()
