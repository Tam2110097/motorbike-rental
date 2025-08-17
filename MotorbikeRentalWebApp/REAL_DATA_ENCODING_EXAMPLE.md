# 📊 VÍ DỤ MẪU DỮ LIỆU THỰC TẾ - TRƯỚC VÀ SAU ENCODING
## Real Data Example: Before and After Encoding

---

## 🎯 MẪU DỮ LIỆU GỐC (14 NGÀY)

### **Dữ liệu gốc trước khi xử lý:**

```python
# Raw data - 14 ngày lịch sử
raw_data = [
    # [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season, Holiday]
    [420, 13, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 'Spring', 'No Holiday'],    # 2024-01-01 (Thứ 2)
    [435, 13, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 'Spring', 'No Holiday'],    # 2024-01-02 (Thứ 3)
    [450, 13, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0, 'Spring', 'No Holiday'],   # 2024-01-03 (Thứ 4)
    [465, 13, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0, 'Spring', 'No Holiday'],   # 2024-01-04 (Thứ 5)
    [480, 13, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0, 'Spring', 'No Holiday'],   # 2024-01-05 (Thứ 6)
    [520, 13, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0, 'Spring', 'No Holiday'],   # 2024-01-06 (Thứ 7)
    [510, 13, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0, 'Spring', 'No Holiday'],   # 2024-01-07 (Chủ nhật)
    [445, 13, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0, 'Spring', 'No Holiday'],    # 2024-01-08 (Thứ 2)
    [460, 13, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0, 'Spring', 'No Holiday'],   # 2024-01-09 (Thứ 3)
    [475, 13, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0, 'Spring', 'No Holiday'],   # 2024-01-10 (Thứ 4)
    [490, 13, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0, 'Spring', 'No Holiday'],   # 2024-01-11 (Thứ 5)
    [505, 13, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0, 'Spring', 'No Holiday'],   # 2024-01-12 (Thứ 6)
    [535, 13, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0, 'Spring', 'No Holiday'],   # 2024-01-13 (Thứ 7)
    [525, 13, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0, 'Spring', 'No Holiday']    # 2024-01-14 (Chủ nhật)
]
```

### **Bảng dữ liệu gốc:**

| Ngày | Rented_Bikes | Hour | Temp | Humidity | Wind | Visibility | Dew_Point | Solar_Rad | Rainfall | Season | Holiday |
|------|--------------|------|------|----------|------|------------|-----------|-----------|----------|--------|---------|
| 01/01 | 420 | 13 | 24.5 | 68 | 2.8 | 9.5 | 19.2 | 3.2 | 0 | Spring | No Holiday |
| 02/01 | 435 | 13 | 25.2 | 65 | 3.1 | 9.8 | 20.1 | 3.5 | 0 | Spring | No Holiday |
| 03/01 | 450 | 13 | 26.8 | 62 | 2.5 | 10.2 | 21.3 | 3.8 | 0 | Spring | No Holiday |
| 04/01 | 465 | 13 | 27.1 | 60 | 2.9 | 10.5 | 22.0 | 4.1 | 0 | Spring | No Holiday |
| 05/01 | 480 | 13 | 28.5 | 58 | 3.2 | 10.8 | 23.1 | 4.3 | 0 | Spring | No Holiday |
| 06/01 | 520 | 13 | 29.2 | 55 | 2.7 | 11.0 | 24.2 | 4.6 | 0 | Spring | No Holiday |
| 07/01 | 510 | 13 | 28.8 | 57 | 3.0 | 10.7 | 23.8 | 4.4 | 0 | Spring | No Holiday |
| 08/01 | 445 | 13 | 26.3 | 64 | 3.4 | 9.9 | 20.8 | 3.6 | 0 | Spring | No Holiday |
| 09/01 | 460 | 13 | 27.0 | 61 | 2.8 | 10.1 | 21.5 | 3.9 | 0 | Spring | No Holiday |
| 10/01 | 475 | 13 | 28.1 | 59 | 3.1 | 10.4 | 22.3 | 4.0 | 0 | Spring | No Holiday |
| 11/01 | 490 | 13 | 29.0 | 56 | 2.6 | 10.6 | 23.5 | 4.2 | 0 | Spring | No Holiday |
| 12/01 | 505 | 13 | 30.2 | 54 | 2.9 | 10.9 | 24.8 | 4.5 | 0 | Spring | No Holiday |
| 13/01 | 535 | 13 | 31.5 | 52 | 2.4 | 11.2 | 25.9 | 4.8 | 0 | Spring | No Holiday |
| 14/01 | 525 | 13 | 30.8 | 53 | 2.7 | 11.0 | 25.2 | 4.6 | 0 | Spring | No Holiday |

---

## 🔄 QUÁ TRÌNH MÃ HÓA (ENCODING)

### **Bước 1: Tách riêng Numerical và Categorical Features**

