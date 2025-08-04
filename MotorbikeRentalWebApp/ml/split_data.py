import pandas as pd
from sklearn.model_selection import train_test_split
from data_preparation import load_and_prepare_data

def split_and_save_data():
    # Load dữ liệu đã chuẩn hóa
    data = load_and_prepare_data('ml/data/motorbike_demand_dataset.csv')

    # Chọn đặc trưng đầu vào (features) và đầu ra (target)
    X = data.drop(['Rented Bike Count', 'Date'], axis=1)
    y = data['Rented Bike Count']

    # Chia dữ liệu: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # Lưu ra file để sử dụng sau
    X_train.to_csv('ml/data/X_train.csv', index=False)
    X_test.to_csv('ml/data/X_test.csv', index=False)
    y_train.to_csv('ml/data/y_train.csv', index=False)
    y_test.to_csv('ml/data/y_test.csv', index=False)

    print("✅ Đã chia và lưu dữ liệu thành công.")

if __name__ == '__main__':
    split_and_save_data()


