# 🔄 MÃ HÓA DỮ LIỆU TRƯỚC KHI SCALING
## Data Encoding Before Scaling Process

---

## 🎯 TẠI SAO CẦN MÃ HÓA TRƯỚC SCALING?

### **Vấn đề với dữ liệu gốc:**
```
❌ Categorical data không thể scale trực tiếp
❌ LSTM không thể xử lý text/categorical values
❌ Cần chuyển đổi về dạng số trước khi scale
```

### **Quy trình đúng:**
```
1. Data Encoding (Mã hóa) → 2. Scaling (Chuẩn hóa) → 3. LSTM Processing
```

---

## 📊 CÁC LOẠI DỮ LIỆU CẦN MÃ HÓA

### **1. Categorical Data (Dữ liệu phân loại):**
```
Seasons: ['Spring', 'Summer', 'Autumn', 'Winter']
Holiday: ['No Holiday', 'Holiday']
Day_of_Week: ['Monday', 'Tuesday', ..., 'Sunday']
```

### **2. Binary Data (Dữ liệu nhị phân):**
```
Holiday: [0, 1]
Working_Day: [0, 1]
```

### **3. Ordinal Data (Dữ liệu thứ tự):**
```
Weather_Condition: ['Clear', 'Cloudy', 'Rain', 'Snow']
```

---

## 🔢 CÁC PHƯƠNG PHÁP MÃ HÓA

### **1. One-Hot Encoding (Mã hóa một-nhiệt):**

**Nguyên lý:** Chuyển categorical thành binary columns

**Ví dụ với Seasons:**
```python
# Dữ liệu gốc
Seasons: ['Spring', 'Summer', 'Autumn', 'Winter']

# Sau One-Hot Encoding
Spring: [1, 0, 0, 0]
Summer: [0, 1, 0, 0]  
Autumn: [0, 0, 1, 0]
Winter: [0, 0, 0, 1]
```

**Code implementation:**
```python
from sklearn.preprocessing import OneHotEncoder

# Dữ liệu gốc
seasons_data = ['Spring', 'Summer', 'Autumn', 'Winter']

# One-Hot Encoding
encoder = OneHotEncoder()
encoded_seasons = encoder.fit_transform(seasons_data.reshape(-1, 1))

# Kết quả
# Spring:  [1, 0, 0, 0]
# Summer:  [0, 1, 0, 0]
# Autumn:  [0, 0, 1, 0]
# Winter:  [0, 0, 0, 1]
```

### **2. Label Encoding (Mã hóa nhãn):**

**Nguyên lý:** Gán số cho mỗi category

**Ví dụ:**
```python
# Dữ liệu gốc
Seasons: ['Spring', 'Summer', 'Autumn', 'Winter']

# Sau Label Encoding
Spring: 0
Summer: 1
Autumn: 2
Winter: 3
```

**Code implementation:**
```python
from sklearn.preprocessing import LabelEncoder

# Label Encoding
label_encoder = LabelEncoder()
encoded_seasons = label_encoder.fit_transform(seasons_data)

# Kết quả: [0, 1, 2, 3]
```

### **3. Binary Encoding (Mã hóa nhị phân):**

**Nguyên lý:** Chuyển thành binary representation

**Ví dụ:**
```python
# Dữ liệu gốc
Seasons: ['Spring', 'Summer', 'Autumn', 'Winter']

# Sau Binary Encoding
Spring: [0, 0]  # 0 in binary
Summer: [0, 1]  # 1 in binary
Autumn: [1, 0]  # 2 in binary
Winter: [1, 1]  # 3 in binary
```

---

## 📋 VÍ DỤ CỤ THỂ CHO BIKE RENTAL DATASET

### **Bước 1: Dữ liệu gốc (Raw Data)**

| Date | Seasons | Holiday | Temperature | Humidity | Rented_Bikes |
|------|---------|---------|-------------|----------|--------------|
| 2024-01-01 | Spring | No Holiday | 24.5 | 68 | 420 |
| 2024-01-02 | Spring | No Holiday | 25.2 | 65 | 435 |
| 2024-01-03 | Spring | Holiday | 26.8 | 62 | 450 |

### **Bước 2: One-Hot Encoding cho Categorical Features**

**Seasons Encoding:**
```python
# Dữ liệu gốc
Seasons: ['Spring', 'Spring', 'Spring']

# Sau One-Hot Encoding
Season_Spring: [1, 1, 1]
Season_Summer: [0, 0, 0]
Season_Autumn: [0, 0, 0]
Season_Winter: [0, 0, 0]
```

**Holiday Encoding:**
```python
# Dữ liệu gốc
Holiday: ['No Holiday', 'No Holiday', 'Holiday']

# Sau One-Hot Encoding
Holiday_No: [1, 1, 0]
Holiday_Yes: [0, 0, 1]
```

### **Bước 3: Dữ liệu sau encoding**

| Date | Temp | Humidity | Rented_Bikes | Season_Spring | Season_Summer | Season_Autumn | Season_Winter | Holiday_No | Holiday_Yes |
|------|------|----------|--------------|---------------|---------------|---------------|---------------|------------|-------------|
| 2024-01-01 | 24.5 | 68 | 420 | 1 | 0 | 0 | 0 | 1 | 0 |
| 2024-01-02 | 25.2 | 65 | 435 | 1 | 0 | 0 | 0 | 1 | 0 |
| 2024-01-03 | 26.8 | 62 | 450 | 1 | 0 | 0 | 0 | 0 | 1 |

