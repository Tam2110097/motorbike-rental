# 🤖 LSTM NEURAL NETWORK - GIẢI THÍCH ĐƠN GIẢN
## Simple Explanation: From Input to Output

---

## 📊 MẨU DỮ LIỆU THỰC TẾ

### 🗓️ Dữ liệu 14 ngày lịch sử (Input Sequence)

**Dữ liệu đầu vào:** 14 ngày gần nhất với 13 features mỗi ngày

```
Ngày 1:  [420 xe, 13h, 24.5°C, 68%, 2.8m/s, 9.5km, 19.2°C, 3.2MJ, 0mm, Mùa xuân, Không lễ]
Ngày 2:  [435 xe, 13h, 25.2°C, 65%, 3.1m/s, 9.8km, 20.1°C, 3.5MJ, 0mm, Mùa xuân, Không lễ]
...
Ngày 14: [525 xe, 13h, 30.8°C, 53%, 2.7m/s, 11.0km, 25.2°C, 4.6MJ, 0mm, Mùa xuân, Không lễ]
```

**Xu hướng dữ liệu:**
- Nhu cầu thuê xe: Tăng từ 420 → 535 xe (tăng 27%)
- Nhiệt độ: Tăng từ 24.5°C → 31.5°C (tăng 7°C)
- Độ ẩm: Giảm từ 68% → 53% (giảm 15%)
- Thời tiết: Nắng đẹp, không mưa

---

## 🔄 LUỒNG XỬ LÝ DỮ LIỆU

### Bước 1: Data Preprocessing (Tiền xử lý dữ liệu)

**Mục đích:** Chuẩn hóa dữ liệu để LSTM có thể xử lý hiệu quả

**Công thức:** MinMaxScaler
```
Normalized_Value = (Original_Value - Min) / (Max - Min)
```

**Ví dụ:**
- Rented_Bikes: 420 → 0.000, 535 → 0.913
- Temperature: 24.5°C → 0.000, 31.5°C → 1.000
- Humidity: 68% → 1.000, 53% → 0.063

**Kết quả:** Dữ liệu được chuyển về range [0,1]

### Bước 2: Reshape Data (Định dạng lại dữ liệu)

**Mục đích:** Chuyển đổi format cho LSTM

**Công thức:** Reshape
```
Input: (14, 13) → Output: (1, 14, 13)
```

**Giải thích:**
- 1 sample (một lần dự đoán)
- 14 timesteps (14 ngày lịch sử)
- 13 features (13 đặc trưng mỗi ngày)

---

## 🧠 LSTM NEURAL NETWORK PROCESSING

### Bước 3: Model Architecture (Kiến trúc mạng)

**Mục đích:** Định nghĩa cấu trúc mạng neural

**Kiến trúc:**
```
Input (1, 14, 13)
    ↓
LSTM Layer 1 (50 neurons) → (1, 14, 50)
    ↓
Dropout (20%) → (1, 14, 50)
    ↓
LSTM Layer 2 (30 neurons) → (1, 30)
    ↓
Dropout (20%) → (1, 30)
    ↓
Dense Layer (1 neuron) → (1, 1)
```

**Giải thích từng layer:**
- **LSTM Layer 1:** Trích xuất patterns thời gian từ 14 ngày
- **Dropout:** Ngăn overfitting bằng cách loại bỏ 20% connections
- **LSTM Layer 2:** Tổng hợp thông tin từ layer 1
- **Dense Layer:** Tạo ra giá trị dự đoán cuối cùng

### Bước 4: Forward Pass (Luồng truyền tiến)

**Mục đích:** Thực hiện dự đoán qua mạng neural

**Công thức LSTM:**
```
ft = σ(Wf · [ht-1, xt] + bf)     # Forget gate
it = σ(Wi · [ht-1, xt] + bi)     # Input gate
C̃t = tanh(Wc · [ht-1, xt] + bc)  # Candidate values
Ct = ft * Ct-1 + it * C̃t         # Cell state
ot = σ(Wo · [ht-1, xt] + bo)     # Output gate
ht = ot * tanh(Ct)               # Hidden state
```

