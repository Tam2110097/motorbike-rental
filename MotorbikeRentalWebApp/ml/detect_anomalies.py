import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from keras.models import Model
from keras.layers import Input, Dense
from keras import regularizers

# Bước 1: Load dữ liệu
df = pd.read_csv('ml/data/daily_processed.csv')
data = df.copy()

# Bước 2: Chỉ dùng các cột số để huấn luyện
numerical_features = data.drop(columns=['Date', 'Season', 'Holiday'])
scaler = MinMaxScaler()
scaled_data = scaler.fit_transform(numerical_features)

# Bước 3: Xây dựng mô hình AutoEncoder
input_dim = scaled_data.shape[1]
encoding_dim = 6

input_layer = Input(shape=(input_dim,))
encoded = Dense(encoding_dim, activation='relu',
                activity_regularizer=regularizers.l1(10e-5))(input_layer)
decoded = Dense(input_dim, activation='sigmoid')(encoded)
autoencoder = Model(inputs=input_layer, outputs=decoded)
autoencoder.compile(optimizer='adam', loss='mse')

# Bước 4: Huấn luyện mô hình
autoencoder.fit(scaled_data, scaled_data, epochs=100, batch_size=16, shuffle=True, verbose=0)

# Bước 5: Tính lỗi tái tạo (reconstruction error)
reconstructions = autoencoder.predict(scaled_data)
mse = np.mean(np.power(scaled_data - reconstructions, 2), axis=1)

# Bước 6: Xác định ngưỡng lỗi để xem điểm nào là bất thường
threshold = np.percentile(mse, 95)  # giữ lại 95% dữ liệu “bình thường”
outliers = mse > threshold

# Bước 7: Lọc bỏ các dòng bất thường
clean_df = data[~outliers]

# Bước 8: Lưu lại dữ liệu sạch
clean_df.to_csv('ml/data/cleaned_data.csv', index=False)
print(f"✅ Đã loại bỏ {outliers.sum()} dòng bất thường. Dữ liệu còn lại: {len(clean_df)} dòng.")
