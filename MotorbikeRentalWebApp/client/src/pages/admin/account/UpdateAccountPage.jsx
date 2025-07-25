import React, { useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { Form, Input, Select, message, DatePicker, Button } from "antd";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import axios from "axios";
import { ArrowLeftOutlined } from '@ant-design/icons';
import BackButton from "../../../components/BackButton";

const UpdateAccountPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm(); // Sử dụng form Ant Design

    const getAccountById = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/v1/admin/account/get-by-id/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                const accountData = res.data.user;
                form.setFieldsValue({
                    fullName: accountData.fullName,
                    email: accountData.email,
                    phone: accountData.phone,
                    roleName: accountData.role?.name,
                });
            }
        } catch {
            message.error("Có lỗi xảy ra. Vui lòng thử lại!");
        }
    };

    const handleUpdateAccount = async (values) => {
        try {
            dispatch(showLoading());
            const res = await axios.put(
                `http://localhost:8080/api/v1/admin/account/update/${id}`,
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
                message.success("Cập nhật tài khoản thành công!");
                navigate("/admin/account");
            } else {
                message.error(res.data.message);
            }
        } catch (err) {
            dispatch(hideLoading());
            message.error(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
        }
    };

    useEffect(() => {
        getAccountById();
        // eslint-disable-next-line
    }, []);

    return (
        <AdminLayout>
            <div className="p-4">
                {/* Back Button */}
                <BackButton path="/admin/account" />
                <Form
                    style={{ maxWidth: 600, margin: "0 auto" }}
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateAccount}
                >
                    <h3 className="text-center">CẬP NHẬT TÀI KHOẢN</h3>

                    <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Email"
                        name="email"
                    // rules={[{ required: true, message: "Vui lòng nhập email" }]}
                    >
                        <Input type="email" disabled={true} />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input type="tel" />
                    </Form.Item>
                    <Form.Item
                        label="Vai trò"
                        name="roleName"
                        rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                    >
                        <Select
                            placeholder="Chọn vai trò"
                        >
                            <Select.Option value="admin">Admin</Select.Option>
                            <Select.Option value="employee">Nhân viên</Select.Option>
                            <Select.Option value="customer">Khách hàng</Select.Option>
                        </Select>
                    </Form.Item>

                    {/* {userType === "employee" && (
            <Form.Item label="Ngày nhận việc" name="hireDate">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          )} */}

                    <Form.Item label="Mật khẩu mới" name="password">
                        <Input type="password" autoComplete="new-password" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit">Cập nhật</Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default UpdateAccountPage;
