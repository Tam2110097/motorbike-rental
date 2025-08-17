# 🔄 TẠI SAO CẦN SCALE VÀ DỮ LIỆU ĐẦU RA
## Why Scaling is Needed and Output Illustration

---

## 🎯 TẠI SAO CẦN SCALE?

### **1. Vấn đề với dữ liệu không scale:**

**Dữ liệu gốc (không scale):**
```
Rented_Bikes:    420-535    (range: 115)
Temperature:     24.5-31.5  (range: 7.0)
Humidity:        52-68      (range: 16)
Wind_Speed:      2.4-3.4    (range: 1.0)
Holiday:         0-1        (range: 1)
```

**Vấn đề:**
- **Rented_Bikes (420-535)** có range lớn nhất → chiếm ưu thế
- **Wind_Speed (2.4-3.4)** có range nhỏ nhất → bị bỏ qua
- **LSTM bị bias** về features có giá trị lớn

### **2. Hậu quả không scale:**

```
❌ LSTM học chủ yếu từ Rented_Bikes (420-535)
❌ Bỏ qua Wind_Speed (2.4-3.4) - quá nhỏ
❌ Tốc độ hội tụ chậm
❌ Độ chính xác thấp
❌ Model không ổn định
```

---

## ✅ LỢI ÍCH CỦA SCALING

### **1. Cân bằng trọng số:**
```
✅ Tất cả features có cùng range [0,1]
✅ Không feature nào chiếm ưu thế
✅ LSTM học công bằng từ tất cả features
```

### **2. Tăng tốc độ hội tụ:**
```
✅ Gradient descent ổn định hơn
✅ Learning rate phù hợp cho tất cả features
✅ Model hội tụ nhanh hơn
```

### **3. Tăng độ chính xác:**
```
✅ LSTM có thể học patterns từ tất cả features
✅ Không bỏ sót thông tin quan trọng
✅ Dự đoán chính xác hơn
```

---

## 📊 MINH HỌA DỮ LIỆU ĐẦU RA CỦA SCALING

### **Bước 1: Dữ liệu gốc (3 ngày đầu)**

| Feature | Ngày 1 | Ngày 2 | Ngày 3 |
|---------|--------|--------|--------|
| Rented_Bikes | 420 | 435 | 450 |
| Temperature | 24.5 | 25.2 | 26.8 |
| Humidity | 68 | 65 | 62 |
| Wind_Speed | 2.8 | 3.1 | 2.5 |
| Holiday | 0 | 0 | 0 |

### **Bước 2: Tính Min-Max cho từng feature**

```python
# Rented_Bikes
min_rentals = 420, max_rentals = 535
range_rentals = 535 - 420 = 115

# Temperature  
min_temp = 24.5, max_temp = 31.5
range_temp = 31.5 - 24.5 = 7.0

# Humidity
min_humidity = 52, max_humidity = 68  
range_humidity = 68 - 52 = 16

# Wind_Speed
min_wind = 2.4, max_wind = 3.4
range_wind = 3.4 - 2.4 = 1.0

# Holiday (binary - không cần tính)
```

### **Bước 3: Áp dụng công thức MinMaxScaler**

**Công thức:** `Normalized = (Value - Min) / (Max - Min)`

| Feature | Ngày 1 | Công thức | Kết quả |
|---------|--------|-----------|---------|
| Rented_Bikes | 420 | (420-420)/115 | **0.000** |
| Temperature | 24.5 | (24.5-24.5)/7.0 | **0.000** |
| Humidity | 68 | (68-52)/16 | **1.000** |
| Wind_Speed | 2.8 | (2.8-2.4)/1.0 | **0.400** |
| Holiday | 0 | Giữ nguyên | **0.000** |

