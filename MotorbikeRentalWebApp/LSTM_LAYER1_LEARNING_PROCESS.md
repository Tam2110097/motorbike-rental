# LSTM LAYER 1: LỌC, CHỌN VÀ HỌC 50 ĐẶC TRƯNG

## ✅ **BẠN ĐÃ HIỂU ĐÚNG!**

### **Câu Hỏi:**
> "Layer 1 lọc và chọn ra 50 các đặc trưng và học từ 50 đặc trưng này đúng không?"

### **Trả Lời: ĐÚNG!**
> **LSTM Layer 1 lọc, chọn và học từ 50 đặc trưng**

---

## 🔍 **QUÁ TRÌNH LỌC VÀ CHỌN ĐẶC TRƯNG**

### **1. Từ 15 Features → 50 Features:**

#### **1.1 Input: 15 Features Gốc:**
```
┌─────────────────────────────────────────────────────────┐
│                15 FEATURES ĐẦU VÀO                       │
│                                                         │
│  📊 Features Gốc (15 đặc trưng):                       │
│  │                                                      │
│  🚗 **Nhu Cầu Thuê Xe:**                               │
│  • Feature 1: Số xe thuê hôm qua                       │
│  • Feature 2: Số xe thuê 2 ngày trước                   │
│  • Feature 3: Số xe thuê 3 ngày trước                   │
│  │                                                      │
│  🌦️ **Thời Tiết:**                                     │
│  • Feature 4: Nhiệt độ hiện tại                         │
│  • Feature 5: Độ ẩm hiện tại                           │
│  • Feature 6: Tốc độ gió                                │
│  • Feature 7: Lượng mưa                                 │
│  │                                                      │
│  📅 **Thời Gian:**                                      │
│  • Feature 8: Ngày trong tuần (1-7)                     │
│  • Feature 9: Ngày trong tháng                          │
│  • Feature 10: Tháng trong năm                          │
│  • Feature 11: Mùa (1-4)                                │
│  │                                                      │
│  🎉 **Sự Kiện:**                                        │
│  • Feature 12: Ngày lễ (0/1)                            │
│  • Feature 13: Cuối tuần (0/1)                          │
│  • Feature 14: Đầu tháng (0/1)                          │
│  • Feature 15: Sự kiện đặc biệt (0/1)                   │
└─────────────────────────────────────────────────────────┘
```

#### **1.2 LSTM Layer 1 Lọc và Chọn:**
```
┌─────────────────────────────────────────────────────────┐
│                LSTM LAYER 1 - LỌC VÀ CHỌN               │
│                                                         │
│  📥 Input: 15 features gốc                             │
│  │                                                      │
│  🧠 50 Units cùng xử lý:                                │
│  │                                                      │
│  🔍 **Quá Trình Lọc:**                                  │
│  │ • Mỗi unit phân tích toàn bộ 15 features            │
│  │ • Tìm ra mối quan hệ giữa các features              │
│  │ • Loại bỏ thông tin không quan trọng                │
│  │ • Tập trung vào thông tin có ích                    │
│  │                                                      │
│  🎯 **Quá Trình Chọn:**                                 │
│  │ • Unit 1: Chọn đặc trưng "xu hướng tăng"            │
│  │ • Unit 2: Chọn đặc trưng "ảnh hưởng cuối tuần"      │
│  │ • Unit 3: Chọn đặc trưng "tương quan nhiệt độ"      │
│  │ • ...                                                │
│  │ • Unit 50: Chọn đặc trưng "tổng hợp phức tạp"       │
│  │                                                      │
│  📤 Output: 50 features được lọc và chọn               │
└─────────────────────────────────────────────────────────┘
```

---

## 🧠 **LSTM LAYER 1 HỌC GÌ?**

### **2. Cách LSTM Học Từ 50 Đặc Trưng:**

