# 🌤️ VÍ DỤ DỰ ĐOÁN TỪ DỮ LIỆU THỜI TIẾT HÔM NAY
## Weather Data Processing Example: From Today to 7-Day Forecast

---

## 🎯 DỮ LIỆU THỜI TIẾT HÔM NAY (DỮ LIỆU GIẢ)

### **Dữ liệu thời tiết hiện tại (2024-01-15):**

```python
# Current weather data - 2024-01-15 (Hôm nay)
current_weather = {
    'date': '2024-01-15',
    'temperature': 28.5,      # °C
    'humidity': 65,           # %
    'wind_speed': 3.2,        # m/s
    'visibility': 10.5,       # km
    'dew_point': 22.1,        # °C
    'solar_radiation': 4.2,   # MJ/m²
    'rainfall': 0,            # mm
    'season': 'Summer',       # Mùa hè
    'holiday': 'No Holiday',  # Không phải ngày lễ
    'hour': 14,               # 14:00 (2 giờ chiều)
    'day_of_week': 'Monday'   # Thứ 2
}
```

### **Bảng dữ liệu thời tiết hôm nay:**

| Thời gian | Nhiệt độ | Độ ẩm | Gió | Tầm nhìn | Điểm sương | Bức xạ | Mưa | Mùa | Lễ | Giờ | Thứ |
|-----------|----------|-------|-----|----------|------------|--------|-----|-----|----|-----|-----|
| 14:00 | 28.5°C | 65% | 3.2 m/s | 10.5 km | 22.1°C | 4.2 MJ/m² | 0 mm | Summer | No Holiday | 14 | Monday |

---

## 🔄 BƯỚC 1: CHUẨN BỊ DỮ LIỆU LỊCH SỬ (14 NGÀY TRƯỚC)

### **Dữ liệu lịch sử 14 ngày (2024-01-01 đến 2024-01-14):**

```python
# Historical data - 14 ngày trước hôm nay
historical_data = [
    # [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season, Holiday]
    [420, 14, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 'Summer', 'No Holiday'],    # 2024-01-01
    [435, 14, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 'Summer', 'No Holiday'],    # 2024-01-02
    [450, 14, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0, 'Summer', 'No Holiday'],   # 2024-01-03
    [465, 14, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0, 'Summer', 'No Holiday'],   # 2024-01-04
    [480, 14, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0, 'Summer', 'No Holiday'],   # 2024-01-05
    [520, 14, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0, 'Summer', 'No Holiday'],   # 2024-01-06
    [510, 14, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0, 'Summer', 'No Holiday'],   # 2024-01-07
    [445, 14, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0, 'Summer', 'No Holiday'],    # 2024-01-08
    [460, 14, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0, 'Summer', 'No Holiday'],   # 2024-01-09
    [475, 14, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0, 'Summer', 'No Holiday'],   # 2024-01-10
    [490, 14, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0, 'Summer', 'No Holiday'],   # 2024-01-11
    [505, 14, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0, 'Summer', 'No Holiday'],   # 2024-01-12
    [535, 14, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0, 'Summer', 'No Holiday'],   # 2024-01-13
    [525, 14, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0, 'Summer', 'No Holiday']    # 2024-01-14
]
```

---

## 🔄 BƯỚC 2: KẾT HỢP DỮ LIỆU HIỆN TẠI VÀO LỊCH SỬ

### **Dữ liệu sau khi thêm thời tiết hôm nay:**

```python
# Combined data - 15 ngày (14 lịch sử + 1 hiện tại)
combined_data = [
    # 14 ngày lịch sử
    [420, 14, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 'Summer', 'No Holiday'],    # 2024-01-01
    [435, 14, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 'Summer', 'No Holiday'],    # 2024-01-02
    [450, 14, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0, 'Summer', 'No Holiday'],   # 2024-01-03
    [465, 14, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0, 'Summer', 'No Holiday'],   # 2024-01-04
    [480, 14, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0, 'Summer', 'No Holiday'],   # 2024-01-05
    [520, 14, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0, 'Summer', 'No Holiday'],   # 2024-01-06
    [510, 14, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0, 'Summer', 'No Holiday'],   # 2024-01-07
    [445, 14, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0, 'Summer', 'No Holiday'],    # 2024-01-08
    [460, 14, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0, 'Summer', 'No Holiday'],   # 2024-01-09
    [475, 14, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0, 'Summer', 'No Holiday'],   # 2024-01-10
    [490, 14, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0, 'Summer', 'No Holiday'],   # 2024-01-11
    [505, 14, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0, 'Summer', 'No Holiday'],   # 2024-01-12
    [535, 14, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0, 'Summer', 'No Holiday'],   # 2024-01-13
    [525, 14, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0, 'Summer', 'No Holiday'],   # 2024-01-14
    # Hôm nay (chưa có số xe thuê)
    [0, 14, 28.5, 65, 3.2, 10.5, 22.1, 4.2, 0, 'Summer', 'No Holiday']      # 2024-01-15 (Hôm nay)
]
```

