import React from "react";
import { Form, Input, message, Select, DatePicker, Button } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import { ArrowLeftOutlined } from '@ant-design/icons';
import BackButton from "../../../components/BackButton";

const CreatePricingRulePage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm(); // Sử dụng form Ant Design

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            console.log('Sending data:', values);
            const res = await axios.post(
                "http://localhost:8080/api/v1/admin/pricing-rule/create",
                values,
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Thêm quy tắc giá thuê thành công");
                navigate("/admin/pricing-rule");
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log('Error details:', error.response?.data);
            message.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
        }
    };

    return (
        <AdminLayout>
            <div className="p-4">
                {/* Back Button */}
                <BackButton path="/admin/pricing-rule" />

                <Form
                    layout="vertical"
                    onFinish={onFinishHandler}
                    style={{ maxWidth: 600, margin: "0 auto" }}
                    form={form}
                    initialValues={{
                        isActive: true
                    }}
                >
                    <h3 className="text-center">THÊM QUY TẮC GIÁ THUÊ</h3>
                    <Form.Item
                        label="Tên quy tắc"
                        name="name"
                        rules={[{ required: true, message: "Vui lòng nhập tên quy tắc" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Giá thuê cùng chi nhánh"
                        name="sameBranchPrice"
                        rules={[{ required: true, message: "Vui lòng nhập giá thuê cùng chi nhánh" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Giá thuê khác chi nhánh"
                        name="differentBranchPrice"
                        rules={[{ required: true, message: "Vui lòng nhập giá thuê khác chi nhánh" }]}
                    >
                        <Input type="tel" />
                    </Form.Item>
                    <Form.Item
                        label="Số ngày giảm giá"
                        name="discountDay"
                        rules={[
                            { required: true, message: "Vui lòng nhập số ngày giảm giá" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="% Giảm giá"
                        name="discountPercent"
                        rules={[{ required: true, message: "Vui lòng nhập % giảm giá" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit">
                        Thêm
                    </Button>
                </Form>
            </div>
        </AdminLayout >
    );
};

export default CreatePricingRulePage
