# KIẾN TRÚC HỆ THỐNG DỰ ĐOÁN NHU CẦU THUÊ XE

## 🏗️ **KIẾN TRÚC TỔNG QUAN**

### **Luồng Dữ Liệu Chính:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dữ Liệu      │───▶│   Xử Lý Dữ      │───▶│   Mô Hình       │
│   Đầu Vào      │    │   Liệu          │    │   LSTM          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Kết Quả      │◀───│   Hậu Xử Lý     │◀───│   Dự Đoán       │
│   Hiển Thị     │    │   Dữ Liệu       │    │   Đầu Ra        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 📊 **LUỒNG DỮ LIỆU CHI TIẾT**

### **1. THU THẬP DỮ LIỆU ĐẦU VÀO**

#### **1.1 Dữ Liệu Thời Tiết (Real-time):**
```
┌─────────────────────────────────────────────────────────┐
│                API THỜI TIẾT                           │
│                                                         │
│  🌤️ OpenWeatherMap API                                │
│  • Nhiệt độ hiện tại (°C)                              │
│  • Độ ẩm (%)                                          │
│  • Tốc độ gió (m/s)                                   │
│  • Áp suất (hPa)                                      │
│  • Tầm nhìn (km)                                      │
│  • Chỉ số UV                                          │
│  • Điều kiện thời tiết (mưa, sương mù)                │
│  • Dự báo 7 ngày                                      │
└─────────────────────────────────────────────────────────┘
```

#### **1.2 Dữ Liệu Lịch Sử (Database):**
```
┌─────────────────────────────────────────────────────────┐
│                CƠ SỞ DỮ LIỆU                          │
│                                                         │
│  📊 MySQL/PostgreSQL                                   │
│  • Số xe thuê theo ngày (lịch sử)                     │
│  • Thông tin ngày (thứ, ngày lễ, mùa)                 │
│  • Dữ liệu thời tiết lịch sử                          │
│  • Sự kiện đặc biệt                                   │
│  • Hiệu suất dự đoán trước đó                         │
└─────────────────────────────────────────────────────────┘
```

### **2. XỬ LÝ DỮ LIỆU ĐẦU VÀO**

#### **2.1 Tiền Xử Lý Dữ Liệu:**
```
┌─────────────────────────────────────────────────────────┐
│                TIỀN XỬ LÝ DỮ LIỆU                     │
│                                                         │
│  🔧 Data Preprocessing                                 │
│  • Làm sạch dữ liệu (missing values, outliers)        │
│  • Chuẩn hóa dữ liệu (MinMaxScaler)                   │
│    Formula: scaling_value = (x - min) / (max - min)   │
│    Range: [0, 1]                                       │
│  • Mã hóa biến phân loại (one-hot encoding)           │
│  • Tạo đặc trưng thời gian (ngày, tháng, mùa)         │
│  • Tạo đặc trưng thời tiết (mưa, sương mù)            │
└─────────────────────────────────────────────────────────┘
```

#### **2.1.1 MinMaxScaler Chi Tiết:**
```
┌─────────────────────────────────────────────────────────┐
│                MINMAX SCALER                           │
│                                                         │
│  📊 Normalization Formula                              │
│  scaling_value = (x - min) / (max - min)              │
│                                                         │
│  🎯 Ví dụ:                                            │
│  • Dữ liệu gốc: [100, 200, 300, 400, 500]             │
│  • Min = 100, Max = 500                               │
│  • Sau chuẩn hóa: [0, 0.25, 0.5, 0.75, 1]            │
│                                                         │
│  ✅ Lợi ích:                                          │
│  • Tất cả giá trị nằm trong [0, 1]                    │
│  • Giúp LSTM học hiệu quả hơn                         │
│  • Tránh gradient biến mất/bùng nổ                    │
└─────────────────────────────────────────────────────────┘
```

#### **2.2 Tạo Chuỗi Thời Gian:**
```
┌─────────────────────────────────────────────────────────┐
│                TẠO CHUỖI THỜI GIAN                     │
│                                                         │
│  📈 Sequence Generation                                │
│  • Input: 15 ngày × 15 đặc trưng                      │
│  • Output: 1 giá trị dự đoán                          │
│  • Look-back window: 15 ngày                          │
│  • Step size: 1 ngày                                  │
│  • Shape: (samples, 15, 15)                           │
└─────────────────────────────────────────────────────────┘
```

### **3. MÔ HÌNH LSTM**

#### **3.1 Kiến Trúc Mô Hình:**
```
┌─────────────────────────────────────────────────────────┐
│                    MÔ HÌNH LSTM                        │
│                                                         │
│  🧠 Neural Network Architecture                        │
│  • Input Layer: (15, 15)                              │
│  • LSTM Layer 1: 50 units, return_sequences=True      │
│  • Dropout Layer: 0.2                                 │
│  • LSTM Layer 2: 30 units, return_sequences=False     │
│  • Dropout Layer: 0.2                                 │
│  • Output Layer: 1 unit (linear)                      │
│  • Loss Function: MSE                                 │
│  • Optimizer: Adam                                    │
└─────────────────────────────────────────────────────────┘
```

#### **3.2 Quá Trình Dự Đoán:**
```
┌─────────────────────────────────────────────────────────┐
│                QUÁ TRÌNH DỰ ĐOÁN                       │
│                                                         │
│  🎯 Prediction Process                                │
│  • Load trained model                                 │
│  • Prepare input sequence (15, 15)                    │
│  • Forward pass through LSTM                          │
│  • Generate prediction for next day                   │
│  • Repeat for 7 days                                  │
│  • Calculate confidence scores                        │
└─────────────────────────────────────────────────────────┘
```

