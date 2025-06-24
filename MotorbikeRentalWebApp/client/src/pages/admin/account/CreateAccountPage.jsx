import React from "react";
import { Form, Input, message, Select, DatePicker, Button } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import { ArrowLeftOutlined } from '@ant-design/icons';

const CreateAccountPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const [userType, setUserType] = useState(null);
    const [form] = Form.useForm(); // Sử dụng form Ant Design

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            console.log('Sending data:', values);
            const res = await axios.post(
                "http://localhost:8080/api/v1/admin/account/create-account",
                values,
                // {
                //     headers: {
                //         Authorization: "Bearer " + localStorage.getItem("token"),
                //     },
                // }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Thêm tài khoản thành công");
                navigate("/admin/account");
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
                <div className="mb-4">
                    <Link to="/admin/account">
                        <Button
                            type="default"
                            icon={<ArrowLeftOutlined />}
                            size="large"
                        >
                            Quay lại
                        </Button>
                    </Link>
                </div>

                <Form
                    layout="vertical"
                    onFinish={onFinishHandler}
                    form={form}
                >
                    <h3 className="text-center">THÊM TÀI KHOẢN</h3>
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
                        rules={[{ required: true, message: "Vui lòng nhập email" }]}
                    >
                        <Input type="email" />
                    </Form.Item>
                    <Form.Item
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                    >
                        <Input type="password" autoComplete="new-password" />
                    </Form.Item>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input type="tel" />
                    </Form.Item>
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Vai trò"
                        name="userType"
                        rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
                    >
                        <Select
                            placeholder="Chọn vai trò"
                        // onChange={(value) => setUserType(value)}
                        >
                            <Select.Option value="admin">Admin</Select.Option>
                            <Select.Option value="employee">Nhân viên</Select.Option>
                            <Select.Option value="customer">Khách hàng</Select.Option>
                        </Select>
                    </Form.Item>
                    {/* {userType === "employee" && (
                        <Form.Item label="Ngày nhận việc" name="hire_date">
                            <DatePicker className="w-100" format="DD/MM/YYYY" />
                        </Form.Item>
                    )} */}
                    <Button type="primary" htmlType="submit">
                        Thêm
                    </Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default CreateAccountPage;
