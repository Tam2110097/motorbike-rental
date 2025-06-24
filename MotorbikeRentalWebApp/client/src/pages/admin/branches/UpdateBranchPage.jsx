import React, { useEffect, useState } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { Form, Input, Select, message, DatePicker, Button } from "antd";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import axios from "axios";
import { ArrowLeftOutlined } from '@ant-design/icons';

const UpdateBranchPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form] = Form.useForm(); // Sử dụng form Ant Design
    const [isActive, setIsActive] = useState(false);

    const getBranchById = async () => {
        try {
            const res = await axios.get(
                `http://localhost:8080/api/v1/admin/branch/get-branch-by-id/${id}`
            );
            if (res.data.success) {
                const branchData = res.data.branch;
                setIsActive(branchData.isActive);
                form.setFieldsValue({
                    city: branchData.city,
                    address: branchData.address,
                    phone: branchData.phone,
                    isActive: branchData.isActive,
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
                `http://localhost:8080/api/v1/admin/branch/update-branch/${id}`,
                {
                    ...values,
                },
                // {
                //     headers: {
                //       Authorization: "Bearer " + localStorage.getItem("token"),
                //     },
                //   }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Cập nhật chi nhánh thành công!");
                navigate("/admin/branch");
            } else {
                message.error(res.data.message);
            }
        } catch (err) {
            dispatch(hideLoading());
            message.error(err.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
        }
    };

    useEffect(() => {
        getBranchById();
        // eslint-disable-next-line
    }, []);

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
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateBranch}
                    initialValues={{
                        isActive: isActive
                    }}
                >
                    <h3 className="text-center">CẬP NHẬT CHI NHÁNH</h3>

                    <Form.Item
                        label="Thành phố"
                        name="city"
                    // rules={[{ required: true, message: "Vui lòng nhập thành phố" }]}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                    <Form.Item
                        label="Địa chỉ"
                        name="address"
                    // rules={[{ required: true, message: "Vui lòng nhập email" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại"
                        name="phone"
                    // rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                    >
                        <Input type="tel" />
                    </Form.Item>
                    <Form.Item
                        label="Trạng thái"
                        name="isActive"
                    // rules={[
                    //     { required: true, message: "Vui lòng chọn trạng thái chi nhánh" },
                    // ]}
                    >
                        <Select placeholder="Chọn trạng thái">
                            <Select.Option value={true}>Hoạt động</Select.Option>
                            <Select.Option value={false}>Bị khóa</Select.Option>
                        </Select>
                    </Form.Item>
                    <Button type="primary" htmlType="submit">Cập nhật</Button>
                </Form>
            </div>
        </AdminLayout>
    );
};

export default UpdateBranchPage;
