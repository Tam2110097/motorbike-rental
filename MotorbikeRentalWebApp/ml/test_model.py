import numpy as np
import joblib
from tensorflow.keras.models import load_model

# Load model
model = load_model('ml/model/lstm_model_7days.h5')

# Load scaler để inverse lại kết quả
scaler = joblib.load('ml/data/scaler.save')

# Load dữ liệu
X = np.load('ml/data/X.npy')
y_true = np.load('ml/data/y.npy')

# Dự đoán
y_pred = model.predict(X)

# Inverse scale kết quả (chỉ cột target)
target_index = -1  # Cột target thường là cột cuối nếu không thay đổi gì

# Hàm inverse scale cho từng giá trị
def inverse_scale(scaled, index):
    dummy = np.zeros((len(scaled), scaler.scale_.shape[0]))
    dummy[:, index] = scaled[:, 0]
    return scaler.inverse_transform(dummy)[:, index]

# Inverse y_true và y_pred (chỉ reshape nếu là 2D)
if y_pred.shape[1] == 7:
    y_pred_inv = inverse_scale(y_pred, target_index)
    y_true_inv = inverse_scale(y_true, target_index)
else:
    print("⚠️ Output không có shape (samples, 7), kiểm tra lại model hoặc dữ liệu.")
    exit()

# So sánh
import matplotlib.pyplot as plt

plt.figure(figsize=(10, 5))
plt.plot(y_true_inv[:50], label='Actual')
plt.plot(y_pred_inv[:50], label='Predicted')
plt.title('Dự đoán vs Thực tế (7 ngày đầu tiên)')
plt.xlabel('Samples')
plt.ylabel('Rented Bike Count')
plt.legend()
plt.grid()
plt.show()
