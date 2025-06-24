import React from "react";
import { Form, Input, message, Select, DatePicker, Button } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";
import { ArrowLeftOutlined } from '@ant-design/icons';

const CreateBranchPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm(); // Sử dụng form Ant Design

    const onFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            console.log('Sending data:', values);
            const res = await axios.post(
                "http://localhost:8080/api/v1/admin/branch/create-branch",
                values,
                // {
                //     headers: {
                //         Authorization: "Bearer " + localStorage.getItem("token"),
                //     },
                // }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Thêm chi nhánh thành công");
                navigate("/admin/branch");
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
                    <Link to="/admin/branch">
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
                    initialValues={{
                        isActive: true
                    }}
                >
                    <h3 className="text-center">THÊM CHI NHÁNH</h3>
                    <Form.Item
                        label="Thành phố"
                        name="city"
                        rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                        rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input type="tel" />
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name="isActive"
                        rules={[
                            { required: true, message: "Vui lòng chọn trạng thái chi nhánh" },
                        ]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value={true}>Hoạt động</Select.Option>
                            <Select.Option value={false}>Bị khóa</Select.Option>
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
        </AdminLayout >
    );
};

export default CreateBranchPage;
