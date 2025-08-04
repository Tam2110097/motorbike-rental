import pandas as pd

def load_and_prepare_data(file_path):
    data = pd.read_csv(file_path)

    # Chuyển đổi cột 'Date' về dạng datetime
    data['Date'] = pd.to_datetime(data['Date'], format='%Y-%m-%d')

    # Gộp dữ liệu theo ngày
    daily_data = data.groupby('Date').agg({
        'Rented Bike Count': 'sum',
        'Hour': 'mean',
        'Temperature(°C)': 'mean',
        'Humidity(%)': 'mean',
        'Wind speed (m/s)': 'mean',
        'Visibility (10m)': 'mean',
        'Dew point temperature(°C)': 'mean',
        'Solar Radiation (MJ/m2)': 'mean',
        'Rainfall(mm)': 'sum',
        'Season': 'first',
        'Holiday': 'first'
    }).reset_index()

    # Làm tròn các cột số
    daily_data = daily_data.round(2)

    return daily_data

# Test the function
if __name__ == "__main__":
    data = load_and_prepare_data('ml/data/motorbike_demand_dataset.csv')
    data.to_csv('ml/data/daily_processed.csv', index=False)
    print("✅ Dữ liệu đã được xử lý và lưu vào 'daily_processed.csv'")
    print(data.head())

