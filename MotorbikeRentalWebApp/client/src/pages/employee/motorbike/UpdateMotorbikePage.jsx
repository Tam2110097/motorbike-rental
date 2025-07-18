import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Select, Upload, Space } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import BackButton from '../../../components/BackButton';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const UpdateMotorbikePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedFile, setSelectedFile] = useState(null);
    const [branchList, setBranchList] = useState([]);
    const [motorbikeTypeList, setMotorbikeTypeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialImage, setInitialImage] = useState("");
    const [motorbike, setMotorbike] = useState(null);

    // Get motorbike by ID
    const getMotorbikeById = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/employee/motorbike/get-by-id/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                const motorbikeData = res.data.motorbike;
                setMotorbike(motorbikeData);
                setInitialImage(motorbikeData.licensePlateImage);

                // Set form values
                form.setFieldsValue({
                    motorbikeType: motorbikeData.motorbikeType._id,
                    branchId: motorbikeData.branchId._id,
                    status: motorbikeData.status
                });
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin xe máy:", error);
            message.error("Lỗi khi lấy thông tin xe máy");
        }
    };

    const getAllBranch = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/admin/branch/get-all",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setBranchList(res.data.branches);
            } else {
                message.error(res.data.message || "Lỗi khi lấy danh sách chi nhánh");
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách chi nhánh");
        }
    };

    const getAllMotorbikeType = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/admin/motorbike-type/get-all",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setMotorbikeTypeList(res.data.motorbikeTypes);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách loại xe");
        }
    };

    useEffect(() => {
        getMotorbikeById();
        getAllBranch();
        getAllMotorbikeType();
    }, [id]);

    // Handle image upload
    const handleImageUpload = async (file) => {
        try {
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await axios.post(
                "http://localhost:8080/api/v1/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (uploadRes.data.success) {
                setSelectedFile(uploadRes.data.url);
                message.success("Tải ảnh lên thành công");
                return uploadRes.data.url;
            } else {
                message.error("Tải ảnh lên thất bại!");
                return null;
            }
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
            message.error("Lỗi khi tải ảnh lên");
            return null;
        }
    };

    // Handle form submit
    const onFinishHandler = async () => {
        setLoading(true);
        try {
            const formValues = form.getFieldsValue();

            // Validate required fields
            if (!formValues.motorbikeType || !formValues.branchId) {
                message.error("Vui lòng điền đầy đủ thông tin!");
                return;
            }

            let imageUrl = initialImage; // Use existing image by default

            // If new image is selected, upload it
            if (selectedFile) {
                imageUrl = selectedFile;
            }

            const updateData = {
                motorbikeType: formValues.motorbikeType,
                branchId: formValues.branchId,
                licensePlateImage: imageUrl,
                status: formValues.status
            };

            const res = await axios.put(
                `http://localhost:8080/api/v1/employee/motorbike/update/${id}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (res.data.success) {
                message.success("Cập nhật xe máy thành công");
                navigate("/employee/motorbike");
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật xe máy:", error);
            message.error("Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate("/employee/motorbike");
    };

    if (!motorbike) {
        return (
            <AdminLayout>
                <div className="p-4 text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

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
                    initialValues={{
                        status: 'available'
                    }}
                >
                    <h3 className="text-center">Cập nhật xe máy</h3>

                    {/* Current Motorbike Info */}
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5>Thông tin hiện tại</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Mã xe:</strong> {motorbike.code}</p>
                                    <p><strong>Loại xe:</strong> {motorbike.motorbikeType?.name}</p>
                                    <p><strong>Chi nhánh:</strong> {motorbike.branchId?.city}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Trạng thái:</strong>
                                        <span className={`badge ms-2 ${motorbike.status === 'available' ? 'bg-success' :
                                            motorbike.status === 'rented' ? 'bg-warning' :
                                                motorbike.status === 'maintenance' ? 'bg-info' :
                                                    motorbike.status === 'out_of_service' ? 'bg-danger' :
                                                        'bg-secondary'
                                            }`}>
                                            {motorbike.status === 'available' ? 'Có sẵn' :
                                                motorbike.status === 'rented' ? 'Đã thuê' :
                                                    motorbike.status === 'maintenance' ? 'Đang sửa chữa' :
                                                        motorbike.status === 'out_of_service' ? 'Đã hỏng' :
                                                            motorbike.status === 'reserved' ? 'Đã đặt' : motorbike.status}
                                        </span>
                                    </p>
                                    <p><strong>Ngày tạo:</strong> {new Date(motorbike.createdAt).toLocaleDateString('vi-VN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Update Form */}
                    <div className="card">
                        <div className="card-header">
                            <h5>Cập nhật thông tin</h5>
                        </div>
                        <div className="card-body">
                            <Form.Item
                                label="Chi nhánh"
                                name="branchId"
                                rules={[
                                    { required: true, message: "Vui lòng chọn chi nhánh" },
                                ]}
                            >
                                <Select placeholder="Chọn chi nhánh">
                                    {branchList.map((branch) => (
                                        <Select.Option key={branch._id} value={branch._id}>
                                            {branch.city}
                                        </Select.Option>
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
                                        <Select.Option key={motorbikeType._id} value={motorbikeType._id}>
                                            {motorbikeType.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Hình ảnh biển số"
                                name="licensePlateImage"
                            >
                                <div>
                                    {/* Current Image */}
                                    {initialImage && (
                                        <div className="mb-3">
                                            <p><strong>Ảnh hiện tại:</strong></p>
                                            <img
                                                src={`http://localhost:8080${initialImage}`}
                                                alt="Biển số hiện tại"
                                                style={{
                                                    width: "200px",
                                                    height: "150px",
                                                    objectFit: "cover",
                                                    borderRadius: "8px",
                                                    border: "2px solid #ddd"
                                                }}
                                                className="img-thumbnail"
                                            />
                                        </div>
                                    )}

                                    {/* Upload New Image */}
                                    <div>
                                        <p><strong>Tải ảnh mới:</strong></p>
                                        <div style={{
                                            width: "200px",
                                            height: "150px",
                                            border: "2px dashed #d9d9d9",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#fafafa",
                                            cursor: "pointer"
                                        }}
                                            onClick={() => {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.accept = 'image/*';
                                                input.onchange = async (e) => {
                                                    if (e.target.files[0]) {
                                                        const uploadedUrl = await handleImageUpload(e.target.files[0]);
                                                        if (uploadedUrl) {
                                                            setSelectedFile(uploadedUrl);
                                                        }
                                                    }
                                                };
                                                input.click();
                                            }}>
                                            {selectedFile ? (
                                                <div>
                                                    <img
                                                        src={`http://localhost:8080${selectedFile}`}
                                                        alt="Ảnh mới"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            borderRadius: "6px"
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <PlusOutlined style={{ fontSize: '24px', color: '#999' }} />
                                                    <p className="mt-2 mb-0">Tải ảnh mới</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Form.Item>

                            <Form.Item
                                label="Trạng thái"
                                name="status"
                                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                            >
                                <Select placeholder="Chọn trạng thái">
                                    <Select.Option value="available">Có sẵn</Select.Option>
                                    <Select.Option value="rented">Đã thuê</Select.Option>
                                    <Select.Option value="maintenance">Đang sửa chữa</Select.Option>
                                    <Select.Option value="out_of_service">Đã hỏng</Select.Option>
                                    <Select.Option value="reserved">Đã đặt</Select.Option>
                                </Select>
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={loading}>
                                        Cập nhật xe máy
                                    </Button>
                                    <Button onClick={handleCancel}>
                                        Hủy
                                    </Button>
                                </Space>
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default UpdateMotorbikePage;