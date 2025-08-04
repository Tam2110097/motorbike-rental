import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import joblib

# Cấu hình
# SEQUENCE_LENGTH = 7  # số ngày trước đó để dự đoán ngày tiếp theo
SEQUENCE_LENGTH = 14  # số ngày trước đó để dự đoán ngày tiếp theo
FORECAST_DAYS = 7
TARGET_COLUMN = 'Rented Bike Count'  # tên cột mục tiêu cần dự đoán

# Bước 1: Đọc dữ liệu đã làm sạch
df = pd.read_csv('ml/data/cleaned_data.csv')
df = df.sort_values('Date')  # đảm bảo theo thứ tự thời gian

# Bước 2: One-hot encoding các cột phân loại
df = pd.get_dummies(df, columns=['Season', 'Holiday'], drop_first=True)

# Bước 3: Lưu lại các cột đặc trưng đầu vào (loại bỏ Date)
features = df.drop(columns=['Date'])

# Bước 4: Chuẩn hóa dữ liệu đầu vào
scaler = MinMaxScaler()
scaled_features = scaler.fit_transform(features)

# Lưu scaler để dùng khi dự đoán
joblib.dump(scaler, 'ml/data/scaler.save')

# Bước 5: Tạo chuỗi (X, y)
# X, y = [], []
# for i in range(SEQUENCE_LENGTH, len(scaled_features)):
#     X.append(scaled_features[i-SEQUENCE_LENGTH:i])
#     y.append(scaled_features[i][features.columns.get_loc(TARGET_COLUMN)])

# X = np.array(X)
# y = np.array(y)

X, y = [], []

# Lặp qua dữ liệu và tạo (X, y)
for i in range(SEQUENCE_LENGTH, len(scaled_features) - FORECAST_DAYS + 1):
    X.append(scaled_features[i-SEQUENCE_LENGTH:i])
    
    # y là đoạn gồm 7 ngày tiếp theo, nhưng chỉ lấy cột target
    y.append([
        scaled_features[i + j][features.columns.get_loc(TARGET_COLUMN)]
        for j in range(FORECAST_DAYS)
    ])

X = np.array(X)  # shape: (samples, SEQUENCE_LENGTH, features)
y = np.array(y)  # shape: (samples, FORECAST_DAYS)


# Bước 6: Lưu dữ liệu chuỗi
np.save('ml/data/X.npy', X)
np.save('ml/data/y.npy', y)

# Kiểm tra shape và in thông tin
if len(X.shape) >= 3:
    print(f"✅ Đã tạo dữ liệu chuỗi: {X.shape[0]} mẫu, mỗi mẫu có {SEQUENCE_LENGTH} ngày, {X.shape[2]} đặc trưng.")
else:
    print(f"✅ Đã tạo dữ liệu chuỗi: {X.shape[0]} mẫu, mỗi mẫu có {SEQUENCE_LENGTH} ngày.")
    print(f"Shape của X: {X.shape}")
    print(f"Shape của y: {y.shape}")
