import React, { useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { Form, Input, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UploadImage from "../../../components/UploadImage";
import { Link } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import BackButton from "../../../components/BackButton";

const CreateAccessoryPage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);

    // Xử lý form submit
    const onFinishHandler = async () => {
        if (!selectedFile) {
            message.error("Vui lòng chọn ảnh!");
            return;
        }
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const uploadRes = await axios.post(
                "http://localhost:8080/api/v1/upload",
                formData,
                // {
                //     headers: {
                //         "Content-Type": "multipart/form-data",
                //         Authorization: `Bearer ${localStorage.getItem("token")}`,
                //     },
                // }
            );
            if (!uploadRes.data.success) {
                message.error("Tải ảnh lên thất bại!");
                return;
            }
            const imageUrl = uploadRes.data.url;
            form.setFieldsValue({ image: imageUrl });
            const updatedValues = form.getFieldsValue();
            if (!updatedValues.image) {
                message.error("Lỗi: URL ảnh không tồn tại!");
                return;
            }
            // Gửi API tạo phụ kiện
            const res = await axios.post(
                "http://localhost:8080/api/v1/employee/accessory/create-accessory",
                {
                    name: updatedValues.name,
                    price: Number(updatedValues.price),
                    quantity: Number(updatedValues.quantity),
                    image: updatedValues.image,
                    description: updatedValues.description,
                },
                // {
                //     headers: {
                //         Authorization: "Bearer " + localStorage.getItem("token"),
                //     },
                // }
            );
            if (res.data.success) {
                message.success("Thêm phụ kiện thành công");
                form.resetFields();
                setSelectedFile(null);
                navigate("/employee/accessory");
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error("Lỗi khi gửi API:", error.response?.data || error.message);
            message.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    return (
        <AdminLayout>
            <div className="p-4">
                {/* Back Button */}
                <BackButton path="/employee/accessory" />
                <Form
                    style={{ maxWidth: 600, margin: "0 auto" }}
                    form={form}
                    layout="vertical"
                    onFinish={onFinishHandler}
                >
                    <h3 className="text-center">Thêm phụ kiện</h3>

                    <Form.Item
                        label="Tên phụ kiện"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên phụ kiện" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[
                            { required: true, message: "Vui lòng nhập giá phụ kiện" },
                            { pattern: /^[0-9]+$/, message: "Giá phụ kiện phải là số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số lượng"
                        name="quantity"
                        rules={[
                            { required: true, message: "Vui lòng nhập số lượng" },
                            { pattern: /^[0-9]+$/, message: "Số lượng phải là số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item
                        label="Hình ảnh"
                        name="image"
                        rules={[{ required: true, message: "Vui lòng tải ảnh lên" }]}
                    >
                        <UploadImage
                            onFileSelect={(file) => {
                                setSelectedFile(file);
                                form.setFieldsValue({ image: file.name });
                            }}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Thêm phụ kiện
                    </Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default CreateAccessoryPage;
