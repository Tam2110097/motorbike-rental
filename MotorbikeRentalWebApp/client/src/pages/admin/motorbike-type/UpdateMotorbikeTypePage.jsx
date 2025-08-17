import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { Form, Input, message, Button, Select } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import UploadImage from "../../../components/UploadImage";
import BackButton from "../../../components/BackButton";

const UpdateMotorbikeTypePage = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { id } = useParams();
    const [selectedFile, setSelectedFile] = useState(null);
    const [pricingRuleList, setPricingRuleList] = useState([]);
    const [initialImage, setInitialImage] = useState("");
    const [originalImage, setOriginalImage] = useState(""); // Backup cho ảnh gốc

    const getAllPricingRules = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/pricing-rule/get-all',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setPricingRuleList(res.data.pricingRules);
            }
        } catch {
            // error ignored
        }
    };

    const getMotorbikeTypeById = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/admin/motorbike-type/get-by-id/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                const data = res.data.motorbikeType;
                form.setFieldsValue({
                    name: data.name,
                    price: data.price,
                    totalQuantity: data.totalQuantity,
                    deposit: data.deposit,
                    prefixCode: data.prefixCode,
                    preDeposit: data.preDeposit,
                    dailyDamageWaiver: data.dailyDamageWaiver,
                    pricingRule: data.pricingRule?._id || data.pricingRule,
                    description: data.description,
                    image: data.image,
                });
                // Thêm domain vào đường dẫn hình ảnh nếu chưa có
                const imageUrl = data.image.startsWith('http') ? data.image : `http://localhost:8080${data.image}`;
                setInitialImage(imageUrl);
                setOriginalImage(imageUrl); // Backup ảnh gốc
                console.log('Initial image set:', imageUrl); // Debug log

                // Cập nhật form value cho image
                form.setFieldsValue({ image: imageUrl });
            }
        } catch {
            message.error("Không thể tải thông tin loại xe");
        }
    };

    useEffect(() => {
        getAllPricingRules();
        getMotorbikeTypeById();
        // eslint-disable-next-line
    }, [id]);

    // Debug: Theo dõi initialImage
    useEffect(() => {
        console.log('Initial image changed:', initialImage);
    }, [initialImage]);

    const onFinishHandler = async (values) => {
        try {
            let imageUrl = null;

            // Nếu có file mới được chọn thì upload
            if (selectedFile) {
                const formData = new FormData();
                formData.append("file", selectedFile);
                const uploadRes = await axios.post(
                    "http://localhost:8080/api/v1/upload",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                if (!uploadRes.data.success) {
                    message.error("Tải ảnh lên thất bại!");
                    return;
                }
                imageUrl = uploadRes.data.url;
            } else {
                // Nếu không có file mới, sử dụng ảnh gốc
                imageUrl = originalImage || initialImage;
            }

            if (!imageUrl) {
                message.error("Vui lòng chọn ảnh hoặc giữ ảnh hiện tại!");
                return;
            }

            console.log('Submitting with image URL:', imageUrl); // Debug log
            console.log('Initial image:', initialImage); // Debug log
            console.log('Original image:', originalImage); // Debug log
            console.log('Selected file:', selectedFile); // Debug log

            const requestData = {
                name: values.name,
                price: Number(values.price),
                totalQuantity: Number(values.totalQuantity),
                image: imageUrl,
                description: values.description,
                deposit: Number(values.deposit),
                prefixCode: values.prefixCode,
                preDeposit: Number(values.preDeposit),
                dailyDamageWaiver: Number(values.dailyDamageWaiver),
                pricingRule: values.pricingRule,
            };

            console.log('Request data being sent:', requestData); // Debug log

            const res = await axios.put(
                `http://localhost:8080/api/v1/admin/motorbike-type/update/${id}`,
                requestData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            console.log('Server response:', res.data); // Debug log

            if (res.data.success) {
                message.success("Cập nhật loại xe thành công");
                navigate("/admin/motorbike-type");
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.error('Error updating motorbike type:', error);
            message.error("Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    return (
        <AdminLayout>
            <div className="p-4">
                <BackButton path="/admin/motorbike-type" />
                <Form
                    style={{ maxWidth: 600, margin: "0 auto" }}
                    form={form}
                    layout="vertical"
                    onFinish={onFinishHandler}
                    onValuesChange={(changedValues) => {
                        // Khi giá thay đổi thì tự động tính các khoản khác
                        if (changedValues.price) {
                            const price = parseFloat(changedValues.price);
                            if (!isNaN(price)) {
                                const autoDeposit = Math.floor(price * 0.3);
                                const autoPreDeposit = Math.floor(autoDeposit * 0.1);
                                const autoDailyDamageWaiver = Math.floor(price * 0.01);
                                form.setFieldsValue({
                                    deposit: autoDeposit,
                                    preDeposit: autoPreDeposit,
                                    dailyDamageWaiver: autoDailyDamageWaiver,
                                });
                            }
                        }

                        // Nếu người dùng thay đổi tiền cọc thủ công thì cập nhật lại tiền cọc trước
                        if (changedValues.deposit) {
                            const deposit = parseFloat(changedValues.deposit);
                            if (!isNaN(deposit)) {
                                form.setFieldsValue({
                                    preDeposit: Math.floor(deposit * 0.1),
                                });
                            }
                        }
                    }}
                >
                    <h3 className="text-center">Cập nhật loại xe</h3>
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
                        <Input />
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
                        extra="Hình ảnh hiện tại sẽ được giữ lại nếu không chọn hình ảnh mới"
                    >
                        <UploadImage
                            initImage={initialImage}
                            onFileSelect={(file) => {
                                setSelectedFile(file);
                                // Cập nhật form value khi chọn file mới
                                form.setFieldsValue({ image: file.name });
                                console.log('File selected:', file.name); // Debug log
                            }}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Cập nhật loại xe
                    </Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default UpdateMotorbikeTypePage;
