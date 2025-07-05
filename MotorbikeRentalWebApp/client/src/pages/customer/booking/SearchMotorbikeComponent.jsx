import React, { useEffect, useState } from 'react'
import { Tabs, Select, Space, DatePicker, Button, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';

const containerStyle = {
    width: '1000px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    margin: '30px auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
};

const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '10px',
};

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '30%',
    minWidth: '200px',
};

const SearchMotorbikeComponent = () => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startCity, setStartCity] = useState('');
    const [endCity, setEndCity] = useState('');
    const [cityOptions, setCityOptions] = useState([]);
    const navigate = useNavigate();

    const getAllCities = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/customer/city/get-all');
            if (res.data.success) {
                setCityOptions(res.data.cities);
            }
            else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error('Lỗi khi lấy danh sách thành phố');
            console.log(error);
        }
    }

    const handleSearch = () => {
        console.log(startTime, endTime, startDate, endDate, startCity, endCity);
        if (!startTime || !endTime || !startDate || !endDate || !startCity || !endCity) {
            message.error('Vui lòng chọn đầy đủ thông tin');
            return;
        }
        navigate('/search/motorbike', {
            state: {
                startTime,
                endTime,
                startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
                endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
                startCity,
                endCity
            }
        });
    };

    const resetForm = () => {
        setStartTime('');
        setEndTime('');
        setStartDate('');
        setEndDate('');
        setStartCity('');
        setEndCity('');
    }

    useEffect(() => {
        resetForm();
        getAllCities();
    }, []);

    const startTimeOptions = [
        { value: '08:00', label: '08:00 AM' },
        { value: '08:30', label: '08:30 AM' },
        { value: '09:00', label: '09:00 AM' },
        { value: '09:30', label: '09:30 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '10:30', label: '10:30 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '11:30', label: '11:30 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '12:30', label: '12:30 PM' },
        { value: '13:00', label: '13:00 PM' },
        { value: '13:30', label: '13:30 PM' },
        { value: '14:00', label: '14:00 PM' },
        { value: '14:30', label: '14:30 PM' },
        { value: '15:00', label: '15:00 PM' },
        { value: '15:30', label: '15:30 PM' },
        { value: '16:00', label: '16:00 PM' },
        { value: '16:30', label: '16:30 PM' },
        { value: '17:00', label: '17:00 PM' },
    ]

    const endTimeOptions = [
        { value: '08:00', label: '08:00 AM' },
        { value: '08:30', label: '08:30 AM' },
        { value: '09:00', label: '09:00 AM' },
        { value: '09:30', label: '09:30 AM' },
        { value: '10:00', label: '10:00 AM' },
        { value: '10:30', label: '10:30 AM' },
        { value: '11:00', label: '11:00 AM' },
        { value: '11:30', label: '11:30 AM' },
        { value: '12:00', label: '12:00 PM' },
        { value: '12:30', label: '12:30 PM' },
        { value: '13:00', label: '13:00 PM' },
        { value: '13:30', label: '13:30 PM' },
        { value: '14:00', label: '14:00 PM' },
        { value: '14:30', label: '14:30 PM' },
        { value: '15:00', label: '15:00 PM' },
        { value: '15:30', label: '15:30 PM' },
        { value: '16:00', label: '16:00 PM' },
        { value: '16:30', label: '16:30 PM' },
        { value: '17:00', label: '17:00 PM' },
        { value: '17:30', label: '17:30 PM' },
        { value: '18:00', label: '18:00 PM' },
        { value: '18:30', label: '18:30 PM' },
        { value: '19:00', label: '19:00 PM' },
    ];

    const startCityOptions = cityOptions.map((city) => ({
        value: city._id,
        label: city.city,
    }));

    const endCityOptions = cityOptions.map((city) => ({
        value: city._id,
        label: city.city,
    }));

    return (
        <>
            <h1 style={{ textAlign: 'center', margin: '30px 0', color: 'white' }}>Tìm kiếm xe máy</h1>
            <div style={containerStyle}>
                <Tabs
                    defaultActiveKey="search"
                    items={[
                        {
                            key: "search",
                            label: <Link to="#" style={{ textDecoration: 'none', color: 'black' }}>Tìm kiếm</Link>,
                        },
                        {
                            key: "pricing",
                            label: <Link to="#" style={{ textDecoration: 'none', color: 'black' }}>Bảng giá</Link>,
                        },
                    ]}
                />

                {/* Bắt đầu */}
                <div>
                    <div style={sectionTitleStyle}>Bắt đầu</div>
                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label>Thành phố bắt đầu</label>
                            <Select
                                value={startCity}
                                placeholder="Chọn thành phố"
                                style={{ width: '100%' }}
                                onChange={(value) => setStartCity(value)}
                                options={startCityOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label>Ngày bắt đầu</label>
                            <DatePicker style={{ width: '100%' }} onChange={(value) => setStartDate(value)} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label>Thời gian bắt đầu</label>
                            <Select
                                value={startTime}
                                placeholder="Chọn thời gian"
                                style={{ width: '100%' }}
                                onChange={(value) => setStartTime(value)}
                                options={startTimeOptions}
                            />
                        </div>
                    </div>
                </div>

                {/* Kết thúc */}
                <div>
                    <div style={sectionTitleStyle}>Kết thúc</div>
                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label>Thành phố kết thúc</label>
                            <Select
                                value={endCity}
                                placeholder="Chọn thành phố"
                                style={{ width: '100%' }}
                                onChange={(value) => setEndCity(value)}
                                options={endCityOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label>Ngày kết thúc</label>
                            <DatePicker style={{ width: '100%' }} onChange={(value) => setEndDate(value)} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label>Thời gian kết thúc</label>
                            <Select
                                value={endTime}
                                placeholder="Chọn thời gian"
                                style={{ width: '100%' }}
                                onChange={(value) => setEndTime(value)}
                                options={endTimeOptions}
                            />
                        </div>
                    </div>
                </div>

                {/* Nút tìm kiếm */}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <p style={{ textAlign: 'center', fontSize: '16px', marginBottom: '10px' }}>
                        🔍 Vui lòng chọn địa điểm và thời gian nhận/trả xe để tìm kiếm các xe phù hợp.
                    </p>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSearch}

                    >Tìm xe</Button>
                </div>
            </div>
        </>
    );
};

export default SearchMotorbikeComponent;