#### **2.1 Quá Trình Học Chi Tiết:**
```
┌─────────────────────────────────────────────────────────┐
│                LSTM LAYER 1 HỌC GÌ?                     │
│                                                         │
│  📚 **Học Mối Quan Hệ:**                                │
│  │                                                      │
│  Unit 1: Học "xu hướng tăng"                            │
│  • Input: [120, 135, 150, 180, 200, ...]               │
│  • Pattern: +15 xe/ngày                                 │
│  • Output: 0.85 (độ mạnh xu hướng)                     │
│  │                                                      │
│  Unit 2: Học "ảnh hưởng cuối tuần"                     │
│  • Input: [200, 250, 280, 120, 135, ...]               │
│  • Pattern: cuối tuần cao hơn 50%                      │
│  • Output: 0.92 (mức độ ảnh hưởng)                     │
│  │                                                      │
│  Unit 3: Học "tương quan nhiệt độ"                     │
│  • Input: [25°C→120xe, 30°C→200xe, 35°C→250xe]         │
│  • Pattern: +10 xe/°C                                   │
│  • Output: 0.78 (hệ số tương quan)                     │
│  │                                                      │
│  Unit 4: Học "độ nhạy thời tiết"                       │
│  • Input: [mưa→-30%, nắng→+20%]                        │
│  • Pattern: thời tiết ảnh hưởng 25%                    │
│  • Output: 0.65 (độ nhạy)                              │
│  │                                                      │
│  ... 46 units khác học các đặc trưng khác              │
└─────────────────────────────────────────────────────────┘
```

#### **2.2 Ví Dụ Cụ Thể Cho 1 Unit:**
```python
# Unit 1 học "xu hướng tăng"
input_sequence = [
    [120, 25, 70, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Ngày 1
    [135, 26, 65, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Ngày 2
    [150, 28, 60, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Ngày 3
    [180, 30, 55, 4, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Ngày 4
    [200, 32, 50, 5, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],  # Ngày 5
    # ... 10 ngày nữa
]

# Unit 1 phân tích:
# - Số xe: 120 → 135 → 150 → 180 → 200 (tăng dần)
# - Nhiệt độ: 25 → 26 → 28 → 30 → 32 (tăng dần)
# - Kết luận: Có xu hướng tăng mạnh

unit_1_output = 0.85  # "Xu hướng tăng mạnh"
```

---

## 🔄 **QUÁ TRÌNH LỌC VÀ HỌC CHI TIẾT**

### **3. Cách LSTM Lọc Thông Tin:**

#### **3.1 Forget Gate - Lọc Thông Tin:**
```
┌─────────────────────────────────────────────────────────┐
│                FORGET GATE - LỌC THÔNG TIN              │
│                                                         │
│  🚫 **Loại Bỏ Thông Tin Không Quan Trọng:**             │
│  │                                                      │
│  Ví dụ: Unit 1 (xu hướng tăng)                         │
│  • Giữ lại: Số xe thuê, nhiệt độ                        │
│  • Loại bỏ: Độ ẩm, tốc độ gió (ít ảnh hưởng)           │
│  │                                                      │
│  🎯 **Tập Trung Vào Thông Tin Quan Trọng:**             │
│  • Forget gate = 0.8 cho số xe                          │
│  • Forget gate = 0.7 cho nhiệt độ                       │
│  • Forget gate = 0.2 cho độ ẩm (ít quan trọng)         │
└─────────────────────────────────────────────────────────┘
```

