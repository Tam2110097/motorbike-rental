import React, { useEffect, useState } from 'react'
import { Tabs, Select, Space, DatePicker, Button, message, Checkbox } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios';
import { useBooking } from '../../../context/BookingContext'

const containerStyle = {
    width: '1000px',
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    margin: '20px auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
    border: '1px solid rgba(0, 0, 0, 0.05)',
};

const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    color: '#1a1a1a',
    position: 'relative',
    paddingLeft: '15px',
    borderLeft: '4px solid #1890ff',
};

const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '25px',
    flexWrap: 'wrap',
};

const inputGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '30%',
    minWidth: '220px',
    flex: 1,
};

const labelStyle = {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
};

const selectStyle = {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #d9d9d9',
    transition: 'all 0.3s ease',
};

const datePickerStyle = {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #d9d9d9',
    transition: 'all 0.3s ease',
};

const buttonContainerStyle = {
    textAlign: 'center',
    marginTop: '30px',
    padding: '30px',
    backgroundColor: '#f8f9fa',
    borderRadius: '15px',
    border: '1px solid #e9ecef',
};

const descriptionStyle = {
    textAlign: 'center',
    fontSize: '16px',
    marginBottom: '20px',
    color: '#666',
    lineHeight: '1.6',
    padding: '0 20px',
};

const searchButtonStyle = {
    height: '50px',
    padding: '0 40px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)',
    transition: 'all 0.3s ease',
};

const pageTitleStyle = {
    textAlign: 'center',
    margin: '80px auto 30px auto',
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '15px 25px',
    borderRadius: '12px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 10,
};

const sectionContainerStyle = {
    backgroundColor: '#fafafa',
    padding: '25px',
    borderRadius: '15px',
    border: '1px solid #f0f0f0',
    transition: 'all 0.3s ease',
};