| Feature | Ngày 2 | Công thức | Kết quả |
|---------|--------|-----------|---------|
| Rented_Bikes | 435 | (435-420)/115 | **0.130** |
| Temperature | 25.2 | (25.2-24.5)/7.0 | **0.100** |
| Humidity | 65 | (65-52)/16 | **0.813** |
| Wind_Speed | 3.1 | (3.1-2.4)/1.0 | **0.700** |
| Holiday | 0 | Giữ nguyên | **0.000** |

| Feature | Ngày 3 | Công thức | Kết quả |
|---------|--------|-----------|---------|
| Rented_Bikes | 450 | (450-420)/115 | **0.261** |
| Temperature | 26.8 | (26.8-24.5)/7.0 | **0.329** |
| Humidity | 62 | (62-52)/16 | **0.625** |
| Wind_Speed | 2.5 | (2.5-2.4)/1.0 | **0.100** |
| Holiday | 0 | Giữ nguyên | **0.000** |

### **Bước 4: Dữ liệu đầu ra sau scaling**

| Feature | Ngày 1 | Ngày 2 | Ngày 3 |
|---------|--------|--------|--------|
| Rented_Bikes | **0.000** | **0.130** | **0.261** |
| Temperature | **0.000** | **0.100** | **0.329** |
| Humidity | **1.000** | **0.813** | **0.625** |
| Wind_Speed | **0.400** | **0.700** | **0.100** |
| Holiday | **0.000** | **0.000** | **0.000** |

---

## 🔍 SO SÁNH TRƯỚC VÀ SAU SCALING

### **Trước scaling (Raw data):**
```
Ngày 1: [420, 24.5, 68, 2.8, 0]
Ngày 2: [435, 25.2, 65, 3.1, 0]  
Ngày 3: [450, 26.8, 62, 2.5, 0]
```

**Vấn đề:**
- Rented_Bikes (420-450) >> Wind_Speed (2.5-3.1)
- LSTM bị bias về Rented_Bikes
- Wind_Speed bị bỏ qua

### **Sau scaling (Normalized data):**
```
Ngày 1: [0.000, 0.000, 1.000, 0.400, 0.000]
Ngày 2: [0.130, 0.100, 0.813, 0.700, 0.000]
Ngày 3: [0.261, 0.329, 0.625, 0.100, 0.000]
```

**Lợi ích:**
- Tất cả features có range [0,1]
- Cân bằng trọng số
- LSTM học từ tất cả features

---

## 📈 TÁC ĐỘNG LÊN LSTM

### **1. Input vào LSTM (trước scaling):**
```
Shape: (1, 14, 13)
Ngày 1: [420, 13, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 1, 0, 0, 0]
Ngày 2: [435, 13, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 1, 0, 0, 0]
...
```

**Vấn đề:** Rented_Bikes (420-535) chiếm ưu thế

### **2. Input vào LSTM (sau scaling):**
```
Shape: (1, 14, 13)  
Ngày 1: [0.000, 0.565, 0.000, 1.000, 0.400, 0.000, 0.000, 0.000, 0.000, 1.000, 0.000, 0.000, 0.000]
Ngày 2: [0.130, 0.565, 0.100, 0.813, 0.700, 0.176, 0.134, 0.188, 0.000, 1.000, 0.000, 0.000, 0.000]
...
```

**Lợi ích:** Tất cả features có cùng range [0,1]

---

## 🎯 KẾT LUẬN

### **Tại sao cần scale:**
1. **Cân bằng trọng số** giữa các features
2. **Tăng tốc độ hội tụ** của LSTM
3. **Tăng độ chính xác** dự đoán
4. **Tránh bias** về features có giá trị lớn

### **Dữ liệu đầu ra của scaling:**
- **Range:** Tất cả features về [0,1]
- **Format:** Giữ nguyên shape (1, 14, 13)
- **Chất lượng:** Cân bằng, ổn định cho LSTM

### **Kết quả:**
```
✅ LSTM học hiệu quả từ tất cả features
✅ Dự đoán chính xác hơn
✅ Model ổn định và tin cậy
```