**Luồng xử lý:**
1. **Input:** (1, 14, 13) - 14 ngày với 13 features
2. **LSTM1:** (1, 14, 13) → (1, 14, 50) - Trích xuất 50 patterns mỗi ngày
3. **Dropout1:** (1, 14, 50) → (1, 14, 50) - Loại bỏ 20% connections
4. **LSTM2:** (1, 14, 50) → (1, 30) - Tổng hợp thành 30 features
5. **Dropout2:** (1, 30) → (1, 30) - Loại bỏ 20% connections
6. **Dense:** (1, 30) → (1, 1) - Tạo ra 1 giá trị dự đoán

**Kết quả:** 0.923 (giá trị đã chuẩn hóa)

### Bước 5: Inverse Scaling (Chuyển về giá trị thực)

**Mục đích:** Chuyển giá trị chuẩn hóa về giá trị thực tế

**Công thức:** Inverse MinMaxScaler
```
Original_Value = Normalized_Value × (Max - Min) + Min
```

**Ví dụ:**
- Input: 0.923 (scaled)
- Output: 542.3 xe (actual)

**Kết quả:** Dự đoán 542.3 xe cho ngày tiếp theo

---

## 📊 GENERATE 7-DAY FORECAST

### Bước 6: Tạo dự báo 7 ngày

**Mục đích:** Tạo dự báo cho 7 ngày tiếp theo với biến thể theo ngày trong tuần

**Công thức:**
```
Day_Prediction = Base_Prediction × Day_Variation + Noise
```

**Day Variation Factors:**
- **Weekend (Thứ 7, Chủ nhật):** 0.95 - 1.15 (tăng 5-15%)
- **Weekday (Thứ 2, Thứ 3):** 0.85 - 0.95 (giảm 5-15%)
- **Mid-week (Thứ 4, 5, 6):** 0.90 - 1.05 (biến động nhẹ)

**Ví dụ kết quả:**
```
2024-01-15 (Thứ 2): 515 xe (factor: 0.95, noise: +5)
2024-01-16 (Thứ 3): 498 xe (factor: 0.92, noise: -3)
2024-01-17 (Thứ 4): 528 xe (factor: 0.97, noise: +2)
2024-01-18 (Thứ 5): 545 xe (factor: 1.00, noise: +3)
2024-01-19 (Thứ 6): 560 xe (factor: 1.03, noise: +1)
2024-01-20 (Thứ 7): 585 xe (factor: 1.08, noise: +4)
2024-01-21 (Chủ nhật): 572 xe (factor: 1.05, noise: -2)
```

---

## 🎯 FINAL OUTPUT

### Bước 7: Tạo response JSON

**Mục đích:** Tạo response hoàn chỉnh cho client

**Cấu trúc output:**
```json
{
  "success": true,
  "data": {
    "city": "Hanoi",
    "forecast": [
      {
        "date": "2024-01-15",
        "predictedRentals": 515,
        "confidence": 0.87
      }
      // ... 6 ngày nữa
    ],
    "modelInfo": {
      "type": "LSTM Neural Network",
      "accuracy": "87-92%",
      "confidence": 0.87
    },
    "summary": {
      "averageDemand": 543,
      "peakDay": "2024-01-20",
      "peakDemand": 585,
      "trend": "increasing"
    }
  }
}
```

---

## 📈 VISUALIZATION OF THE PROCESS

### Minh họa luồng dữ liệu

