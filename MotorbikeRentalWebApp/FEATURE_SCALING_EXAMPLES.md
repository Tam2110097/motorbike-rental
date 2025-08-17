# 📊 FEATURE SCALING EXAMPLES - VÍ DỤ CỤ THỂ
## Detailed Examples for Each Feature Scaling

---

## 🎯 TỔNG QUAN VỀ FEATURE SCALING

**Mục đích:** Chuẩn hóa tất cả features về cùng một range [0,1] để LSTM xử lý hiệu quả

**Công thức chung:** MinMaxScaler
```
Normalized_Value = (Original_Value - Min) / (Max - Min)
```

---

## 📋 DANH SÁCH 13 FEATURES

```
[Rented_Bikes, Hour, Temp, Humidity, Wind, Visibility, Dew_Point, Solar_Rad, Rainfall, Season_Spring, Season_Summer, Season_Winter, Holiday]
```

---

## 🔢 VÍ DỤ SCALING CHO TỪNG FEATURE

### 1. **Rented_Bikes** (Số xe thuê)
**Range thực tế:** 420 - 535 xe
**Công thức:**
```
Normalized = (Rented_Bikes - 420) / (535 - 420) = (Rented_Bikes - 420) / 115
```

**Ví dụ:**
- Ngày 1: (420 - 420) / 115 = 0.000
- Ngày 7: (510 - 420) / 115 = 0.783
- Ngày 14: (525 - 420) / 115 = 0.913

### 2. **Hour** (Giờ trong ngày)
**Range thực tế:** 13h (cố định)
**Công thức:**
```
Normalized = (Hour - 0) / (23 - 0) = Hour / 23
```

**Ví dụ:**
- Tất cả ngày: 13 / 23 = 0.565

### 3. **Temperature** (Nhiệt độ)
**Range thực tế:** 24.5°C - 31.5°C
**Công thức:**
```
Normalized = (Temp - 24.5) / (31.5 - 24.5) = (Temp - 24.5) / 7.0
```

**Ví dụ:**
- Ngày 1: (24.5 - 24.5) / 7.0 = 0.000
- Ngày 7: (28.8 - 24.5) / 7.0 = 0.614
- Ngày 14: (30.8 - 24.5) / 7.0 = 0.900

### 4. **Humidity** (Độ ẩm)
**Range thực tế:** 52% - 68%
**Công thức:**
```
Normalized = (Humidity - 52) / (68 - 52) = (Humidity - 52) / 16
```

**Ví dụ:**
- Ngày 1: (68 - 52) / 16 = 1.000
- Ngày 7: (57 - 52) / 16 = 0.313
- Ngày 14: (53 - 52) / 16 = 0.063

### 5. **Wind_Speed** (Tốc độ gió)
**Range thực tế:** 2.4 - 3.4 m/s
**Công thức:**
```
Normalized = (Wind - 2.4) / (3.4 - 2.4) = (Wind - 2.4) / 1.0
```

**Ví dụ:**
- Ngày 1: (2.8 - 2.4) / 1.0 = 0.400
- Ngày 7: (3.0 - 2.4) / 1.0 = 0.600
- Ngày 14: (2.7 - 2.4) / 1.0 = 0.300

### 6. **Visibility** (Tầm nhìn)
**Range thực tế:** 9.5 - 11.2 km
**Công thức:**
```
Normalized = (Visibility - 9.5) / (11.2 - 9.5) = (Visibility - 9.5) / 1.7
```

**Ví dụ:**
- Ngày 1: (9.5 - 9.5) / 1.7 = 0.000
- Ngày 7: (10.7 - 9.5) / 1.7 = 0.706
- Ngày 14: (11.0 - 9.5) / 1.7 = 0.882

### 7. **Dew_Point** (Điểm sương)
**Range thực tế:** 19.2°C - 25.9°C
**Công thức:**
```
Normalized = (Dew_Point - 19.2) / (25.9 - 19.2) = (Dew_Point - 19.2) / 6.7
```

**Ví dụ:**
- Ngày 1: (19.2 - 19.2) / 6.7 = 0.000
- Ngày 7: (23.8 - 19.2) / 6.7 = 0.687
- Ngày 14: (25.2 - 19.2) / 6.7 = 0.896

### 8. **Solar_Radiation** (Bức xạ mặt trời)
**Range thực tế:** 3.2 - 4.8 MJ
**Công thức:**
```
Normalized = (Solar_Rad - 3.2) / (4.8 - 3.2) = (Solar_Rad - 3.2) / 1.6
```

**Ví dụ:**
- Ngày 1: (3.2 - 3.2) / 1.6 = 0.000
- Ngày 7: (4.4 - 3.2) / 1.6 = 0.750
- Ngày 14: (4.6 - 3.2) / 1.6 = 0.875

### 9. **Rainfall** (Lượng mưa)
**Range thực tế:** 0 - 0 mm (không mưa)
**Công thức:**
```
Normalized = (Rainfall - 0) / (0 - 0) = 0 (cố định)
```

**Ví dụ:**
- Tất cả ngày: 0.000 (không mưa)

### 10. **Season_Spring** (Mùa xuân)
**Range thực tế:** 1 (có) hoặc 0 (không)
**Công thức:**
```
Normalized = Season_Spring (giữ nguyên vì đã là 0 hoặc 1)
```

