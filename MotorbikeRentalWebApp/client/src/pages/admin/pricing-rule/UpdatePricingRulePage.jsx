import React, { useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { Form, Input, Select, message, DatePicker, Button } from "antd";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import axios from "axios";
import { ArrowLeftOutlined } from '@ant-design/icons';
import BackButton from "../../../components/BackButton";

const UpdatePricingRulePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm(); // Sử dụng form Ant Design

    const getPricingRuleById = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/v1/admin/pricing-rule/get-by-id/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                const pricingRuleData = res.data.pricingRule;
                form.setFieldsValue({
                    name: pricingRuleData.name,
                    sameBranchPrice: pricingRuleData.sameBranchPrice,
                    differentBranchPrice: pricingRuleData.differentBranchPrice,
                    discountDay: pricingRuleData.discountDay,
                    discountPercent: pricingRuleData.discountPercent,
                });
            }
        } catch {
            message.error("Có lỗi xảy ra. Vui lòng thử lại!");
        }
    };

    const handleUpdateBranch = async (values) => {
        try {
            dispatch(showLoading());
            const res = await axios.put(
                `http://localhost:8080/api/v1/admin/pricing-rule/update/${id}`,
                {
                    ...values,
                },
                {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Cập nhật quy tắc giá thuê thành công!");
                navigate("/admin/pricing-rule");
            } else {
                message.error(res.data.message);
            }
        } catch (err) {
            dispatch(hideLoading());
            message.error(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
        }
    };

    useEffect(() => {
        getPricingRuleById();
        // eslint-disable-next-line
    }, []);

    return (
        <AdminLayout>
            <div className="p-4">
                {/* Back Button */}
                <BackButton path="/admin/pricing-rule" />
                <Form
                    style={{ maxWidth: 600, margin: "0 auto" }}
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateBranch}
                >
                    <h3 className="text-center">CẬP NHẬT QUY TẮC GIÁ THUÊ</h3>

                    <Form.Item
                        label="Tên quy tắc"
                        name="name"
                    // rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Giá thuê cùng chi nhánh"
                        name="sameBranchPrice"
                    // rules={[{ required: true, message: "Vui lòng nhập email" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Giá thuê khác chi nhánh"
                        name="differentBranchPrice"
                    // rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input type="tel" />
                    </Form.Item>
                    <Form.Item
                        label="Số ngày bắt đầu giảm giá"
                        name="discountDay"
                        rules={[
                            { required: true, message: "Vui lòng nhập số ngày bắt đầu giảm giá" },
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
                    <Button type="primary" htmlType="submit">Cập nhật</Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default UpdatePricingRulePage
