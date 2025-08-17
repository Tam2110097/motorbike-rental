# HỆ THỐNG DỰ ĐOÁN NHU CẦU THUÊ XE MÁY - MÔ HÌNH TỔNG QUÁT

## 🏗️ **KIẾN TRÚC HỆ THỐNG LSTM**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                GIAO DIỆN NGƯỜI DÙNG                            │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Bảng Điều Khiển│    │  Biểu Đồ Dự Đoán │    │  Thông Tin Thời Tiết │      │
│  │                 │    │                 │    │                 │            │
│  │ • Chọn Thành Phố│    │ • Biểu Đồ 7 Ngày│    │ • Nhiệt Độ Hiện Tại│        │
│  │ • Dự Đoán Ngay  │    │ • Khoảng Tin Cậy│    │ • Độ Ẩm         │            │
│  │ • Xem Lịch Sử   │    │ • Đường Xu Hướng│    │ • Tốc Độ Gió    │            │
│  │ • Xuất Dữ Liệu  │    │ • Độ Tin Cậy    │    │ • Tầm Nhìn      │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
│           │                       │                       │                    │
│           └───────────────────────┼───────────────────────┘                    │
│                                   ▼                                            │
│                          ┌─────────────────┐                                  │
│                          │   Khách Hàng API│                                  │
│                          │                 │                                  │
│                          │ • Yêu Cầu HTTP  │                                  │
│                          │ • Phản Hồi JSON │                                  │
│                          │ • Xử Lý Lỗi     │                                  │
│                          └─────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                MÁY CHỦ BACKEND                                 │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Máy Chủ Express.js                            │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │ │
│  │  │   Đường Dẫn API │    │  Phần Mềm Trung Gian│    │  Dịch Vụ       │        │ │
│  │  │                 │    │                 │    │                 │        │ │
│  │  │ • /dự-đoán     │    │ • Xác Thực      │    │ • Thời Tiết     │        │ │
│  │  │ • /thời-tiết   │    │ • Kiểm Tra      │    │ • Dữ Liệu       │        │ │
│  │  │ • /mô-hình     │    │ • CORS          │    │ • Dự Đoán       │        │ │
│  │  │ • /tình-trạng  │    │ • Giới Hạn Tốc Độ│    │ • Dự Báo        │        │ │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                           │                                      │
│                                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                            Dịch Vụ Dự Đoán                                 │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │ │
│  │  │ API Thời Tiết   │    │ Xử Lý Dữ Liệu   │    │ Mô Hình LSTM    │        │ │
│  │  │                 │    │                 │    │                 │        │ │
│  │  │ • OpenWeather   │    │ • Dữ Liệu Lịch Sử│    │ • Quy Trình Python│      │ │
│  │  │ • Thời Gian Thực│    │ • Kỹ Thuật Đặc Trưng│    │ • Mạng Nơ-ron   │        │ │
│  │  │ • Bộ Nhớ Đệm    │    │ • Chuẩn Hóa     │    │ • Dự Đoán       │        │ │
│  │  │ • Xử Lý Lỗi     │    │ • Mã Hóa        │    │ • Độ Tin Cậy    │        │ │
│  │  │                 │    │ • Tạo Chuỗi     │    │ • Thông Tin Mô Hình│      │ │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                MÔ HÌNH LSTM                                    │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                              Quy Trình Python                              │ │
│  │                                                                             │ │
│  │  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │ │
│  │  │ Dữ Liệu Đầu Vào │    │ Các Lớp LSTM    │    │ Dữ Liệu Đầu Ra  │        │ │
│  │  │                 │    │                 │    │                 │        │ │
│  │  │ • 15 ngày       │    │ • LSTM(50)      │    │ • Dự Đoán       │        │ │
│  │  │ • 15 đặc trưng  │    │ • Loại Bỏ(0.2)  │    │ • Độ Tin Cậy    │        │ │
│  │  │ • Thời tiết     │    │ • LSTM(30)      │    │ • Dự Báo 7 Ngày │        │ │
│  │  │ • Lịch sử       │    │ • Loại Bỏ(0.2)  │    │ • Thông Tin Mô Hình│      │ │
│  │  │ • Đã chuẩn hóa  │    │ • Dày Đặc(1)    │    │ • Định Dạng JSON│        │ │
│  │  └─────────────────┘    └─────────────────┘    └─────────────────┘        │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                LỚP DỮ LIỆU                                     │
│                                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐            │
│  │   Cơ Sở Dữ Liệu │    │  Bộ Nhớ Đệm     │    │  API Bên Ngoài  │            │
│  │                 │    │                 │    │                 │            │
│  │ • Dữ Liệu Lịch Sử│    │ • Thời Tiết     │    │ • OpenWeather   │            │
│  │ • Dự Báo        │    │ • Dự Đoán       │    │ • Google Maps   │            │
│  │ • Hiệu Suất     │    │ • Thông Tin Mô Hình│    │ • Dữ Liệu Giao Thông│      │
│  │ • Dữ Liệu Người Dùng│    │ • Phiên Làm Việc│    │ • Dữ Liệu Sự Kiện│        │
│  │ • Lịch Sử Dự Đoán│    │ • Giới Hạn Tốc Độ│    │                 │            │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 **LUỒNG DỮ LIỆU TỔNG QUÁT**