---

## 🔄 BƯỚC 3: MÃ HÓA DỮ LIỆU (ENCODING)

### **Tách riêng Numerical và Categorical:**

```python
# Numerical features (cần scale)
numerical_features = [
    [420, 14, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0],    # Ngày 1
    [435, 14, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0],    # Ngày 2
    [450, 14, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0],   # Ngày 3
    [465, 14, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0],   # Ngày 4
    [480, 14, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0],   # Ngày 5
    [520, 14, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0],   # Ngày 6
    [510, 14, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0],   # Ngày 7
    [445, 14, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0],    # Ngày 8
    [460, 14, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0],   # Ngày 9
    [475, 14, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0],   # Ngày 10
    [490, 14, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0],   # Ngày 11
    [505, 14, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0],   # Ngày 12
    [535, 14, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0],   # Ngày 13
    [525, 14, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0],   # Ngày 14
    [0, 14, 28.5, 65, 3.2, 10.5, 22.1, 4.2, 0]      # Ngày 15 (Hôm nay)
]

# Categorical features (cần encoding)
categorical_features = [
    ['Summer', 'No Holiday'],    # Ngày 1
    ['Summer', 'No Holiday'],    # Ngày 2
    ['Summer', 'No Holiday'],    # Ngày 3
    ['Summer', 'No Holiday'],    # Ngày 4
    ['Summer', 'No Holiday'],    # Ngày 5
    ['Summer', 'No Holiday'],    # Ngày 6
    ['Summer', 'No Holiday'],    # Ngày 7
    ['Summer', 'No Holiday'],    # Ngày 8
    ['Summer', 'No Holiday'],    # Ngày 9
    ['Summer', 'No Holiday'],    # Ngày 10
    ['Summer', 'No Holiday'],    # Ngày 11
    ['Summer', 'No Holiday'],    # Ngày 12
    ['Summer', 'No Holiday'],    # Ngày 13
    ['Summer', 'No Holiday'],    # Ngày 14
    ['Summer', 'No Holiday']     # Ngày 15 (Hôm nay)
]
```

One-Hot Encoding cho Categorical Features**

```python
# Seasons encoding
# Spring -> [1, 0, 0, 0] 
# Summer -> [0, 1, 0, 0]
# Autumn -> [0, 0, 1, 0]
# Winter -> [0, 0, 0, 1]
Spring → [1, 0, 0, 0] (số 1 ở vị trí đầu)
Summer → [0, 1, 0, 0] (số 1 ở vị trí thứ 2)
Autumn → [0, 0, 1, 0] (số 1 ở vị trí thứ 3)
Winter → [0, 0, 0, 1] (số 1 ở vị trí cuối)

# Holiday encoding
# No Holiday -> [1, 0]
# Holiday -> [0, 1]

No Holiday → [1, 0] (số 1 ở vị trí đầu)
Holiday → [0, 1] (số 1 ở vị trí thứ 2)

### **Sau One-Hot Encoding:**

```python
# Seasons encoding: Summer -> [0, 1, 0, 0]
# Holiday encoding: No Holiday -> [1, 0]