#### **3.2 Input Gate - Chọn Thông Tin Mới:**
```
┌─────────────────────────────────────────────────────────┐
│                INPUT GATE - CHỌN THÔNG TIN              │
│                                                         │
│  ✅ **Chọn Thông Tin Mới Quan Trọng:**                  │
│  │                                                      │
│  Ví dụ: Unit 2 (ảnh hưởng cuối tuần)                   │
│  • Chọn: Ngày trong tuần, cuối tuần flag               │
│  • Bỏ qua: Nhiệt độ, độ ẩm                              │
│  │                                                      │
│  🎯 **Tập Trung Vào Pattern Cuối Tuần:**                │
│  • Input gate = 0.9 cho ngày trong tuần                 │
│  • Input gate = 0.95 cho cuối tuần flag                │
│  • Input gate = 0.1 cho các features khác               │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 **50 ĐẶC TRƯNG ĐƯỢC HỌC**

### **4. Phân Loại 50 Đặc Trưng:**

#### **4.1 Nhóm 1: Xu Hướng (Units 1-10):**
```
┌─────────────────────────────────────────────────────────┐
│                NHÓM 1: XU HƯỚNG (1-10)                  │
│                                                         │
│  Unit 1:  Xu hướng tăng ngắn hạn (3-5 ngày)            │
│  Unit 2:  Xu hướng tăng trung hạn (1-2 tuần)            │
│  Unit 3:  Xu hướng tăng dài hạn (1 tháng)               │
│  Unit 4:  Xu hướng giảm ngắn hạn                        │
│  Unit 5:  Xu hướng giảm trung hạn                       │
│  Unit 6:  Xu hướng giảm dài hạn                         │
│  Unit 7:  Độ biến động (volatility)                     │
│  Unit 8:  Tốc độ thay đổi                               │
│  Unit 9:  Gia tốc thay đổi                              │
│  Unit 10: Xu hướng tổng hợp                             │
└─────────────────────────────────────────────────────────┘
```

#### **4.2 Nhóm 2: Mô Hình Tuần (Units 11-20):**
```
┌─────────────────────────────────────────────────────────┐
│                NHÓM 2: MÔ HÌNH TUẦN (11-20)             │
│                                                         │
│  Unit 11: Ảnh hưởng thứ 2                               │
│  Unit 12: Ảnh hưởng thứ 3                               │
│  Unit 13: Ảnh hưởng thứ 4                               │
│  Unit 14: Ảnh hưởng thứ 5                               │
│  Unit 15: Ảnh hưởng thứ 6                               │
│  Unit 16: Ảnh hưởng thứ 7                               │
│  Unit 17: Ảnh hưởng chủ nhật                            │
│  Unit 18: Mô hình cuối tuần tổng hợp                    │
│  Unit 19: Mô hình đầu tuần                              │
│  Unit 20: Mô hình giữa tuần                             │
└─────────────────────────────────────────────────────────┘
```

#### **4.3 Nhóm 3: Thời Tiết (Units 21-30):**
```
┌─────────────────────────────────────────────────────────┐
│                NHÓM 3: THỜI TIẾT (21-30)                │
│                                                         │
│  Unit 21: Tương quan nhiệt độ                           │
│  Unit 22: Tương quan độ ẩm                              │
│  Unit 23: Tương quan tốc độ gió                         │
│  Unit 24: Tương quan lượng mưa                          │
│  Unit 25: Ảnh hưởng thời tiết xấu                      │
│  Unit 26: Ảnh hưởng thời tiết tốt                      │
│  Unit 27: Độ nhạy thời tiết tổng hợp                    │
│  Unit 28: Mô hình thời tiết theo mùa                    │
│  Unit 29: Tương tác thời tiết + ngày                    │
│  Unit 30: Dự báo thời tiết ảnh hưởng                   │
└─────────────────────────────────────────────────────────┘
```

#### **4.4 Nhóm 4: Sự Kiện (Units 31-40):**
```
┌─────────────────────────────────────────────────────────┐
│                NHÓM 4: SỰ KIỆN (31-40)                  │
│                                                         │
│  Unit 31: Ảnh hưởng ngày lễ                             │
│  Unit 32: Ảnh hưởng cuối tuần                           │
│  Unit 33: Ảnh hưởng đầu tháng                           │
│  Unit 34: Ảnh hưởng cuối tháng                          │
│  Unit 35: Ảnh hưởng sự kiện đặc biệt                    │
│  Unit 36: Mô hình lễ hội                                │
│  Unit 37: Mô hình du lịch                               │
│  Unit 38: Tương tác sự kiện + thời tiết                 │
│  Unit 39: Tương tác sự kiện + ngày                      │
│  Unit 40: Dự báo sự kiện ảnh hưởng                      │
└─────────────────────────────────────────────────────────┘
```

#### **4.5 Nhóm 5: Tổng Hợp (Units 41-50):**
```
┌─────────────────────────────────────────────────────────┐
│                NHÓM 5: TỔNG HỢP (41-50)                 │
│                                                         │
│  Unit 41: Tương tác xu hướng + thời tiết                │
│  Unit 42: Tương tác xu hướng + sự kiện                  │
│  Unit 43: Tương tác thời tiết + sự kiện                 │
│  Unit 44: Mô hình tổng hợp phức tạp 1                   │
│  Unit 45: Mô hình tổng hợp phức tạp 2                   │
│  Unit 46: Mô hình tổng hợp phức tạp 3                   │
│  Unit 47: Mô hình tổng hợp phức tạp 4                   │
│  Unit 48: Mô hình tổng hợp phức tạp 5                   │
│  Unit 49: Đặc trưng dự phòng 1                          │
│  Unit 50: Đặc trưng dự phòng 2                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 **KẾT QUẢ HỌC TẬP**