```
┌─────────────────────────────────────────────────────────────┐
│                    LSTM PROCESSING FLOW                     │
└─────────────────────────────────────────────────────────────┘

1. INPUT DATA (14 days × 13 features)
   ┌─────────────────────────────────────────────────────────┐
   │ 420 xe, 24.5°C, 68%, 2.8m/s, ... (14 ngày)             │
   └─────────────────────────────────────────────────────────┘
                                    ↓
2. NORMALIZATION (MinMaxScaler)
   ┌─────────────────────────────────────────────────────────┐
   │ 0.000, 0.000, 1.000, 0.400, ... (range [0,1])          │
   └─────────────────────────────────────────────────────────┘
                                    ↓
3. RESHAPE (1, 14, 13)
   ┌─────────────────────────────────────────────────────────┐
   │ 1 sample, 14 timesteps, 13 features                     │
   └─────────────────────────────────────────────────────────┘
                                    ↓
4. LSTM LAYER 1 (50 neurons)
   ┌─────────────────────────────────────────────────────────┐
   │ Trích xuất 50 patterns thời gian từ 14 ngày             │
   └─────────────────────────────────────────────────────────┘
                                    ↓
5. DROPOUT 1 (20%)
   ┌─────────────────────────────────────────────────────────┐
   │ Loại bỏ 20% connections để tránh overfitting            │
   └─────────────────────────────────────────────────────────┘
                                    ↓
6. LSTM LAYER 2 (30 neurons)
   ┌─────────────────────────────────────────────────────────┐
   │ Tổng hợp thành 30 features cuối cùng                    │
   └─────────────────────────────────────────────────────────┘
                                    ↓
7. DROPOUT 2 (20%)
   ┌─────────────────────────────────────────────────────────┐
   │ Loại bỏ 20% connections                                 │
   └─────────────────────────────────────────────────────────┘
                                    ↓
8. DENSE LAYER (1 neuron)
   ┌─────────────────────────────────────────────────────────┐
   │ Tạo ra 1 giá trị dự đoán (0.923)                        │
   └─────────────────────────────────────────────────────────┘
                                    ↓
9. INVERSE SCALING
   ┌─────────────────────────────────────────────────────────┐
   │ Chuyển về giá trị thực: 542.3 xe                        │
   └─────────────────────────────────────────────────────────┘
                                    ↓
10. 7-DAY FORECAST
    ┌─────────────────────────────────────────────────────────┐
    │ 515, 498, 528, 545, 560, 585, 572 xe                   │
    └─────────────────────────────────────────────────────────┘
```

---

## 🔍 KEY INSIGHTS

### Phân tích kết quả

**📊 Thống kê dự báo:**
- Trung bình: 543.1 xe/ngày
- Cao nhất: 585 xe (Thứ 7)
- Thấp nhất: 498 xe (Thứ 3)
- Tổng tuần: 3,802 xe

**📈 Xu hướng:**
- Tăng so với tuần trước: 12.8%
- Peak day: Thứ 7 (cuối tuần)
- Low day: Thứ 3 (giữa tuần)

**🎯 Độ tin cậy:**
- Confidence: 87%
- Model accuracy: 87-92%
- Weather stability: High (nắng đẹp)
- Data quality: Excellent

**💡 Business Insights:**
- Chuẩn bị 585 xe cho thứ 7 (peak)
- Giảm xe vào thứ 3 (lowest demand)
- Tăng nhân viên cuối tuần
- Dynamic pricing: Tăng giá cuối tuần

---

## 🎯 CONCLUSION

### Tóm tắt quá trình xử lý

**🔍 QUÁ TRÌNH XỬ LÝ LSTM:**

1. **📥 INPUT:** 14 ngày lịch sử với 13 features mỗi ngày
   - Dữ liệu thực tế: 420-535 xe/ngày
   - Thời tiết: Nắng đẹp, nhiệt độ tăng
   - Xu hướng: Tăng dần theo thời gian

2. **🔄 PREPROCESSING:**
   - Normalization: Chuyển về range [0,1]
   - Reshape: (14,13) → (1,14,13)
   - Chuẩn bị cho LSTM input

3. **🧠 LSTM PROCESSING:**
   - Layer 1: 14×13 → 14×50 (extract temporal patterns)
   - Layer 2: 14×50 → 30 (final hidden state)
   - Output: 30 → 1 (single prediction)

4. **📊 POSTPROCESSING:**
   - Inverse scaling: 0.923 → 542.3 xe
   - 7-day forecast với weekend effects
   - Confidence calculation

5. **📤 OUTPUT:** JSON response với 7 ngày dự báo
   - Range: 498-585 xe/ngày
   - Trend: Tăng dần
   - Confidence: 87%

---

*Ví dụ này minh họa cách LSTM Neural Network xử lý dữ liệu thực tế từ input đến output, bao gồm tất cả các bước preprocessing, forward pass, và postprocessing để tạo ra dự báo chính xác.*
