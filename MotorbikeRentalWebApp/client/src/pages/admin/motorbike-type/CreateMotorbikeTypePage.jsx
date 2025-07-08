import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { Form, Input, message, Button, Select } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UploadImage from "../../../components/UploadImage";
import BackButton from "../../../components/BackButton";

const CreateMotorbikeTypePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState(null);
    const [pricingRuleList, setPricingRuleList] = useState([]);

    const getAllPricingRules = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/pricing-rule/get-all');
            if (res.data.success) {
                setPricingRuleList(res.data.pricingRules);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getAllPricingRules();
    }, []);

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
                "http://localhost:8080/api/v1/admin/motorbike-type/create",
                {
                    name: updatedValues.name,
                    price: Number(updatedValues.price),
                    totalQuantity: Number(updatedValues.totalQuantity),
                    image: updatedValues.image,
                    description: updatedValues.description,
                    deposit: Number(updatedValues.deposit),
                    prefixCode: updatedValues.prefixCode,
                    preDeposit: Number(updatedValues.preDeposit),
                    dailyDamageWaiver: Number(updatedValues.dailyDamageWaiver),
                    pricingRule: updatedValues.pricingRule,
                },
                // {
                //     headers: {
                //         Authorization: "Bearer " + localStorage.getItem("token"),
                //     },
                // }
            );
            if (res.data.success) {
                message.success("Thêm loại xe thành công");
                form.resetFields();
                setSelectedFile(null);
                navigate("/admin/motorbike-type");
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
                <BackButton path="/admin/motorbike-type" />
                <Form
                    style={{ maxWidth: 600, margin: "0 auto" }}
                    form={form}
                    layout="vertical"
                    onFinish={onFinishHandler}
                    onValuesChange={(changedValues) => {
                        const currentValues = form.getFieldsValue();
                        const price = parseFloat(currentValues.price);

                        if (!isNaN(price)) {
                            const autoDeposit = Math.floor(price * 0.3);
                            const autoPreDeposit = Math.floor(autoDeposit * 0.5);
                            const autoDailyDamageWaiver = Math.floor(price * 0.01);
                            form.setFieldsValue({
                                deposit: autoDeposit,
                                preDeposit: autoPreDeposit,
                                dailyDamageWaiver: autoDailyDamageWaiver,
                            });
                        }

                        // Nếu người dùng thay đổi deposit thủ công (nếu cho phép), cũng cập nhật lại preDeposit
                        if (changedValues.deposit) {
                            const deposit = parseFloat(changedValues.deposit);
                            if (!isNaN(deposit)) {
                                form.setFieldsValue({
                                    preDeposit: Math.floor(deposit * 0.3),
                                });
                            }
                        }
                    }}

                    initialValues={
                        {
                            totalQuantity: 0,
                        }
                    }
                >
                    <h3 className="text-center">Thêm loại xe</h3>

                    <Form.Item
                        label="Tên loại xe"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên loại xe" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giá"
                        name="price"
                        rules={[
                            { required: true, message: "Vui lòng nhập giá loại xe" },
                            { pattern: /^[0-9]+$/, message: "Giá loại xe phải là số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số lượng"
                        name="totalQuantity"
                        rules={[
                            { required: true, message: "Vui lòng nhập số lượng" },
                            { pattern: /^[0-9]+$/, message: "Số lượng phải là số" },
                        ]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item
                        label="Tiền cọc"
                        name="deposit"
                        rules={[
                            { required: true, message: "Vui lòng nhập tiền cọc" },
                            { pattern: /^[0-9]+$/, message: "Tiền cọc phải là số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Mã loại xe"
                        name="prefixCode"
                        rules={[
                            { required: true, message: "Vui lòng nhập mã loại xe" },
                            { pattern: /^[A-Z0-9]+$/, message: "Mã loại xe phải là chữ cái và số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tiền cọc trước"
                        name="preDeposit"
                        rules={[
                            { required: true, message: "Vui lòng nhập tiền cọc trước" },
                            { pattern: /^[0-9]+$/, message: "Tiền cọc trước phải là số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tiền bảo hiểm"
                        name="dailyDamageWaiver"
                        rules={[
                            { required: true, message: "Vui lòng nhập tiền bảo hiểm" },
                            { pattern: /^[0-9]+$/, message: "Tiền bảo hiểm phải là số" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Quy tắc giá"
                        name="pricingRule"
                        rules={[
                            { required: true, message: "Vui lòng chọn quy tắc giá" },
                        ]}
                    >
                        <Select placeholder="Chọn quy tắc giá">
                            {pricingRuleList.map((rule) => (
                                <Select.Option key={rule._id} value={rule._id}>{rule.name}</Select.Option>
                            ))}
                        </Select>
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
                        Thêm loại xe
                    </Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default CreateMotorbikeTypePage;
