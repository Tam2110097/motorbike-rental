import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { Form, Input, message, Button, Select, Upload } from "antd";
import { useNavigate, useParams } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import axios from "axios";
import TextArea from "antd/es/input/TextArea";
import { PlusOutlined } from "@ant-design/icons";
import UploadImage from "../../../components/UploadImage";
import BackButton from "../../../components/BackButton";

const UpdateAccessoryPage = () => {
    const [form] = Form.useForm();
    const { id } = useParams();
    const navigate = useNavigate();
    // const dispatch = useDispatch();
    // const [loading, setLoading] = useState(false);
    const [accessory, setAccessory] = useState({});
    const [selectedFile, setSelectedFile] = useState(null); // Lưu file tạm

    //getProduct
    const getAccessory = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/v1/employee/accessory/get-accessory-by-id/${id}`,
                // {
                //   headers: {
                //     Authorization: `Bearer ${localStorage.getItem("token")}`,
                //   },
                // }
            );
            if (res.data.success) {
                setAccessory(res.data.accessory);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Xử lý form submit
    const onFinishHandler = async (values) => {
        try {
            if (!selectedFile) {
                message.error("Vui lòng chọn ảnh!");
                return;
            }

            const resAccessory = await axios.get(
                `http://localhost:8080/api/v1/employee/accessory/get-accessory-by-id/${id}`,
                // {
                //   headers: {
                //     Authorization: `Bearer ${localStorage.getItem("token")}`,
                //   },
                // }
            );
            //Khong cap nhat anh
            if (
                resAccessory.data.accessory.image.replace("/uploads/", "") ===
                selectedFile.name
            ) {
                form.setFieldsValue({ values });

                const updatedValues = form.getFieldsValue();
                console.log("Giá trị form sau khi cập nhật:", updatedValues);

                const res = await axios.put(
                    `http://localhost:8080/api/v1/employee/accessory/update-accessory/${id}`,
                    updatedValues,
                    //   {
                    //     headers: {
                    //       Authorization: `Bearer ${localStorage.getItem("token")}`,
                    //     },
                    //   }
                );

                if (res.data.success) {
                    message.success("Cập nhật sản phẩm thành công!");
                    form.resetFields();
                    setSelectedFile(null);
                    navigate("/admin/product");
                } else {
                    message.error(res.data.message);
                }
                return;
            }

            // 1. Upload ảnh trước
            const formData = new FormData();
            formData.append("file", selectedFile);

            const uploadRes = await axios.post(
                "http://localhost:8080/api/v1/upload",
                formData,
                // {
                //   headers: {
                //     "Content-Type": "multipart/form-data",
                //     Authorization: `Bearer ${localStorage.getItem("token")}`,
                //   },
                // }
            );

            if (!uploadRes.data.success) {
                message.error("Tải ảnh lên thất bại!");
                return;
            }

            const imageUrl = uploadRes.data.url;
            console.log("URL ảnh sau khi upload:", imageUrl);

            // Cập nhật giá trị ảnh vào form
            form.setFieldsValue({ ...values, image: imageUrl });

            // Lấy giá trị form sau khi cập nhật
            const updatedValues = form.getFieldsValue();
            console.log("Giá trị form sau khi cập nhật:", updatedValues);

            // Kiểm tra lại `updatedValues.image` trước khi gửi API
            if (!updatedValues.image) {
                message.error("Lỗi: URL ảnh không tồn tại!");
                return;
            }

            const res = await axios.put(
                `http://localhost:8080/api/v1/employee/accessory/update-accessory/${id}`,
                updatedValues,
                // {
                //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                // }
            );

            if (res.data.success) {
                message.success("Cập nhật sản phẩm thành công!");
                form.resetFields();
                setSelectedFile(null);
                navigate("/employee/accessory");
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error(
                "Lỗi khi cập nhật sản phẩm:",
                error.response?.data || error.message
            );
            message.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    useEffect(() => {
        getAccessory();
    }, []);

    const setImage = async () => {
        if (!accessory || !accessory.image) return;

        const url = accessory.image.startsWith("/")
            ? `http://localhost:8080${accessory.image}`
            : `http://localhost:8080/${accessory.image}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Không thể tải ảnh");

            const blob = await response.blob();
            const nameImage = accessory.image.replace("/uploads/", "");
            const file = new File([blob], nameImage, { type: blob.type });

            setSelectedFile(file);
        } catch (error) {
            console.error("Lỗi khi tải ảnh:", error);
        }
    };
    // Cập nhật form khi `product` thay đổi
    useEffect(() => {
        if (accessory && Object.keys(accessory).length > 0) {
            form.setFieldsValue({
                name: accessory.name,
                price: accessory.price,
                quantity: accessory.quantity,
                image: accessory.image,
                description: accessory.description,
            });

            setImage();
        }
    }, [accessory]);

    return (
        <AdminLayout>
            <div className="p-4">
                <BackButton path="/employee/accessory" />
                <Form
                    style={{ maxWidth: 600, margin: "0 auto" }}
                    form={form}
                    layout="vertical"
                    onFinish={onFinishHandler}
                >
                    <h3 className="text-center">Cập nhật sản phẩm</h3>

                    <Form.Item
                        label="Tên sản phẩm"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[
                            { required: true, message: "Vui lòng nhập giá sản phẩm" },
                            { pattern: /^[0-9]+$/, message: "Giá sản phẩm phải là số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Số lượng" name="quantity">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <TextArea rows={4} />
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
                            initImage={`http://localhost:8080${accessory.image}`} // Dùng backticks để kết hợp biến
                        />
                    </Form.Item>

                    <Button
                        type="primary"
                        htmlType="submit"
                    // loading={loading}
                    // disabled={loading}
                    >
                        Cập nhật sản phẩm
                    </Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default UpdateAccessoryPage;
