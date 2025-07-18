import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import BackButton from '../../../components/BackButton';

const UpdateSpecificationPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [motorbikeTypes, setMotorbikeTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typeRes, specRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/v1/admin/motorbike-type/get-all',
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    ),
                    axios.get(`http://localhost:8080/api/v1/admin/specifications/get-by-id/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    )
                ]);

                if (typeRes.data.success) {
                    setMotorbikeTypes(typeRes.data.motorbikeTypes);
                }

                if (specRes.data.success) {
                    const data = specRes.data.data;

                    // Chỉ gọi setFieldsValue khi form đã mount xong
                    setTimeout(() => {
                        form.setFieldsValue({
                            motorbikeType: data.motorbikeType?._id,
                            transmission: data.transmission,
                            gears: data.gears,
                            engineSize: data.engineSize,
                            seatHeight: data.seatHeight,
                            weight: data.weight,
                            horsePower: data.horsePower,
                            tankSize: data.tankSize,
                        });
                    }, 0);
                }

                setLoading(false);
            } catch (err) {
                console.log(err);
                message.error('Không thể tải dữ liệu');
                setLoading(false);
            }
        };

        fetchData();
    }, [id, form]);

    const onFinishHandler = async (values) => {
        try {
            const res = await axios.put(`http://localhost:8080/api/v1/admin/specifications/update/${id}`, values,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                message.success('Cập nhật thông số kỹ thuật thành công');
                navigate('/admin/specification');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    if (loading) return <div>Đang tải...</div>;

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
                    <h3 className="text-center">Cập nhật thông số kỹ thuật</h3>

                    <Form.Item
                        label="Loại xe"
                        name="motorbikeType"
                        rules={[{ required: true, message: 'Vui lòng chọn loại xe' }]}
                    >
                        <Select placeholder="Chọn loại xe" disabled={true}>
                            {motorbikeTypes.map(type => (
                                <Select.Option key={type._id} value={type._id}>
                                    {type.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item label="Truyền động" name="transmission" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Số cấp" name="gears" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Dung tích động cơ" name="engineSize" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Chiều cao yên" name="seatHeight" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Trọng lượng" name="weight" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Công suất" name="horsePower" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Dung tích bình xăng" name="tankSize" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Button type="primary" htmlType="submit">Cập nhật</Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default UpdateSpecificationPage;