### **Bước 4: Chuẩn bị cho Scaling**

```python
# Features cần scale (numerical)
numerical_features = ['Temperature', 'Humidity', 'Rented_Bikes']

# Features đã encoded (binary - không cần scale)
encoded_features = ['Season_Spring', 'Season_Summer', 'Season_Autumn', 
                   'Season_Winter', 'Holiday_No', 'Holiday_Yes']
```

---

## 🔄 QUY TRÌNH HOÀN CHỈNH

### **Bước 1: Data Loading & Cleaning**
```python
# Load data
data = pd.read_csv('bike_rental_data.csv')

# Handle missing values
data = data.dropna()

# Convert date
data['Date'] = pd.to_datetime(data['Date'])
```

### **Bước 2: Categorical Encoding**
```python
# Identify categorical columns
categorical_features = ['Seasons', 'Holiday']

# One-Hot Encoding
encoder = OneHotEncoder(sparse=False)
encoded_categorical = encoder.fit_transform(data[categorical_features])

# Create DataFrame for encoded features
encoded_df = pd.DataFrame(
    encoded_categorical,
    columns=encoder.get_feature_names_out(categorical_features)
)
```

### **Bước 3: Combine Numerical & Encoded Data**
```python
# Get numerical features
numerical_features = ['Temperature', 'Humidity', 'Wind_Speed', 'Rented_Bikes']

# Combine
final_data = pd.concat([
    data[numerical_features],
    encoded_df
], axis=1)
```

### **Bước 4: Scaling (Chỉ cho Numerical Features)**
```python
from sklearn.preprocessing import MinMaxScaler

# Scale only numerical features
scaler = MinMaxScaler()
scaled_numerical = scaler.fit_transform(final_data[numerical_features])

# Create final scaled DataFrame
scaled_df = pd.DataFrame(
    scaled_numerical,
    columns=numerical_features
)

# Add encoded features (already 0-1)
final_scaled_data = pd.concat([
    scaled_df,
    final_data.drop(numerical_features, axis=1)
], axis=1)
```

---

## 📊 SO SÁNH TRƯỚC VÀ SAU ENCODING

### **Trước Encoding:**
```python
# Raw data
data = {
    'Temperature': [24.5, 25.2, 26.8],
    'Humidity': [68, 65, 62],
    'Seasons': ['Spring', 'Spring', 'Spring'],
    'Holiday': ['No Holiday', 'No Holiday', 'Holiday']
}
```

**Vấn đề:**
- ❌ LSTM không thể xử lý text
- ❌ Không thể scale categorical data
- ❌ Thiếu thông tin về mối quan hệ

### **Sau Encoding:**
```python
# Encoded data
encoded_data = {
    'Temperature': [24.5, 25.2, 26.8],
    'Humidity': [68, 65, 62],
    'Season_Spring': [1, 1, 1],
    'Season_Summer': [0, 0, 0],
    'Season_Autumn': [0, 0, 0],
    'Season_Winter': [0, 0, 0],
    'Holiday_No': [1, 1, 0],
    'Holiday_Yes': [0, 0, 1]
}
```

**Lợi ích:**
- ✅ Tất cả dữ liệu đều là số
- ✅ Có thể scale numerical features
- ✅ Binary features đã ở range [0,1]
- ✅ LSTM có thể xử lý

---

## 🎯 LƯU Ý QUAN TRỌNG

### **1. Thứ tự thực hiện:**
```
1. Data Cleaning → 2. Categorical Encoding → 3. Numerical Scaling → 4. Model Training
```

### **2. Features không cần scale:**
- **Binary features** (0,1) - đã ở range phù hợp
- **One-hot encoded features** - đã là 0 hoặc 1

### **3. Features cần scale:**
- **Continuous numerical** (Temperature, Humidity, etc.)
- **Count data** (Rented_Bikes)

### **4. Lưu ý khi encoding:**
- **One-Hot Encoding** tăng số features
- **Label Encoding** có thể tạo thứ tự giả
- **Binary Encoding** giảm số features nhưng mất thông tin

---

## 📈 TÁC ĐỘNG LÊN LSTM

### **Input shape trước encoding:**
```
Shape: (samples, timesteps, features)
Features: [Temperature, Humidity, Seasons, Holiday]  # Mixed types
```

### **Input shape sau encoding:**
```
Shape: (samples, timesteps, features)
Features: [Temperature, Humidity, Season_Spring, Season_Summer, 
          Season_Autumn, Season_Winter, Holiday_No, Holiday_Yes]  # All numerical
```

### **Lợi ích:**
- ✅ LSTM có thể xử lý tất cả features
- ✅ Gradient descent ổn định
- ✅ Model học hiệu quả hơn
- ✅ Dự đoán chính xác hơn

---

*Tóm lại: Mã hóa dữ liệu là bước bắt buộc trước khi scaling để chuyển đổi categorical data thành numerical format mà LSTM có thể xử lý.*
