import React, { useEffect } from 'react'
import { Form, Input, Button, message, Select, Upload, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import BackButton from '../../../components/BackButton';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const CreateMotorbikePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [branchList, setBranchList] = useState([]);
    const [motorbikeTypeList, setMotorbikeTypeList] = useState([]);
    const [quantity, setQuantity] = useState(0);
    const [licensePlateImages, setLicensePlateImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const getAllBranch = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/admin/branch/get-all");
            if (res.data.success) {
                setBranchList(res.data.branches);
            }
            else {
                message.error(res.data.message || "Lỗi khi lấy danh sách chi nhánh");
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách chi nhánh");
        }
    }

    const getAllMotorbikeType = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/admin/motorbike-type/get-all");
            if (res.data.success) {
                setMotorbikeTypeList(res.data.motorbikeTypes);
            }
            else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách loại xe");
        }
    }

    useEffect(() => {
        getAllBranch();
        getAllMotorbikeType();
    }, []);

    // Handle quantity change
    const handleQuantityChange = (e) => {
        const value = Number(e.target.value);
        setQuantity(value);
        // Reset images array to match new quantity
        setLicensePlateImages(Array(value).fill(null));
    };

    // Handle image upload for a specific index
    const handleImageUpload = async (file, index) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await axios.post(
                "http://localhost:8080/api/v1/upload",
                formData
            );

            if (uploadRes.data.success) {
                const newImages = [...licensePlateImages];
                newImages[index] = uploadRes.data.url;
                setLicensePlateImages(newImages);
                message.success(`Ảnh ${index + 1} tải lên thành công`);
            } else {
                message.error("Tải ảnh lên thất bại!");
            }
        } catch (error) {
            console.log(error);
            message.error("Lỗi khi tải ảnh lên");
        }
    };

    // Remove image at specific index
    const removeImage = (index) => {
        const newImages = [...licensePlateImages];
        newImages[index] = null;
        setLicensePlateImages(newImages);
    };

    // Xử lý form submit
    const onFinishHandler = async () => {
        const formValues = form.getFieldsValue();

        // Validate required fields
        if (!formValues.branchId || !formValues.motorbikeType || !quantity) {
            message.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        // Check if all images are uploaded
        const uploadedImages = licensePlateImages.filter(img => img !== null);
        if (uploadedImages.length !== quantity) {
            message.error(`Vui lòng tải lên đủ ${quantity} ảnh biển số!`);
            return;
        }

        setUploading(true);
        try {
            // Create motorbike records sequentially to avoid race conditions
            const results = [];
            for (let i = 0; i < uploadedImages.length; i++) {
                const imageUrl = uploadedImages[i];
                const motorbikeData = {
                    motorbikeType: formValues.motorbikeType,
                    branchId: formValues.branchId,
                    licensePlateImage: imageUrl, // Each motorbike has one image
                    status: formValues.status
                };

                const result = await axios.post(
                    "http://localhost:8080/api/v1/employee/motorbike/create",
                    motorbikeData
                );
                results.push(result);

                // Small delay between creations to reduce race conditions
                if (i < uploadedImages.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Check if all creations were successful
            const allSuccess = results.every(res => res.data.success);

            if (allSuccess) {
                message.success(`Tạo thành công ${quantity} xe máy`);
                form.resetFields();
                setLicensePlateImages([]);
                setQuantity(0);
                navigate("/employee/motorbike");
            } else {
                message.error("Có lỗi xảy ra khi tạo một số xe máy");
            }
        } catch (error) {
            console.error("Lỗi khi tạo xe máy:", error);
            message.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setUploading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-4">
                {/* Back Button */}
                <BackButton path="/employee/motorbike" />
                <Form
                    style={{ maxWidth: 800, margin: "0 auto" }}
                    form={form}
                    layout="vertical"
                    onFinish={onFinishHandler}
                    initialValues={
                        {
                            status: 'available'
                        }
                    }
                >
                    <h3 className="text-center">Thêm xe máy</h3>

                    <Form.Item
                        label="Chi nhánh"
                        name="branchId"
                        rules={[
                            { required: true, message: "Vui lòng chọn chi nhánh" },
                        ]}
                    >
                        <Select placeholder="Chọn chi nhánh">
                            {branchList.map((branch) => (
                                <Select.Option key={branch._id} value={branch._id}>{branch.city}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Loại xe"
                        name="motorbikeType"
                        rules={[
                            { required: true, message: "Vui lòng chọn loại xe" },
                        ]}
                    >
                        <Select placeholder="Chọn loại xe">
                            {motorbikeTypeList.map((motorbikeType) => (
                                <Select.Option key={motorbikeType._id} value={motorbikeType._id}>{motorbikeType.name}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số lượng xe"
                        name="quantity"
                        rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
                    >
                        <Input
                            type="number"
                            min={1}
                            max={10}
                            onChange={handleQuantityChange}
                            placeholder="Nhập số lượng xe (tối đa 10)"
                        />
                    </Form.Item>

                    {quantity > 0 && (
                        <Form.Item label="Hình ảnh biển số">
                            <div style={{ marginBottom: 16 }}>
                                <p>Vui lòng tải lên {quantity} ảnh biển số (mỗi ảnh đại diện cho 1 xe)</p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                {Array.from({ length: quantity }, (_, index) => (
                                    <div key={index} style={{ border: '1px dashed #d9d9d9', borderRadius: '6px', padding: '16px', textAlign: 'center' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <strong>Xe {index + 1}</strong>
                                        </div>

                                        {licensePlateImages[index] ? (
                                            <div>
                                                <img
                                                    src={`http://localhost:8080${licensePlateImages[index]}`}
                                                    alt={`Biển số xe ${index + 1}`}
                                                    style={{
                                                        width: '100%',
                                                        height: '120px',
                                                        objectFit: 'cover',
                                                        borderRadius: '4px',
                                                        marginBottom: '8px'
                                                    }}
                                                />
                                                <Space>
                                                    <Button
                                                        type="primary"
                                                        size="small"
                                                        onClick={() => {
                                                            const input = document.createElement('input');
                                                            input.type = 'file';
                                                            input.accept = 'image/*';
                                                            input.onchange = (e) => {
                                                                if (e.target.files[0]) {
                                                                    handleImageUpload(e.target.files[0], index);
                                                                }
                                                            };
                                                            input.click();
                                                        }}
                                                    >
                                                        Thay đổi
                                                    </Button>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Space>
                                            </div>
                                        ) : (
                                            <div>
                                                <div style={{
                                                    width: '100%',
                                                    height: '120px',
                                                    border: '1px dashed #d9d9d9',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginBottom: '8px',
                                                    backgroundColor: '#fafafa'
                                                }}>
                                                    <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                                                </div>
                                                <Button
                                                    type="dashed"
                                                    size="small"
                                                    onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = 'image/*';
                                                        input.onchange = (e) => {
                                                            if (e.target.files[0]) {
                                                                handleImageUpload(e.target.files[0], index);
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                >
                                                    Tải ảnh
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={uploading}
                            disabled={quantity === 0 || licensePlateImages.filter(img => img !== null).length !== quantity}
                        >
                            {uploading ? 'Đang tạo xe máy...' : `Tạo ${quantity} xe máy`}
                        </Button>
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                    >
                        <Select
                            placeholder="Chọn trạng thái"
                        >
                            <Select.Option value="available">Có sẵn</Select.Option>
                            <Select.Option value="rented">Đã thuê</Select.Option>
                            <Select.Option value="maintenance">Đang sửa chữa</Select.Option>
                            <Select.Option value="out_of_service">Đã hỏng</Select.Option>
                            <Select.Option value="reserved">Đã đặt</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </div>
        </AdminLayout>
    );
}

export default CreateMotorbikePage