### **1. LUỒNG DỰ ĐOÁN**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Giao Diện  │───▶│   Máy Chủ   │───▶│  Quy Trình  │───▶│  Mô Hình    │
│  Người Dùng │    │   Backend   │    │  Python     │    │  LSTM       │
│             │    │             │    │             │    │             │
│ Đầu Vào     │    │ Gọi API     │    │ Chuẩn Bị    │    │ Dự Đoán     │
│ Thành Phố   │    │ Thời Tiết   │    │ Dữ Liệu     │    │ Mạng Nơ-ron │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │                   │
       │                   ▼                   ▼                   ▼
       │            ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
       └────────────│  Phản Hồi   │◀───│  Đầu Ra     │◀───│  Kết Quả    │
                    │  JSON       │    │  JSON       │    │  Dự Báo     │
                    │  Dự Báo     │    │  Độ Tin Cậy │    │  7 Ngày     │
                    │  Biểu Đồ    │    │  Thông Tin  │    │  Độ Tin Cậy │
                    └─────────────┘    └─────────────┘    └─────────────┘
```

### **2. LUỒNG DỮ LIỆU CHI TIẾT**

#### **Luồng Đầu Vào:**
1. **Giao Diện Người Dùng**: Người dùng chọn thành phố và nhấn "Dự Đoán"
2. **Máy Chủ Backend**: Nhận yêu cầu, gọi API Thời Tiết
3. **Xử Lý Dữ Liệu**: Lấy dữ liệu lịch sử, kỹ thuật đặc trưng
4. **Quy Trình Python**: Chuẩn hóa, mã hóa, chuẩn bị đầu vào LSTM
5. **Mô Hình LSTM**: Chuyển tiếp với 15 ngày × 15 đặc trưng

#### **Luồng Đầu Ra:**
1. **Mô Hình LSTM**: Dự đoán + độ tin cậy + dự báo 7 ngày
2. **Quy Trình Python**: Chuẩn hóa ngược, định dạng JSON
3. **Máy Chủ Backend**: Phản hồi API với xử lý lỗi
4. **Giao Diện Người Dùng**: Hiển thị biểu đồ và cập nhật thời gian thực

## 📊 **DỮ LIỆU CHÍNH**

### **Dữ Liệu Đầu Vào:**
```python
# 15 ngày dữ liệu (14 lịch sử + 1 hiện tại)
du_lieu_dau_vao = [
    # 14 ngày lịch sử
    [420, 14, 24.5, 68, 2.8, 9.5, 19.2, 3.2, 0, 0, 1, 0, 0, 1, 0],  # Ngày 1
    [435, 14, 25.2, 65, 3.1, 9.8, 20.1, 3.5, 0, 0, 1, 0, 0, 1, 0],  # Ngày 2
    # ... 12 ngày nữa
    [525, 14, 30.8, 53, 2.7, 11.0, 25.2, 4.6, 0, 0, 1, 0, 0, 1, 0], # Ngày 14
    
    # Ngày hôm nay (có thời tiết, chưa có số xe)
    [0, 14, 28.5, 65, 3.2, 10.5, 22.1, 4.2, 0, 0, 1, 0, 0, 1, 0]     # Ngày 15
]
# Hình dạng: (15, 15) - 15 ngày, 15 đặc trưng mỗi ngày
```

### **Dữ Liệu Đầu Ra:**
```python
# Kết quả dự đoán
du_lieu_dau_ra = {
    "du_doan_hien_tai": 504,
    "do_tin_cay": 0.85,
    "du_bao": [
        {"ngay": "2024-01-16", "nhu_cau": 520, "do_tin_cay": 0.82},
        {"ngay": "2024-01-17", "nhu_cau": 535, "do_tin_cay": 0.79},
        {"ngay": "2024-01-18", "nhu_cau": 510, "do_tin_cay": 0.76},
        {"ngay": "2024-01-19", "nhu_cau": 495, "do_tin_cay": 0.73},
        {"ngay": "2024-01-20", "nhu_cau": 480, "do_tin_cay": 0.70},
        {"ngay": "2024-01-21", "nhu_cau": 465, "do_tin_cay": 0.67},
        {"ngay": "2024-01-22", "nhu_cau": 450, "do_tin_cay": 0.64}
    ],
    "thong_tin_mo_hinh": {
        "loai_mo_hinh": "Mạng Nơ-ron LSTM",
        "hinh_dang_dau_vao": "(15, 15)",
        "cac_lop": ["LSTM(50)", "Loại Bỏ(0.2)", "LSTM(30)", "Loại Bỏ(0.2)", "Dày Đặc(1)"],
        "do_chinh_xac": 0.87,
        "cap_nhat_cuoi": "2024-01-15T10:30:00Z"
    }
}
```

## 🔧 **CÁC THÀNH PHẦN CHÍNH**

### **Giao Diện Người Dùng:**
- **Bảng Điều Khiển**: Giao diện chính, chọn thành phố
- **Biểu Đồ Dự Đoán**: Biểu đồ 7 ngày với độ tin cậy
- **Thông Tin Thời Tiết**: Thông tin thời tiết hiện tại
- **Khách Hàng API**: Yêu cầu HTTP, xử lý JSON

### **Máy Chủ Backend:**
- **Đường Dẫn API**: Điểm cuối cho dự đoán, thời tiết, mô hình
- **Phần Mềm Trung Gian**: Xác thực, kiểm tra, CORS
- **Dịch Vụ**: API Thời Tiết, xử lý dữ liệu, dự đoán
- **Xử Lý Lỗi**: Cơ chế dự phòng

### **Mô Hình LSTM:**
- **Dữ Liệu Đầu Vào**: 15 ngày × 15 đặc trưng
- **Các Lớp LSTM**: 50 nơ-ron → 30 nơ-ron → 1 đầu ra
- **Dữ Liệu Đầu Ra**: Dự đoán + độ tin cậy + dự báo 7 ngày
- **Quy Trình Python**: Tiền xử lý dữ liệu, thực thi mô hình

### **Lớp Dữ Liệu:**
- **Cơ Sở Dữ Liệu**: Dữ liệu lịch sử, dự báo, hiệu suất
- **Bộ Nhớ Đệm**: Dữ liệu thời tiết, dự đoán, thông tin mô hình
- **API Bên Ngoài**: OpenWeatherMap, Google Maps, Giao Thông

## ⚡ **TÍNH NĂNG CHÍNH**

### **Tính Năng Dự Đoán:**
- **Thời Gian Thực**: Dự đoán dựa trên thời tiết hiện tại
- **Dự Báo 7 Ngày**: Dự đoán 7 ngày tiếp theo
- **Điểm Độ Tin Cậy**: Độ tin cậy của dự đoán
- **Nhiều Thành Phố**: Hỗ trợ nhiều thành phố

### **Tính Năng Hiệu Suất:**
- **Bộ Nhớ Đệm**: Redis cache cho truy cập nhanh
- **Dự Phòng**: Đặc trưng có trọng số khi LSTM lỗi
- **Cân Bằng Tải**: Nhiều quy trình Python
- **Xử Lý Lỗi**: Giảm thiểu lỗi một cách mượt mà

### **Tính Năng Người Dùng:**
- **Biểu Đồ Tương Tác**: Biểu đồ có thể tương tác
- **Xuất Dữ Liệu**: Xuất dữ liệu dự đoán
- **Xem Lịch Sử**: Xem lịch sử dự đoán
- **Cập Nhật Thời Gian Thực**: Cập nhật theo thời gian thực

Mô hình này đơn giản nhưng đầy đủ, thể hiện rõ luồng dữ liệu từ Giao Diện Người Dùng đến Mô Hình LSTM và ngược lại, với các thành phần chính và tính năng quan trọng!