```python
# Numerical features (cần scale)
numerical_features = [
    [420, 13, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0],    # Ngày 1
    [435, 13, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0],    # Ngày 2
    [450, 13, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0],   # Ngày 3
    [465, 13, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0],   # Ngày 4
    [480, 13, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0],   # Ngày 5
    [520, 13, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0],   # Ngày 6
    [510, 13, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0],   # Ngày 7
    [445, 13, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0],    # Ngày 8
    [460, 13, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0],   # Ngày 9
    [475, 13, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0],   # Ngày 10
    [490, 13, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0],   # Ngày 11
    [505, 13, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0],   # Ngày 12
    [535, 13, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0],   # Ngày 13
    [525, 13, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0]    # Ngày 14
]

# Categorical features (cần encoding)
categorical_features = [
    ['Spring', 'No Holiday'],    # Ngày 1
    ['Spring', 'No Holiday'],    # Ngày 2
    ['Spring', 'No Holiday'],    # Ngày 3
    ['Spring', 'No Holiday'],    # Ngày 4
    ['Spring', 'No Holiday'],    # Ngày 5
    ['Spring', 'No Holiday'],    # Ngày 6
    ['Spring', 'No Holiday'],    # Ngày 7
    ['Spring', 'No Holiday'],    # Ngày 8
    ['Spring', 'No Holiday'],    # Ngày 9
    ['Spring', 'No Holiday'],    # Ngày 10
    ['Spring', 'No Holiday'],    # Ngày 11
    ['Spring', 'No Holiday'],    # Ngày 12
    ['Spring', 'No Holiday'],    # Ngày 13
    ['Spring', 'No Holiday']     # Ngày 14
]
```

### **Bước 2: One-Hot Encoding cho Categorical Features**

```python
# Seasons encoding
# Spring -> [1, 0, 0, 0]
# Summer -> [0, 1, 0, 0]
# Autumn -> [0, 0, 1, 0]
# Winter -> [0, 0, 0, 1]

# Holiday encoding
# No Holiday -> [1, 0]
# Holiday -> [0, 1]

# Sau One-Hot Encoding:
encoded_categorical = [
    [1, 0, 0, 0, 1, 0],    # Ngày 1: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 2: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 3: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 4: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 5: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 6: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 7: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 8: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 9: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 10: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 11: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 12: Spring, No Holiday
    [1, 0, 0, 0, 1, 0],    # Ngày 13: Spring, No Holiday
    [1, 0, 0, 0, 1, 0]     # Ngày 14: Spring, No Holiday
]
```

---

## 📊 MẪU DỮ LIỆU SAU ENCODING (14 NGÀY)

### **Dữ liệu sau One-Hot Encoding:**

```python
# Encoded data - 14 ngày sau encoding
encoded_data = [
    # [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season_Spring, Season_Summer, Season_Autumn, Season_Winter, Holiday_No, Holiday_Yes]
    [420, 13, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 1, 0, 0, 0, 1, 0],    # 2024-01-01
    [435, 13, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 1, 0, 0, 0, 1, 0],    # 2024-01-02
    [450, 13, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-03
    [465, 13, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-04
    [480, 13, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-05
    [520, 13, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-06
    [510, 13, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-07
    [445, 13, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0, 1, 0, 0, 0, 1, 0],    # 2024-01-08
    [460, 13, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-09
    [475, 13, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-10
    [490, 13, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-11
    [505, 13, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-12
    [535, 13, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0, 1, 0, 0, 0, 1, 0],   # 2024-01-13
    [525, 13, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0, 1, 0, 0, 0, 1, 0]    # 2024-01-14
]
```

### **Bảng dữ liệu sau encoding:**

| Ngày | Rented_Bikes | Hour | Temp | Humidity | Wind | Visibility | Dew_Point | Solar_Rad | Rainfall | Season_Spring | Season_Summer | Season_Autumn | Season_Winter | Holiday_No | Holiday_Yes |
|------|--------------|------|------|----------|------|------------|-----------|-----------|----------|---------------|---------------|---------------|---------------|------------|-------------|
| 01/01 | 420 | 13 | 24.5 | 68 | 2.8 | 9.5 | 19.2 | 3.2 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 02/01 | 435 | 13 | 25.2 | 65 | 3.1 | 9.8 | 20.1 | 3.5 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 03/01 | 450 | 13 | 26.8 | 62 | 2.5 | 10.2 | 21.3 | 3.8 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 04/01 | 465 | 13 | 27.1 | 60 | 2.9 | 10.5 | 22.0 | 4.1 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 05/01 | 480 | 13 | 28.5 | 58 | 3.2 | 10.8 | 23.1 | 4.3 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 06/01 | 520 | 13 | 29.2 | 55 | 2.7 | 11.0 | 24.2 | 4.6 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 07/01 | 510 | 13 | 28.8 | 57 | 3.0 | 10.7 | 23.8 | 4.4 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 08/01 | 445 | 13 | 26.3 | 64 | 3.4 | 9.9 | 20.8 | 3.6 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 09/01 | 460 | 13 | 27.0 | 61 | 2.8 | 10.1 | 21.5 | 3.9 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 10/01 | 475 | 13 | 28.1 | 59 | 3.1 | 10.4 | 22.3 | 4.0 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 11/01 | 490 | 13 | 29.0 | 56 | 2.6 | 10.6 | 23.5 | 4.2 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 12/01 | 505 | 13 | 30.2 | 54 | 2.9 | 10.9 | 24.8 | 4.5 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 13/01 | 535 | 13 | 31.5 | 52 | 2.4 | 11.2 | 25.9 | 4.8 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |
| 14/01 | 525 | 13 | 30.8 | 53 | 2.7 | 11.0 | 25.2 | 4.6 | 0 | **1** | **0** | **0** | **0** | **1** | **0** |