**Ví dụ:**
- Tất cả ngày: 1.000 (mùa xuân)

### 11. **Season_Summer** (Mùa hè)
**Range thực tế:** 0 (không)
**Công thức:**
```
Normalized = Season_Summer (giữ nguyên vì đã là 0)
```

**Ví dụ:**
- Tất cả ngày: 0.000 (không phải mùa hè)

### 12. **Season_Winter** (Mùa đông)
**Range thực tế:** 0 (không)
**Công thức:**
```
Normalized = Season_Winter (giữ nguyên vì đã là 0)
```

**Ví dụ:**
- Tất cả ngày: 0.000 (không phải mùa đông)

### 13. **Holiday** (Ngày lễ)
**Range thực tế:** 0 (không lễ) hoặc 1 (có lễ)
**Công thức:**
```
Normalized = Holiday (giữ nguyên vì đã là 0 hoặc 1)
```

**Ví dụ:**
- Tất cả ngày: 0.000 (không có lễ)

---

## 📊 BẢNG TÓM TẮT SCALING CHO 3 NGÀY ĐẦU TIÊN

| Feature | Ngày 1 (Gốc) | Ngày 1 (Scaled) | Ngày 2 (Gốc) | Ngày 2 (Scaled) | Ngày 3 (Gốc) | Ngày 3 (Scaled) |
|---------|-------------|----------------|-------------|----------------|-------------|----------------|
| Rented_Bikes | 420 | 0.000 | 435 | 0.130 | 450 | 0.261 |
| Hour | 13 | 0.565 | 13 | 0.565 | 13 | 0.565 |
| Temperature | 24.5 | 0.000 | 25.2 | 0.100 | 26.8 | 0.329 |
| Humidity | 68 | 1.000 | 65 | 0.813 | 62 | 0.625 |
| Wind_Speed | 2.8 | 0.400 | 3.1 | 0.700 | 2.5 | 0.100 |
| Visibility | 9.5 | 0.000 | 9.8 | 0.176 | 10.2 | 0.412 |
| Dew_Point | 19.2 | 0.000 | 20.1 | 0.134 | 21.3 | 0.313 |
| Solar_Rad | 3.2 | 0.000 | 3.5 | 0.188 | 3.8 | 0.375 |
| Rainfall | 0 | 0.000 | 0 | 0.000 | 0 | 0.000 |
| Season_Spring | 1 | 1.000 | 1 | 1.000 | 1 | 1.000 |
| Season_Summer | 0 | 0.000 | 0 | 0.000 | 0 | 0.000 |
| Season_Winter | 0 | 0.000 | 0 | 0.000 | 0 | 0.000 |
| Holiday | 0 | 0.000 | 0 | 0.000 | 0 | 0.000 |

---

## 🎯 GIẢI THÍCH ĐẶC BIỆT CHO FEATURE LỄ/KHÔNG LỄ

### **Holiday Feature Scaling:**

**1. Binary Encoding (Mã hóa nhị phân):**
```
0 = Không có lễ (Normal day)
1 = Có lễ (Holiday)
```

**2. Tại sao không cần scale:**
- Đã ở dạng binary (0 hoặc 1)
- Range tự nhiên đã là [0,1]
- Không cần chuẩn hóa thêm

**3. Ví dụ thực tế:**
```python
# Dữ liệu gốc
holiday_data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  # 14 ngày không lễ

# Sau scaling (giữ nguyên)
holiday_scaled = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

**4. Trường hợp có lễ:**
```python
# Dữ liệu gốc (giả sử ngày 5 có lễ)
holiday_data = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]

# Sau scaling (giữ nguyên)
holiday_scaled = [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
```

---

## 🔄 QUY TRÌNH SCALING TỰ ĐỘNG

### **Bước 1: Tính Min-Max cho từng feature**
```python
# Ví dụ cho Rented_Bikes
min_rentals = min([420, 435, 450, ..., 525]) = 420
max_rentals = max([420, 435, 450, ..., 525]) = 535
```

### **Bước 2: Áp dụng công thức MinMaxScaler**
```python
def scale_feature(value, min_val, max_val):
    if max_val == min_val:  # Tránh chia cho 0
        return 0.5  # Giá trị mặc định
    return (value - min_val) / (max_val - min_val)
```

### **Bước 3: Xử lý đặc biệt cho binary features**
```python
def scale_binary_feature(value):
    # Binary features (0,1) không cần scale
    return value
```

---

## 📈 TÁC ĐỘNG CỦA SCALING LÊN DỰ ĐOÁN

### **1. Features cần scale:**
- **Rented_Bikes:** 420-535 → 0.000-0.913
- **Temperature:** 24.5-31.5°C → 0.000-1.000
- **Humidity:** 52-68% → 0.000-1.000

### **2. Features không cần scale:**
- **Holiday:** 0/1 → 0/1 (giữ nguyên)
- **Season features:** 0/1 → 0/1 (giữ nguyên)
- **Rainfall:** 0 → 0 (cố định)

### **3. Lợi ích:**
- **Cân bằng trọng số:** Tất cả features có cùng range
- **Tăng tốc độ hội tụ:** LSTM học nhanh hơn
- **Tránh bias:** Không feature nào chiếm ưu thế

---

*Ví dụ này minh họa cách scale từng feature cụ thể, đặc biệt là feature lễ/không lễ được xử lý như binary feature không cần scale thêm.*
