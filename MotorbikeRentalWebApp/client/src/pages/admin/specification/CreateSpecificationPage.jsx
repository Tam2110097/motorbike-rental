import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import BackButton from '../../../components/BackButton';

const CreateSpecificationPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [motorbikeTypes, setMotorbikeTypes] = useState([]);

    useEffect(() => {
        const fetchMotorbikeTypes = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Token:', token ? 'Token exists' : 'No token found');

                if (!token) {
                    console.error('No authentication token found');
                    message.error('Vui lòng đăng nhập lại');
                    return;
                }

                // Debug: Decode token to check role
                try {
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    console.log('Token payload:', tokenPayload);
                    console.log('User role:', tokenPayload.role);
                } catch (e) {
                    console.error('Error decoding token:', e);
                }

                const res = await axios.get('http://localhost:8080/api/v1/admin/motorbike-type/get-all-without-spec',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                if (res.data.success) {
                    setMotorbikeTypes(res.data.motorbikeTypes);
                    console.log('Motorbike types loaded:', res.data.motorbikeTypes.length);
                }
            } catch (error) {
                console.error('Error fetching motorbike types:', error.response?.status, error.response?.data);
                if (error.response?.status === 401) {
                    message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                } else if (error.response?.status === 403) {
                    message.error('Bạn không có quyền truy cập. Vui lòng đăng nhập với tài khoản admin.');
                } else {
                    message.error('Có lỗi xảy ra khi tải danh sách loại xe');
                }
            }
        };
        fetchMotorbikeTypes();
    }, []);

    const onFinishHandler = async (values) => {
        try {
            const token = localStorage.getItem('token');
            console.log('Submitting with token:', token ? 'Token exists' : 'No token');

            if (!token) {
                message.error('Vui lòng đăng nhập lại');
                return;
            }

            const res = await axios.post('http://localhost:8080/api/v1/admin/spec/create', values, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.data.success) {
                message.success('Thêm thông số kỹ thuật thành công');
                navigate('/admin/specification');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error('Error creating spec:', error.response?.status, error.response?.data);
            if (error.response?.status === 401) {
                message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            } else {
                message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
            }
        }
    };

    return (
        <AdminLayout>
            <div className="p-4">
                <BackButton path="/admin/specification" />
                <Form
                    style={{ maxWidth: 600, margin: '0 auto' }}
                    form={form}
                    layout="vertical"
                    onFinish={onFinishHandler}
                >
                    <h3 className="text-center">Thêm thông số kỹ thuật</h3>
                    <Form.Item
                        label="Loại xe"
                        name="motorbikeType"
                        rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
                    >
                        <Select placeholder="Chọn loại xe">
                            {motorbikeTypes.map(type => (
                                <Select.Option key={type._id} value={type._id}>{type.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Truyền động"
                        name="transmission"
                        rules={[{ required: true, message: 'Vui lòng nhập truyền động' }]}
                        extra="Ví dụ: Bán tự động, Tự động, Thủ công"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số cấp"
                        name="gears"
                        rules={[{ required: true, message: 'Vui lòng nhập số cấp' }]}
                        extra="Ví dụ: 4 bánh răng, 6 cấp"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Dung tích động cơ"
                        name="engineSize"
                        rules={[{ required: true, message: 'Vui lòng nhập dung tích động cơ' }]}
                        extra="Ví dụ: 110cc, 150cc"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Chiều cao yên"
                        name="seatHeight"
                        rules={[{ required: true, message: 'Vui lòng nhập chiều cao yên' }]}
                        extra="Ví dụ: 769mm, 800mm"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Trọng lượng"
                        name="weight"
                        rules={[{ required: true, message: 'Vui lòng nhập trọng lượng' }]}
                        extra="Ví dụ: 98kg, 120kg"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Công suất"
                        name="horsePower"
                        rules={[{ required: true, message: 'Vui lòng nhập công suất' }]}
                        extra="Ví dụ: 9 mã lực, 11.5 mã lực"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Dung tích bình xăng"
                        name="tankSize"
                        rules={[{ required: true, message: 'Vui lòng nhập dung tích bình xăng' }]}
                        extra="Ví dụ: 3.7 lít, 7.5 lít"
                    >
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Thêm</Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default CreateSpecificationPage; 