# Sau One-Hot Encoding:
encoded_categorical = [
    [0, 1, 0, 0, 1, 0],    # Ngày 1: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 2: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 3: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 4: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 5: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 6: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 7: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 8: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 9: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 10: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 11: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 12: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 13: Summer, No Holiday
    [0, 1, 0, 0, 1, 0],    # Ngày 14: Summer, No Holiday
    [0, 1, 0, 0, 1, 0]     # Ngày 15: Summer, No Holiday
]
```

### **Dữ liệu sau encoding:**

```python
# Encoded data - 15 ngày sau encoding
encoded_data = [
    # [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season_Spring, Season_Summer, Season_Autumn, Season_Winter, Holiday_No, Holiday_Yes]
    [420, 14, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-01
    [435, 14, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-02
    [450, 14, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-03
    [465, 14, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-04
    [480, 14, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-05
    [520, 14, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-06
    [510, 14, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-07
    [445, 14, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-08
    [460, 14, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-09
    [475, 14, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-10
    [490, 14, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-11
    [505, 14, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-12
    [535, 14, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-13
    [525, 14, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0, 0, 1, 0, 0, 1, 0],   # 2024-01-14
    [0, 14, 28.5, 65, 3.2, 10.5, 22.1, 4.2, 0, 0, 1, 0, 0, 1, 0]      # 2024-01-15 (Hôm nay)
]
```

---

## 🔄 BƯỚC 4: SCALING DỮ LIỆU

### **MinMaxScaler cho Numerical Features:**

```python
# MinMaxScaler formula: (x - min) / (max - min)

# Tính min/max từ dữ liệu lịch sử (14 ngày đầu):
min_values = [420, 14, 24.5, 52, 2.4, 9.5, 19.2, 3.2, 0]  # Min của mỗi feature
max_values = [535, 14, 31.5, 68, 3.4, 11.2, 25.9, 4.8, 0]  # Max của mỗi feature

# Scaling cho ngày hôm nay (2024-01-15):
# [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall]
original = [0, 14, 28.5, 65, 3.2, 10.5, 22.1, 4.2, 0]

# Tính scaled values:
scaled_values = [
    (0 - 420) / (535 - 420) = -3.65,      # Rented_Bikes (sẽ được thay thế)
    (14 - 14) / (14 - 14) = 0,            # Hour (cố định)
    (28.5 - 24.5) / (31.5 - 24.5) = 0.57, # Temperature
    (65 - 52) / (68 - 52) = 0.81,         # Humidity
    (3.2 - 2.4) / (3.4 - 2.4) = 0.80,     # Wind_Speed
    (10.5 - 9.5) / (11.2 - 9.5) = 0.59,   # Visibility
    (22.1 - 19.2) / (25.9 - 19.2) = 0.43, # Dew_Point
    (4.2 - 3.2) / (4.8 - 3.2) = 0.63,     # Solar_Radiation
    (0 - 0) / (0 - 0) = 0                 # Rainfall (cố định)
]
```

### **Dữ liệu sau scaling:**

```python
# Scaled data - 15 ngày sau scaling
scaled_data = [
    # 14 ngày lịch sử (đã được scale)
    [0.00, 0, 0.00, 1.00, 0.40, 0.00, 0.00, 0.00, 0],    # 2024-01-01
    [0.13, 0, 0.10, 0.81, 0.70, 0.18, 0.13, 0.19, 0],    # 2024-01-02
    [0.26, 0, 0.33, 0.59, 0.10, 0.41, 0.31, 0.38, 0],    # 2024-01-03
    [0.39, 0, 0.36, 0.50, 0.50, 0.59, 0.41, 0.56, 0],    # 2024-01-04
    [0.52, 0, 0.57, 0.38, 0.80, 0.76, 0.58, 0.69, 0],    # 2024-01-05
    [0.87, 0, 0.67, 0.19, 0.30, 0.88, 0.75, 0.88, 0],    # 2024-01-06
    [0.78, 0, 0.61, 0.31, 0.60, 0.71, 0.69, 0.75, 0],    # 2024-01-07
    [0.22, 0, 0.26, 0.75, 1.00, 0.24, 0.24, 0.25, 0],    # 2024-01-08
    [0.35, 0, 0.36, 0.56, 0.40, 0.35, 0.34, 0.44, 0],    # 2024-01-09
    [0.48, 0, 0.51, 0.44, 0.70, 0.53, 0.46, 0.50, 0],    # 2024-01-10
    [0.61, 0, 0.64, 0.25, 0.20, 0.65, 0.64, 0.63, 0],    # 2024-01-11
    [0.74, 0, 0.81, 0.13, 0.50, 0.82, 0.84, 0.81, 0],    # 2024-01-12
    [1.00, 0, 1.00, 0.00, 0.00, 1.00, 1.00, 1.00, 0],    # 2024-01-13
    [0.91, 0, 0.90, 0.06, 0.30, 0.88, 0.90, 0.88, 0],    # 2024-01-14
    # Hôm nay (đã scale)
    [-3.65, 0, 0.57, 0.81, 0.80, 0.59, 0.43, 0.63, 0]   # 2024-01-15 (Hôm nay)
]
```

---

## 🔄 BƯỚC 5: CHUẨN BỊ INPUT CHO LSTM

### **Input shape cho LSTM:**

```python
# Lấy 14 ngày cuối cùng (không bao gồm hôm nay) làm input
lstm_input_data = [
    [0.13, 0, 0.10, 0.81, 0.70, 0.18, 0.13, 0.19, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-02
    [0.26, 0, 0.33, 0.59, 0.10, 0.41, 0.31, 0.38, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-03
    [0.39, 0, 0.36, 0.50, 0.50, 0.59, 0.41, 0.56, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-04
    [0.52, 0, 0.57, 0.38, 0.80, 0.76, 0.58, 0.69, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-05
    [0.87, 0, 0.67, 0.19, 0.30, 0.88, 0.75, 0.88, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-06
    [0.78, 0, 0.61, 0.31, 0.60, 0.71, 0.69, 0.75, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-07
    [0.22, 0, 0.26, 0.75, 1.00, 0.24, 0.24, 0.25, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-08
    [0.35, 0, 0.36, 0.56, 0.40, 0.35, 0.34, 0.44, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-09
    [0.48, 0, 0.51, 0.44, 0.70, 0.53, 0.46, 0.50, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-10
    [0.61, 0, 0.64, 0.25, 0.20, 0.65, 0.64, 0.63, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-11
    [0.74, 0, 0.81, 0.13, 0.50, 0.82, 0.84, 0.81, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-12
    [1.00, 0, 1.00, 0.00, 0.00, 1.00, 1.00, 1.00, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-13
    [0.91, 0, 0.90, 0.06, 0.30, 0.88, 0.90, 0.88, 0, 0, 1, 0, 0, 1, 0],    # 2024-01-14
    [-3.65, 0, 0.57, 0.81, 0.80, 0.59, 0.43, 0.63, 0, 0, 1, 0, 0, 1, 0]   # 2024-01-15 (Hôm nay)
]

# Reshape thành (1, 14, 15) cho LSTM
lstm_input = np.array(lstm_input_data).reshape(1, 14, 15)

LSTM yêu cầu input format đặc biệt:
LSTM cần dữ liệu 3D: (batch_size, timesteps, features)
Không thể xử lý dữ liệu 2D thông thường

Bước 1: Dữ liệu gốc (2D)
lstm_input_data = [
    [0.13, 0, 0.10, 0.81, 0.70, 0.18, 0.13, 0.19, 0, 0, 1, 0, 0, 1, 0],    # Ngày 1
    [0.26, 0, 0.33, 0.59, 0.10, 0.41, 0.31, 0.38, 0, 0, 1, 0, 0, 1, 0],    # Ngày 2
    [0.39, 0, 0.36, 0.50, 0.50, 0.59, 0.41, 0.56, 0, 0, 1, 0, 0, 1, 0],    # Ngày 3
    # ... 11 ngày nữa ...
    [-3.65, 0, 0.57, 0.81, 0.80, 0.59, 0.43, 0.63, 0, 0, 1, 0, 0, 1, 0]   # Ngày 14
]

Shape: (14, 15) - 14 hàng, 15 cột

Bước 2: Reshape thành 3D
Shape: (1, 14, 15) - 1 batch, 14 timesteps, 15 features

Chiều 1: Batch Size = 1
# 1 = Chỉ có 1 mẫu dữ liệu
# Nếu có nhiều mẫu: (10, 14, 15) = 10 mẫu khác nhau

Chiều 2: Timesteps = 14
# 14 = 14 ngày lịch sử
# Mỗi ngày = 1 timestep
# LSTM sẽ học pattern từ 14 ngày này

Chiều 3: Features = 15
# 15 = 15 features cho mỗi ngày
# [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season_Spring, Season_Summer, Season_Autumn, Season_Winter, Holiday_No, Holiday_Yes]

Shape: (1, 14, 15)

Batch 1:
├── Timestep 1 (Ngày 1): [0.13, 0, 0.10, 0.81, 0.70, 0.18, 0.13, 0.19, 0, 0, 1, 0, 0, 1, 0]
├── Timestep 2 (Ngày 2): [0.26, 0, 0.33, 0.59, 0.10, 0.41, 0.31, 0.38, 0, 0, 1, 0, 0, 1, 0]
├── Timestep 3 (Ngày 3): [0.39, 0, 0.36, 0.50, 0.50, 0.59, 0.41, 0.56, 0, 0, 1, 0, 0, 1, 0]
├── ...
└── Timestep 14 (Ngày 14): [-3.65, 0, 0.57, 0.81, 0.80, 0.59, 0.43, 0.63, 0, 0, 1, 0, 0, 1, 0]

🧠 Tại sao LSTM cần format này?
1. Sequential Learning
# LSTM học theo thứ tự thời gian:
# Ngày 1 → Ngày 2 → Ngày 3 → ... → Ngày 14
# Mỗi timestep = 1 ngày
2. Memory Mechanism
# LSTM nhớ thông tin từ các ngày trước:
# Ngày 14 có thể ảnh hưởng bởi Ngày 1, 2, 3, ..., 13
3. Feature Processing
# Mỗi timestep có 15 features:
# - 9 numerical features (đã scale)
# - 6 categorical features (đã encode)

```

---

## 🔄 BƯỚC 6: LSTM PREDICTION

### **LSTM Model Processing:**

```python
# LSTM Model Architecture:
# Input: (1, 14, 15) -> LSTM(50) -> Dropout(0.2) -> LSTM(30) -> Dropout(0.2) -> Dense(1)

# Forward pass qua LSTM:
# Layer 1: LSTM(50 neurons)
lstm1_output = lstm_layer1(lstm_input)  # Shape: (1, 14, 50)

# Layer 2: LSTM(30 neurons)
lstm2_output = lstm_layer2(lstm1_output)  # Shape: (1, 30)

# Dropout layers
dropout1_output = dropout_layer1(lstm2_output)  # Shape: (1, 30)
dropout2_output = dropout_layer2(dropout1_output)  # Shape: (1, 30)

# Dense layer
dense_output = dense_layer(dropout2_output)  # Shape: (1, 1)

# Predicted value (scaled)
predicted_scaled = 0.73  # Giá trị dự đoán đã scale (0-1)
```

### **Inverse Scaling:**

```python
# Inverse MinMaxScaler: original = scaled * (max - min) + min
# Rented_Bikes: min=420, max=535

predicted_original = predicted_scaled * (535 - 420) + 420
predicted_original = 0.73 * 115 + 420
predicted_original = 83.95 + 420
predicted_original = 503.95 ≈ 504 bikes
```

---

## 🔄 BƯỚC 7: GENERATE 7-DAY FORECAST

### **Base Prediction và Day Variations:**

```python
# Base prediction cho hôm nay
base_prediction = 504 bikes

# Day variation factors (dựa trên pattern lịch sử)
day_variations = {
    'Monday': 1.05,    # Thứ 2: tăng 5%
    'Tuesday': 1.02,   # Thứ 3: tăng 2%
    'Wednesday': 1.00, # Thứ 4: giữ nguyên
    'Thursday': 0.98,  # Thứ 5: giảm 2%
    'Friday': 1.03,    # Thứ 6: tăng 3%
    'Saturday': 1.08,  # Thứ 7: tăng 8%
    'Sunday': 1.06     # Chủ nhật: tăng 6%
}

# Weather adjustment factors
weather_adjustments = {
    'temperature': 1.02,  # Nhiệt độ cao -> tăng 2%
    'humidity': 0.98,     # Độ ẩm cao -> giảm 2%
    'wind': 0.99,         # Gió mạnh -> giảm 1%
    'visibility': 1.01    # Tầm nhìn tốt -> tăng 1%
}
```

### **7-Day Forecast Generation:**

```python
# Generate forecast cho 7 ngày tiếp theo
forecast_days = [
    '2024-01-16', '2024-01-17', '2024-01-18', '2024-01-19',
    '2024-01-20', '2024-01-21', '2024-01-22'
]

forecast_results = []

for i, date in enumerate(forecast_days):
    # Tính day variation
    day_of_week = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'][i]
    day_factor = day_variations[day_of_week]
    
    # Tính weather adjustment (giả sử thời tiết tương tự)
    weather_factor = weather_adjustments['temperature'] * weather_adjustments['humidity'] * weather_adjustments['wind'] * weather_adjustments['visibility']
    weather_factor = 1.02 * 0.98 * 0.99 * 1.01 = 1.00
    
    # Tính prediction cho ngày này
    day_prediction = base_prediction * day_factor * weather_factor
    
    # Thêm noise (±5%)
    noise = np.random.uniform(0.95, 1.05)
    final_prediction = int(day_prediction * noise)
    
    forecast_results.append({
        'date': date,
        'day_of_week': day_of_week,
        'predicted_bikes': final_prediction,
        'confidence': 0.85  # Độ tin cậy
    })
```

---

## 📊 KẾT QUẢ DỰ ĐOÁN 7 NGÀY

### **Forecast Results:**

```python
# 7-day forecast results
forecast_output = [
    {
        'date': '2024-01-16',
        'day_of_week': 'Tuesday',
        'predicted_bikes': 514,
        'confidence': 0.85,
        'weather': 'Similar to today'
    },
    {
        'date': '2024-01-17',
        'day_of_week': 'Wednesday',
        'predicted_bikes': 504,
        'confidence': 0.85,
        'weather': 'Similar to today'
    },
    {
        'date': '2024-01-18',
        'day_of_week': 'Thursday',
        'predicted_bikes': 494,
        'confidence': 0.85,
        'weather': 'Similar to today'
    },
    {
        'date': '2024-01-19',
        'day_of_week': 'Friday',
        'predicted_bikes': 519,
        'confidence': 0.85,
        'weather': 'Similar to today'
    },
    {
        'date': '2024-01-20',
        'day_of_week': 'Saturday',
        'predicted_bikes': 544,
        'confidence': 0.85,
        'weather': 'Similar to today'
    },
    {
        'date': '2024-01-21',
        'day_of_week': 'Sunday',
        'predicted_bikes': 534,
        'confidence': 0.85,
        'weather': 'Similar to today'
    },
    {
        'date': '2024-01-22',
        'day_of_week': 'Monday',
        'predicted_bikes': 529,
        'confidence': 0.85,
        'weather': 'Similar to today'
    }
]
```

### **Bảng tóm tắt dự đoán:**

| Ngày | Thứ | Dự đoán xe | Độ tin cậy | Ghi chú |
|------|-----|------------|------------|---------|
| 2024-01-16 | Thứ 3 | 514 xe | 85% | Tăng nhẹ so với hôm nay |
| 2024-01-17 | Thứ 4 | 504 xe | 85% | Tương đương hôm nay |
| 2024-01-18 | Thứ 5 | 494 xe | 85% | Giảm nhẹ |
| 2024-01-19 | Thứ 6 | 519 xe | 85% | Tăng do cuối tuần |
| 2024-01-20 | Thứ 7 | 544 xe | 85% | Cao nhất trong tuần |
| 2024-01-21 | Chủ nhật | 534 xe | 85% | Cao do cuối tuần |
| 2024-01-22 | Thứ 2 | 529 xe | 85% | Tăng do đầu tuần |

---

## 🎯 TÓM TẮT QUÁ TRÌNH

### **Từ dữ liệu thời tiết hôm nay đến dự đoán 7 ngày:**

1. **Thu thập dữ liệu:** Thời tiết hôm nay (28.5°C, 65% độ ẩm, etc.)
2. **Kết hợp lịch sử:** Thêm vào 14 ngày dữ liệu lịch sử
3. **Mã hóa:** One-Hot Encoding cho Season và Holiday
4. **Scaling:** MinMaxScaler cho numerical features
5. **LSTM Input:** Chuẩn bị (1, 14, 15) cho model
6. **Prediction:** LSTM dự đoán base prediction (504 xe)
7. **Forecast:** Áp dụng day variations và weather adjustments
8. **Output:** 7 ngày dự đoán với độ tin cậy 85%

**Kết quả:** Dự đoán từ 494-544 xe trong 7 ngày tới, với pattern tăng vào cuối tuần và giảm vào giữa tuần.

Tôi sẽ giải thích bằng lời và minh họa chi tiết phần LSTM Prediction và 7-Day Forecast Generation:
🧠 GIẢI THÍCH LSTM PREDICTION
🎯 Kiến trúc LSTM Model
Cấu trúc mạng neural:
Input: 15 features từ 14 ngày lịch sử
LSTM Layer 1: 50 neurons (học patterns phức tạp)
Dropout 1: Loại bỏ 20% connections (tránh overfitting)
LSTM Layer 2: 30 neurons (tinh chỉnh patterns)
Dropout 2: Loại bỏ 20% connections
Dense Layer: 1 neuron (cho ra kết quả cuối cùng)
🎯 4. DROPOUT là gì?
Dropout là gì?
Định nghĩa: Kỹ thuật "tắt" ngẫu nhiên một số neurons
Mục đích: Ngăn chặn overfitting
Cách hoạt động: Mỗi lần training, tắt 20% neurons
Ví dụ minh họa:
Tại sao Dropout hiệu quả?
Buộc model: Không phụ thuộc vào 1 số neurons cụ thể
Tăng tính robust: Model học patterns tổng quát hơn
Giảm overfitting: Không thể "thuộc lòng" dữ liệu
LSTM Layer có 50 neurons:
- Lần training 1: Tắt neurons 1, 5, 12, 23, 45 (10 neurons = 20%)
- Lần training 2: Tắt neurons 3, 8, 15, 28, 41 (10 neurons khác)
- Lần training 3: Tắt neurons 2, 7, 19, 31, 44 (10 neurons khác)
🎯 TÓM TẮT
50 Neurons: 50 đơn vị xử lý song song, học 50 patterns khác nhau
20% Connections: Loại bỏ 20% kết nối để tránh overfitting
Overfitting: Model học "thuộc lòng" thay vì hiểu patterns thực sự
Dropout: Kỹ thuật ngăn chặn overfitting bằng cách tắt ngẫu nhiên neurons
Layers: Các tầng xử lý khác nhau, từ cơ bản đến phức tạp
Features: Thông tin đầu vào (nhiệt độ, độ ẩm, etc.)
Mục tiêu cuối cùng: Tạo ra model có thể học patterns thực sự và dự đoán chính xác cho dữ liệu mới.
================================
�� Quá trình xử lý từng layer
Layer 1 - LSTM(50):
Input: 14 ngày × 15 features = 210 giá trị
Xử lý: Học patterns phức tạp từ dữ liệu lịch sử
Output: 14 ngày × 50 features = 700 giá trị
Ý nghĩa: Mỗi ngày được biểu diễn bằng 50 đặc trưng phức tạp
50 features này được tạo qua các lần học
�� MINH HỌA QUÁ TRÌNH HỌC PATTERNS CÓ Ý NGHĨA
# Tất cả patterns: Ngẫu nhiên
# Dự đoán: Sai nhiều
# Loss: Cao
ví dụ nhiệt độ cao --> dự đoán 420 xe --> xe tăng
           thực tế --> 300 xe --> xe giảm sai
# Pattern 1: Bắt đầu học "nhiệt độ quan trọng"
# Pattern 2: Bắt đầu học "độ ẩm quan trọng"
# Dự đoán: Bớt sai
# Loss: Giảm
# Pattern 1: "Nhiệt độ cao → tăng xe" (rõ ràng)
# Pattern 2: "Độ ẩm cao → giảm xe" (rõ ràng)
# Pattern 3: "Tương tác nhiệt độ + độ ẩm" (rõ ràng)
# Dự đoán: Chính xác
# Loss: Thấp
🎯 CÁCH ĐÁNH GIÁ PATTERN CÓ Ý NGHĨA HAY KHÔNG
1. ĐÁNH GIÁ QUA LOSS FUNCTION
# Pattern 1: 0.8 × Temperature + 0.1 × Humidity
# Khi sử dụng pattern này:
# Loss = 10 (dự đoán gần thực tế)
# → Pattern có ý nghĩa vì giúp dự đoán đúng
iiiiii
# Pattern 2: 0.1 × Temperature + 0.9 × Rainfall + 0.2 × (Hour × Dew_Point)
# Khi sử dụng pattern này:
# Loss = 1000 (dự đoán sai nhiều)
# → Pattern không có ý nghĩa vì không giúp dự đoán
2. ĐÁNH GIÁ QUA CORRELATION (TƯƠNG QUAN)
# Pattern: Temperature vs Bike_Count
# Correlation = 0.8 (tương quan cao)
# → Nhiệt độ có ảnh hưởng mạnh đến số xe thuê
# → Pattern có ý nghĩa
# Pattern: Rainfall vs Bike_Count  
# Correlation = 0.1 (tương quan thấp)
# → Mưa ít ảnh hưởng đến số xe thuê
# → Pattern ít ý nghĩa
Layer 2 - LSTM(30):
Input: 14 ngày × 50 features từ layer 1
Xử lý: Tinh chỉnh và tổng hợp patterns
Output: 30 features cuối cùng
Ý nghĩa: Tóm tắt toàn bộ thông tin 14 ngày thành 30 đặc trưng quan trọng
“Có phải Layer 1 đã tinh chỉnh 1 lần để lấy 50 pattern có ý nghĩa rồi không?”:
Layer 1 học ra 50 đặc trưng (vì hidden_size=50) — đây không phải “chọn lọc” từ tập lớn hơn, mà là 50 kênh biểu diễn do bạn cấu hình.
Không phải tất cả 50 đều “hoàn hảo”; trong quá trình huấn luyện end-to-end, nhiều unit trở nên hữu ích, vài unit có thể dư thừa/ồn.
Layer 2 đóng vai trò “bottleneck” (từ 50 xuống 30), tiếp tục lọc/ghép các đặc trưng Layer 1 thành 30 đặc trưng gọn hơn, có tính khái quát cao hơn.
=====================
Dropout Layers: tránh học thuộc lòng
Mục đích: Ngăn chặn overfitting 
Cách hoạt động: Tạm thời "tắt" 20% connections
Kết quả: Model học robust hơn, không phụ thuộc quá nhiều vào một số features
# Model học "thuộc lòng" dữ liệu training
# Neuron 1: "Tôi nhớ chính xác ngày 1 có 420 xe"
# Neuron 2: "Tôi nhớ chính xác ngày 2 có 435 xe"
# Neuron 3: "Tôi nhớ chính xác ngày 3 có 450 xe"
# ...

# Kết quả: Rất tốt trên dữ liệu cũ, rất tệ trên dữ liệu mới
# Epoch 1: Neuron 1 bị tắt
# Model: "Tôi phải học pattern mà không có Neuron 1"
# → Tìm pattern khác để dự đoán

# Epoch 2: Neuron 2 bị tắt  
# Model: "Tôi phải học pattern mà không có Neuron 2"
# → Tìm pattern khác để dự đoán

# Epoch 3: Neuron 3 bị tắt
# Model: "Tôi phải học pattern mà không có Neuron 3"
# → Tìm pattern khác để dự đoán

# Kết quả: Model học patterns tổng quát, không phụ thuộc vào 1 neuron cụ thể
Dense Layer:
Input: 30 features từ LSTM
Xử lý: Tính toán trọng số và bias
# Input từ LSTM (30 features):
lstm_features = [0.8, 0.6, 0.9, 0.3, 0.7, 0.5, 0.4, 0.8, 0.2, 0.6, 0.9, 0.1, 0.5, 0.7, 0.3, 0.8, 0.4, 0.6, 0.2, 0.9, 0.5, 0.7, 0.1, 0.8, 0.3, 0.6, 0.4, 0.9, 0.2, 0.5]

# Weights (được học trong quá trình training):
weights = [0.1, 0.2, 0.15, 0.05, 0.12, 0.08, 0.06, 0.18, 0.03, 0.11, 0.16, 0.02, 0.09, 0.14, 0.04, 0.17, 0.07, 0.13, 0.01, 0.19, 0.1, 0.15, 0.02, 0.18, 0.05, 0.12, 0.08, 0.2, 0.03, 0.11]

# Bias:
bias = 0.05

# Tính output:
output = 0.1*0.8 + 0.2*0.6 + 0.15*0.9 + 0.05*0.3 + 0.12*0.7 + 0.08*0.5 + 0.06*0.4 + 0.18*0.8 + 0.03*0.2 + 0.11*0.6 + 0.16*0.9 + 0.02*0.1 + 0.09*0.5 + 0.14*0.7 + 0.04*0.3 + 0.17*0.8 + 0.07*0.4 + 0.13*0.6 + 0.01*0.2 + 0.19*0.9 + 0.1*0.5 + 0.15*0.7 + 0.02*0.1 + 0.18*0.8 + 0.05*0.3 + 0.12*0.6 + 0.08*0.4 + 0.2*0.9 + 0.03*0.2 + 0.11*0.5 + 0.05

# Weight cao = Feature quan trọng
weights = [0.1, 0.2, 0.15, 0.05, 0.12, 0.08, 0.06, 0.18, 0.03, 0.11, 0.16, 0.02, 0.09, 0.14, 0.04, 0.17, 0.07, 0.13, 0.01, 0.19, 0.1, 0.15, 0.02, 0.18, 0.05, 0.12, 0.08, 0.2, 0.03, 0.11]

# Phân tích:
# Weight cao nhất: 0.2 (feature 28) → Feature quan trọng nhất
# Weight thấp nhất: 0.01 (feature 19) → Feature ít quan trọng
# Weight trung bình: 0.1-0.15 → Features quan trọng vừa phải

# Bias = 0.05
# Ý nghĩa: Ngay cả khi tất cả features = 0, output vẫn = 0.05
# → Điều chỉnh baseline của dự đoán

# Kết quả:
output = 0.73  # Giá trị dự đoán đã scale (0-1)
Output: 1 giá trị (số xe dự đoán đã scale)
📊 Kết quả dự đoán
Giá trị dự đoán: 0.73 (đã scale từ 0-1)
Ý nghĩa: Model dự đoán mức độ thuê xe ở mức 73% so với range lịch sử
🔄 Inverse Scaling
Công thức: Giá trị gốc = Giá trị scale × (Max - Min) + Min
Giá trị scale: 0.73
Range lịch sử: 420-535 xe
Tính toán: 0.73 × (535-420) + 420 = 0.73 × 115 + 420 = 504 xe
Kết quả: Dự đoán 504 xe cho ngày hôm nay
�� GIẢI THÍCH 7-DAY FORECAST GENERATION
🎯 Nguyên lý dự đoán
Từ 1 ngày → 7 ngày:
Base prediction: 504 xe (từ LSTM)
Áp dụng patterns: Theo ngày trong tuần
Điều chỉnh thời tiết: Theo điều kiện hiện tại
Thêm randomness: Mô phỏng thực tế
📊 Day Variation Factors
Patterns theo ngày trong tuần:
Thứ 2: +5% (đầu tuần, người đi làm)
Thứ 3: +2% (ổn định)
Thứ 4: 0% (giữ nguyên)
Thứ 5: -2% (cuối tuần làm việc)
Thứ 6: +3% (cuối tuần, người đi chơi)
Thứ 7: +8% (cuối tuần, cao nhất)
Chủ nhật: +6% (cuối tuần, nhưng ít hơn thứ 7)
🌤️ Weather Adjustment Factors
Ảnh hưởng thời tiết:
Nhiệt độ cao: +2% (thời tiết đẹp, nhiều người thuê)
Độ ẩm cao: -2% (khó chịu, ít người thuê)
Gió mạnh: -1% (khó đi xe)
Tầm nhìn tốt: +1% (an toàn hơn)
🔄 Quá trình tính toán cho từng ngày
Ví dụ cho ngày đầu tiên (Thứ 3):
Base prediction: 504 xe
Day factor: 1.02 (+2% cho thứ 3)
Weather factor: 1.00 (thời tiết tương tự)
Tính toán: 504 × 1.02 × 1.00 = 514 xe
Thêm noise: ±5% randomness
Kết quả: 514 xe
�� Kết quả 7 ngày
Pattern dự đoán:
Thứ 3: 514 xe (tăng nhẹ)
Thứ 4: 504 xe (giữ nguyên)
Thứ 5: 494 xe (giảm nhẹ)
Thứ 6: 519 xe (tăng do cuối tuần)
Thứ 7: 544 xe (cao nhất)
Chủ nhật: 534 xe (cao nhưng ít hơn thứ 7)
Thứ 2: 529 xe (tăng do đầu tuần)
🎯 Ý nghĩa thực tế
Patterns được học:
Cuối tuần: Nhu cầu cao hơn (người đi chơi)
Đầu tuần: Nhu cầu trung bình (người đi làm)
Giữa tuần: Nhu cầu thấp nhất
Thời tiết: Ảnh hưởng trực tiếp đến quyết định thuê xe
Độ tin cậy: 85% - Model khá tự tin về dự đoán này
Tóm lại: Từ 1 dự đoán cơ bản, model áp dụng các patterns đã học để tạo ra dự đoán 7 ngày với độ chính xác cao và phản ánh thực tế cuộc sống.