const SearchMotorbikeComponent = () => {
    const { setBookingData } = useBooking();
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startBranch, setStartBranch] = useState('');
    const [endBranch, setEndBranch] = useState('');
    const [branchOptions, setBranchOptions] = useState([]);

    // Trip context states
    const [purpose, setPurpose] = useState('');
    const [distanceCategory, setDistanceCategory] = useState('');
    const [numPeople, setNumPeople] = useState('');
    const [terrain, setTerrain] = useState('');
    const [luggage, setLuggage] = useState('');
    const [preferredFeatures, setPreferredFeatures] = useState([]);

    const navigate = useNavigate();

    const getAllBranches = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/customer/branch/get-all');
            if (res.data.success) {
                setBranchOptions(res.data.branches);
                console.log(res.data.branches);
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
        console.log(startTime, endTime, startDate, endDate, startBranch, endBranch, purpose, distanceCategory, numPeople, terrain, luggage, preferredFeatures);
        if (!startTime || !endTime || !startDate || !endDate || !startBranch || !endBranch) {
            message.error('Vui lòng chọn đầy đủ thông tin');
            return;
        }
        if (endDate.isBefore(startDate)) {
            return message.error('Ngày kết thúc không được trước ngày bắt đầu');
        }
        // console.log('startDate', startDate);
        // console.log('endDate', endDate);
        // console.log('startTime', startTime);
        // console.log('endTime', endTime);
        // console.log('startBranch', startBranch);
        // console.log('endBranch', endBranch);
        // console.log('purpose', purpose);
        // console.log('distanceCategory', distanceCategory);
        // console.log('numPeople', numPeople);
        // console.log('terrain', terrain);
        // console.log('luggage', luggage);
        // console.log('preferredFeatures', preferredFeatures);
        setBookingData({
            startTime,
            endTime,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            startBranch,
            endBranch,
            tripContext: {
                purpose,
                distanceCategory,
                numPeople,
                terrain,
                luggage,
                preferredFeatures,
            },
            motorbikes: [],
        });
        navigate('/booking/available-motorbike');
    };

    useEffect(() => {
        if (branchOptions.length === 0) {
            getAllBranches();
        }
    }, []);

    const getValidEndTimeOptions = () => {
        if (!startDate || !endDate || !startTime) return endTimeOptions;

        const isSameDay = startDate.isSame(endDate, 'day');
        if (!isSameDay) return endTimeOptions;

        const startTotalMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);

        return endTimeOptions.map(({ value, label }) => {
            const endTotalMinutes = parseInt(value.split(':')[0]) * 60 + parseInt(value.split(':')[1]);
            return {
                value,
                label,
                disabled: (endTotalMinutes - startTotalMinutes) < 120, // 2 tiếng = 120 phút
            };
        });
    };


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

    const startBranchOptions = branchOptions.map((branch) => ({
        value: branch._id,
        label: branch.city,
    }));

    const endBranchOptions = branchOptions.map((branch) => ({
        value: branch._id,
        label: branch.city,
    }));

    const purposeOptions = [
        { value: 'leisure', label: 'Đi dạo' },
        { value: 'tour', label: 'Du lịch' },
        { value: 'work', label: 'Công việc' },
        { value: 'delivery', label: 'Giao hàng' },
        { value: 'other', label: 'Khác' },
    ];

    const distanceCategoryOptions = [
        { value: 'short', label: 'Ngắn (< 50km)' },
        { value: 'medium', label: 'Trung bình (50-200km)' },
        { value: 'long', label: 'Dài (> 200km)' },
    ];

    const numPeopleOptions = [
        { value: 1, label: '1 người' },
        { value: 2, label: '2 người' },
    ];

    const terrainOptions = [
        { value: 'mountain', label: 'Đường núi' },
        { value: 'urban', label: 'Đô thị' },
        { value: 'mixed', label: 'Hỗn hợp' },
    ];

    const luggageOptions = [
        { value: 'heavy', label: 'Nhiều hành lý' },
        { value: 'light', label: 'Ít hành lý' },
    ];

    const preferredFeaturesOptions = [
        { value: 'fuel-saving', label: 'Tiết kiệm nhiên liệu' },
        { value: 'easy-to-ride', label: 'Dễ lái' },
    ];

    return (
        <div style={{ paddingTop: '500px' }}>
            <h1 style={pageTitleStyle}>🏍️ Tìm kiếm xe máy</h1>
            <div style={containerStyle}>
                <Tabs
                    defaultActiveKey="search"
                    items={[
                        {
                            key: "search",
                            label: <Link to="#" style={{ textDecoration: 'none', color: 'black', fontWeight: '600' }}>Tìm kiếm</Link>,
                        },
                        {
                            key: "pricing",
                            label: <Link to="#" style={{ textDecoration: 'none', color: 'black', fontWeight: '600' }}>Bảng giá</Link>,
                        },
                    ]}
                />

                {/* Bắt đầu */}
                <div style={sectionContainerStyle}>
                    <div style={sectionTitleStyle}>📍 Bắt đầu</div>
                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Thành phố bắt đầu</label>
                            <Select
                                value={startBranch}
                                placeholder="Chọn thành phố"
                                style={selectStyle}
                                onChange={(value) => setStartBranch(value)}
                                options={startBranchOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Ngày bắt đầu</label>
                            <DatePicker style={datePickerStyle} onChange={(value) => setStartDate(value)} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Thời gian bắt đầu</label>
                            <Select
                                value={startTime}
                                placeholder="Chọn thời gian"
                                style={selectStyle}
                                onChange={(value) => setStartTime(value)}
                                options={startTimeOptions}
                            />
                        </div>
                    </div>
                </div>

                {/* Thông tin chuyến đi */}
                <div style={sectionContainerStyle}>
                    <div style={sectionTitleStyle}>🎯 Kết thúc</div>
                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Thành phố kết thúc</label>
                            <Select
                                value={endBranch}
                                placeholder="Chọn thành phố"
                                style={selectStyle}
                                onChange={(value) => setEndBranch(value)}
                                options={endBranchOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Ngày kết thúc</label>
                            <DatePicker style={datePickerStyle} onChange={(value) => setEndDate(value)} />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Thời gian kết thúc</label>
                            <Select
                                value={endTime}
                                placeholder="Chọn thời gian"
                                style={selectStyle}
                                onChange={(value) => setEndTime(value)}
                                options={getValidEndTimeOptions()}
                            />
                        </div>
                    </div>
                </div>

                {/* Thông tin chi tiết chuyến đi */}
                <div style={sectionContainerStyle}>
                    <div style={sectionTitleStyle}>⚙️ Thông tin chi tiết chuyến đi</div>
                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Mục đích chuyến đi</label>
                            <Select
                                value={purpose}
                                placeholder="Chọn mục đích"
                                style={selectStyle}
                                onChange={(value) => setPurpose(value)}
                                options={purposeOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Khoảng cách</label>
                            <Select
                                value={distanceCategory}
                                placeholder="Chọn khoảng cách"
                                style={selectStyle}
                                onChange={(value) => setDistanceCategory(value)}
                                options={distanceCategoryOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Số người</label>
                            <Select
                                value={numPeople}
                                placeholder="Chọn số người"
                                style={selectStyle}
                                onChange={(value) => setNumPeople(value)}
                                options={numPeopleOptions}
                            />
                        </div>
                    </div>
                    <div style={rowStyle}>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Địa hình</label>
                            <Select
                                value={terrain}
                                placeholder="Chọn địa hình"
                                style={selectStyle}
                                onChange={(value) => setTerrain(value)}
                                options={terrainOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Hành lý</label>
                            <Select
                                value={luggage}
                                placeholder="Chọn loại hành lý"
                                style={selectStyle}
                                onChange={(value) => setLuggage(value)}
                                options={luggageOptions}
                            />
                        </div>
                        <div style={inputGroupStyle}>
                            <label style={labelStyle}>Tính năng ưa thích</label>
                            <Select
                                mode="multiple"
                                value={preferredFeatures}
                                placeholder="Chọn tính năng"
                                style={selectStyle}
                                onChange={(value) => setPreferredFeatures(value)}
                                options={preferredFeaturesOptions}
                            />
                        </div>
                    </div>
                </div>

                {/* Nút tìm kiếm */}
                <div style={buttonContainerStyle}>
                    <p style={descriptionStyle}>
                        🔍 Vui lòng chọn địa điểm, thời gian và thông tin chuyến đi để tìm kiếm các xe phù hợp với nhu cầu của bạn.
                    </p>
                    <Button
                        type="primary"
                        size="large"
                        onClick={handleSearch}
                        style={searchButtonStyle}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 15px rgba(24, 144, 255, 0.3)';
                        }}
                    >
                        🚀 Tìm xe ngay
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SearchMotorbikeComponent;