---

## 🔍 SO SÁNH CHI TIẾT

### **Trước Encoding:**
```python
# Features: 11 columns
# [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season, Holiday]

# Ví dụ ngày 1:
[420, 13, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 'Spring', 'No Holiday']
```

**Vấn đề:**
- ❌ Season: 'Spring' (text) - LSTM không thể xử lý
- ❌ Holiday: 'No Holiday' (text) - LSTM không thể xử lý
- ❌ Không thể scale categorical data

### **Sau Encoding:**
```python
# Features: 15 columns
# [Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season_Spring, Season_Summer, Season_Autumn, Season_Winter, Holiday_No, Holiday_Yes]

# Ví dụ ngày 1:
[420, 13, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 1, 0, 0, 0, 1, 0]
```

**Lợi ích:**
- ✅ Tất cả features đều là số
- ✅ Season_Spring = 1 (có), Season_Summer/Autumn/Winter = 0 (không có)
- ✅ Holiday_No = 1 (không lễ), Holiday_Yes = 0 (có lễ)
- ✅ Có thể scale numerical features
- ✅ LSTM có thể xử lý

---

## 📈 CHUẨN BỊ CHO SCALING

### **Features cần scale (Numerical):**
```python
numerical_features = [
    'Rented_Bikes',    # 420-535
    'Hour',           # 13 (cố định)
    'Temperature',    # 24.5-31.5
    'Humidity',       # 52-68
    'Wind_Speed',     # 2.4-3.4
    'Visibility',     # 9.5-11.2
    'Dew_Point',      # 19.2-25.9
    'Solar_Radiation', # 3.2-4.8
    'Rainfall'        # 0 (cố định)
]
```

### **Features không cần scale (Binary):**
```python
binary_features = [
    'Season_Spring',   # 0 hoặc 1
    'Season_Summer',   # 0 hoặc 1
    'Season_Autumn',   # 0 hoặc 1
    'Season_Winter',   # 0 hoặc 1
    'Holiday_No',      # 0 hoặc 1
    'Holiday_Yes'      # 0 hoặc 1
]
```

---

## 🎯 KẾT QUẢ CUỐI CÙNG

### **Input cho LSTM:**
```python
# Shape: (1, 14, 15)
# 1 sample, 14 timesteps (ngày), 15 features

lstm_input = [
    # Ngày 1-14 với 15 features mỗi ngày
    [420, 13, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 1, 0, 0, 0, 1, 0],    # Ngày 1
    [435, 13, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 1, 0, 0, 0, 1, 0],    # Ngày 2
    [450, 13, 26.8, 62, 2.5, 10.2, 21.3, 3.8, 0, 1, 0, 0, 0, 1, 0],   # Ngày 3
    [465, 13, 27.1, 60, 2.9, 10.5, 22.0, 4.1, 0, 1, 0, 0, 0, 1, 0],   # Ngày 4
    [480, 13, 28.5, 58, 3.2, 10.8, 23.1, 4.3, 0, 1, 0, 0, 0, 1, 0],   # Ngày 5
    [520, 13, 29.2, 55, 2.7, 11.0, 24.2, 4.6, 0, 1, 0, 0, 0, 1, 0],   # Ngày 6
    [510, 13, 28.8, 57, 3.0, 10.7, 23.8, 4.4, 0, 1, 0, 0, 0, 1, 0],   # Ngày 7
    [445, 13, 26.3, 64, 3.4, 9.9, 20.8, 3.6, 0, 1, 0, 0, 0, 1, 0],    # Ngày 8
    [460, 13, 27.0, 61, 2.8, 10.1, 21.5, 3.9, 0, 1, 0, 0, 0, 1, 0],   # Ngày 9
    [475, 13, 28.1, 59, 3.1, 10.4, 22.3, 4.0, 0, 1, 0, 0, 0, 1, 0],   # Ngày 10
    [490, 13, 29.0, 56, 2.6, 10.6, 23.5, 4.2, 0, 1, 0, 0, 0, 1, 0],   # Ngày 11
    [505, 13, 30.2, 54, 2.9, 10.9, 24.8, 4.5, 0, 1, 0, 0, 0, 1, 0],   # Ngày 12
    [535, 13, 31.5, 52, 2.4, 11.2, 25.9, 4.8, 0, 1, 0, 0, 0, 1, 0],   # Ngày 13
    [525, 13, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0, 1, 0, 0, 0, 1, 0]    # Ngày 14
]
```

**Tóm lại:** Dữ liệu đã được chuyển đổi từ 11 features (có text) thành 15 features (tất cả là số), sẵn sàng cho bước scaling tiếp theo.