### **4. HẬU XỬ LÝ DỮ LIỆU**

#### **4.1 Xử Lý Kết Quả:**
```
┌─────────────────────────────────────────────────────────┐
│                HẬU XỬ LÝ DỮ LIỆU                      │
│                                                         │
│  🔄 Post-processing                                   │
│  • Chuẩn hóa ngược (inverse scaling)                  │
│  • Làm tròn kết quả (số xe nguyên)                    │
│  • Tính toán độ tin cậy                               │
│  • Kiểm tra giới hạn hợp lý                           │
│  • Định dạng JSON cho API                             │
└─────────────────────────────────────────────────────────┘
```

#### **4.2 Cập Nhật Cơ Sở Dữ Liệu:**
```
┌─────────────────────────────────────────────────────────┐
│                CẬP NHẬT DỮ LIỆU                       │
│                                                         │
│  💾 Database Update                                   │
│  • Lưu kết quả dự đoán                                │
│  • Cập nhật thời gian dự đoán                         │
│  • Lưu độ tin cậy                                     │
│  • Ghi log hoạt động                                  │
│  • Backup dữ liệu                                     │
└─────────────────────────────────────────────────────────┘
```

### **5. HIỂN THỊ KẾT QUẢ**

#### **5.1 Giao Diện Người Dùng:**
```
┌─────────────────────────────────────────────────────────┐
│                GIAO DIỆN NGƯỜI DÙNG                   │
│                                                         │
│  🖥️ User Interface                                    │
│  • Dashboard chính                                     │
│  • Biểu đồ dự đoán 7 ngày                             │
│  • Thông tin thời tiết hiện tại                        │
│  • Độ tin cậy dự đoán                                 │
│  • Lịch sử dự đoán                                    │
│  • Xuất dữ liệu                                       │
└─────────────────────────────────────────────────────────┘
```

#### **5.2 API Response:**
```
┌─────────────────────────────────────────────────────────┐
│                API RESPONSE                            │
│                                                         │
│  📡 JSON Response                                     │
│  {                                                     │
│    "du_doan_hien_tai": 504,                           │
│    "do_tin_cay": 0.85,                                │
│    "du_bao": [                                        │
│      {"ngay": "2024-01-16", "nhu_cau": 520,           │
│       "do_tin_cay": 0.82},                            │
│      ...                                              │
│    ],                                                 │
│    "thong_tin_mo_hinh": {...}                         │
│  }                                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 **LUỒNG XỬ LÝ HOÀN CHỈNH**

### **Bước 1: Thu Thập Dữ Liệu**
```
1. Gọi API thời tiết (OpenWeatherMap)
2. Lấy dữ liệu lịch sử từ database
3. Kết hợp dữ liệu thời tiết và lịch sử
```

### **Bước 2: Xử Lý Dữ Liệu**
```
1. Làm sạch và chuẩn hóa dữ liệu
2. Tạo đặc trưng (features)
3. Tạo chuỗi thời gian (15 ngày × 15 đặc trưng)
4. Chuẩn bị đầu vào cho LSTM
```

### **Bước 3: Dự Đoán LSTM**
```
1. Load mô hình đã huấn luyện
2. Thực hiện forward pass
3. Dự đoán 7 ngày tiếp theo
4. Tính toán độ tin cậy
```

### **Bước 4: Hậu Xử Lý**
```
1. Chuẩn hóa ngược kết quả
2. Làm tròn và kiểm tra giới hạn
3. Định dạng kết quả
4. Cập nhật database
```

### **Bước 5: Hiển Thị**
```
1. Trả về JSON response
2. Hiển thị trên giao diện
3. Cập nhật biểu đồ real-time
4. Ghi log hoạt động
```

---

## ⚡ **TÍNH NĂNG BỔ SUNG**

### **Cache System:**
```
┌─────────────────────────────────────────────────────────┐
│                BỘ NHỚ ĐỆM                              │
│                                                         │
│  🚀 Redis Cache                                       │
│  • Cache dữ liệu thời tiết (5 phút)                   │
│  • Cache kết quả dự đoán (1 giờ)                      │
│  • Cache thông tin mô hình                            │
│  • Giảm thời gian phản hồi                            │
└─────────────────────────────────────────────────────────┘
```

### **Error Handling:**
```
┌─────────────────────────────────────────────────────────┐
│                XỬ LÝ LỖI                              │
│                                                         │
│  🛡️ Error Management                                  │
│  • Fallback khi API thời tiết lỗi                     │
│  • Sử dụng dữ liệu cache                              │
│  • Thông báo lỗi cho người dùng                       │
│  • Log lỗi để debug                                   │
└─────────────────────────────────────────────────────────┘
```

### **Monitoring:**
```
┌─────────────────────────────────────────────────────────┐
│                GIÁM SÁT HỆ THỐNG                      │
│                                                         │
│  📊 System Monitoring                                 │
│  • Hiệu suất dự đoán                                  │
│  • Thời gian phản hồi                                 │
│  • Tỷ lệ lỗi                                         │
│  • Sử dụng tài nguyên                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 **KẾT LUẬN**

Kiến trúc hệ thống này đảm bảo:

- ✅ **Độ tin cậy**: Xử lý lỗi và fallback
- ✅ **Hiệu suất**: Cache và tối ưu hóa
- ✅ **Khả năng mở rộng**: Modular design
- ✅ **Dễ bảo trì**: Monitoring và logging
- ✅ **Trải nghiệm người dùng**: Real-time updates

Luồng dữ liệu từ thu thập → xử lý → dự đoán → hậu xử lý → hiển thị đã được tối ưu hóa cho hiệu suất và độ chính xác cao nhất.