### **5. Output của LSTM Layer 1:**

#### **5.1 50 Đặc Trưng Được Học:**
```python
# Output của LSTM Layer 1
layer1_output = [
    0.85,  # Unit 1: Xu hướng tăng mạnh
    0.92,  # Unit 2: Ảnh hưởng cuối tuần cao
    0.78,  # Unit 3: Tương quan nhiệt độ dương
    0.65,  # Unit 4: Độ ẩm ảnh hưởng trung bình
    0.45,  # Unit 5: Không có sự kiện đặc biệt
    0.88,  # Unit 6: Mô hình tuần rõ ràng
    0.72,  # Unit 7: Độ biến động thấp
    0.91,  # Unit 8: Tốc độ thay đổi nhanh
    0.34,  # Unit 9: Gia tốc thay đổi chậm
    0.67,  # Unit 10: Xu hướng tổng hợp ổn định
    # ... 40 units khác
]
```

#### **5.2 Ý Nghĩa Của Mỗi Giá Trị:**
```
┌─────────────────────────────────────────────────────────┐
│                Ý NGHĨA CÁC GIÁ TRỊ                      │
│                                                         │
│  📊 **Giá Trị 0.0 - 1.0:**                              │
│  • 0.0: Không có ảnh hưởng                              │
│  • 0.3: Ảnh hưởng yếu                                   │
│  • 0.5: Ảnh hưởng trung bình                            │
│  • 0.7: Ảnh hưởng mạnh                                  │
│  • 0.9: Ảnh hưởng rất mạnh                              │
│  • 1.0: Ảnh hưởng tối đa                                │
│                                                         │
│  📈 **Giá Trị Âm (-1.0 - 0.0):**                        │
│  • -0.5: Ảnh hưởng ngược (giảm)                        │
│  • -0.8: Ảnh hưởng ngược mạnh                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 **IMPLEMENTATION THỰC TẾ**

### **6. Code Mẫu:**

#### **6.1 LSTM Layer 1:**
```python
from tensorflow.keras.layers import LSTM

# LSTM Layer 1: Lọc và chọn 50 đặc trưng
lstm_layer1 = LSTM(
    units=50,                    # 50 units = 50 đặc trưng
    return_sequences=True,       # Trả về toàn bộ chuỗi
    activation='tanh',           # Hàm kích hoạt
    recurrent_activation='sigmoid', # Hàm kích hoạt cho cổng
    dropout=0.2,                # Dropout để tránh overfitting
    input_shape=(15, 15)         # 15 ngày × 15 features
)

# Mô hình hoàn chỉnh
model = Sequential([
    # Layer 1: Lọc và chọn 50 đặc trưng
    LSTM(50, return_sequences=True, input_shape=(15, 15)),
    Dropout(0.2),
    
    # Layer 2: Tổng hợp 50 → 30 đặc trưng quan trọng
    LSTM(30, return_sequences=False),
    Dropout(0.2),
    
    # Output: Tổng hợp 30 → 1 dự đoán
    Dense(1, activation='linear')
])
```

---

## 📝 **KẾT LUẬN**

### **Tóm Tắt Quan Trọng:**

1. **✅ LSTM Layer 1 lọc và chọn ra 50 đặc trưng từ 15 features gốc**
2. **✅ Mỗi unit học một đặc trưng cụ thể và chuyên biệt**
3. **✅ 50 đặc trưng được phân loại thành 5 nhóm chính**
4. **✅ Mỗi đặc trưng có giá trị từ 0.0-1.0 hoặc âm**
5. **✅ LSTM Layer 1 là bước quan trọng để trích xuất thông tin hữu ích**

### **Trong Hệ Thống Thuê Xe:**
- **Input**: 15 features gốc (số xe, thời tiết, thời gian, sự kiện)
- **LSTM Layer 1**: Lọc và chọn 50 đặc trưng quan trọng
- **LSTM Layer 2**: Tổng hợp 50 → 30 đặc trưng quan trọng nhất
- **Output**: Dự đoán số xe cần chuẩn bị

### **Thông Điệp Chính:**
> **LSTM Layer 1 là "bộ lọc thông minh" - lọc bỏ thông tin không quan trọng và chọn ra 50 đặc trưng có ích nhất để học!**
