import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import { message, Card, Button, Space, Descriptions, Image, Alert } from "antd";
import AdminLayout from "../../../components/AdminLayout";
import BackButton from "../../../components/BackButton";
import { ExclamationCircleOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const DeleteMotorbikePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const [motorbike, setMotorbike] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Get motorbike by ID
    const getMotorbikeById = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/employee/motorbike/get-by-id/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setMotorbike(res.data.motorbike);
            } else {
                message.error(res.data.message);
                navigate("/employee/motorbike");
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin xe máy:", error);
            message.error("Lỗi khi lấy thông tin xe máy");
            navigate("/employee/motorbike");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getMotorbikeById();
    }, [id]);

    const handleDeleteMotorbike = async () => {
        setDeleting(true);
        dispatch(showLoading());
        try {
            const res = await axios.delete(
                `http://localhost:8080/api/v1/employee/motorbike/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Xóa xe máy thành công");
                setTimeout(() => navigate("/employee/motorbike"), 500);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.error("Lỗi khi xóa xe máy:", error);
            const errorMessage = error.response?.data?.message || "Lỗi khi xóa xe máy!";
            message.error(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancel = () => {
        navigate("/employee/motorbike");
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'available': { text: 'Có sẵn', className: 'bg-success' },
            'rented': { text: 'Đã thuê', className: 'bg-warning' },
            'maintenance': { text: 'Đang sửa chữa', className: 'bg-info' },
            'out_of_service': { text: 'Đã hỏng', className: 'bg-danger' },
            'reserved': { text: 'Đã đặt', className: 'bg-secondary' }
        };

        const config = statusConfig[status] || { text: status, className: 'bg-secondary' };
        return <span className={`badge ${config.className}`}>{config.text}</span>;
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-4 text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!motorbike) {
        return (
            <AdminLayout>
                <div className="p-4 text-center">
                    <Alert
                        message="Không tìm thấy xe máy"
                        description="Xe máy bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
                        type="warning"
                        showIcon
                        action={
                            <Button size="small" onClick={() => navigate("/employee/motorbike")}>
                                Quay lại danh sách
                            </Button>
                        }
                    />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-4">
                {/* Back Button */}
                <BackButton path="/employee/motorbike" />

                <div style={{ maxWidth: 800, margin: "0 auto" }}>
                    <h2 className="text-center mb-4">
                        <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                        Xóa xe máy
                    </h2>

                    {/* Warning Alert */}
                    <Alert
                        message="Cảnh báo"
                        description="Hành động này không thể hoàn tác. Xe máy sẽ bị xóa vĩnh viễn khỏi hệ thống."
                        type="warning"
                        showIcon
                        className="mb-4"
                    />

                    {/* Motorbike Information */}
                    <Card title="Thông tin xe máy cần xóa" className="mb-4">
                        <div className="row">
                            <div className="col-md-8">
                                <Descriptions column={1} bordered>
                                    <Descriptions.Item label="Mã xe">
                                        <strong>{motorbike.code}</strong>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Loại xe">
                                        {motorbike.motorbikeType?.name}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Chi nhánh">
                                        {motorbike.branchId?.city} - {motorbike.branchId?.address}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Trạng thái">
                                        {getStatusBadge(motorbike.status)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày tạo">
                                        {new Date(motorbike.createdAt).toLocaleDateString('vi-VN')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Cập nhật lần cuối">
                                        {new Date(motorbike.updatedAt).toLocaleDateString('vi-VN')}
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                            <div className="col-md-4">
                                <div className="text-center">
                                    <p><strong>Hình ảnh biển số:</strong></p>
                                    {motorbike.licensePlateImage ? (
                                        <Image
                                            src={`http://localhost:8080${motorbike.licensePlateImage}`}
                                            alt="Biển số xe"
                                            style={{
                                                width: "100%",
                                                maxWidth: "200px",
                                                borderRadius: "8px"
                                            }}
                                            className="img-thumbnail"
                                        />
                                    ) : (
                                        <div style={{
                                            width: "200px",
                                            height: "150px",
                                            border: "2px dashed #d9d9d9",
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "#fafafa",
                                            margin: "0 auto"
                                        }}>
                                            <span className="text-muted">Không có ảnh</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Delete Confirmation */}
                    <Card title="Xác nhận xóa" className="mb-4">
                        <div className="text-center">
                            <ExclamationCircleOutlined
                                style={{
                                    fontSize: '48px',
                                    color: '#ff4d4f',
                                    marginBottom: '16px'
                                }}
                            />
                            <h4>Bạn có chắc chắn muốn xóa xe máy này không?</h4>
                            <p className="text-muted">
                                Hành động này sẽ xóa vĩnh viễn xe máy <strong>{motorbike.code}</strong> khỏi hệ thống.
                            </p>

                            {/* Status Warning */}
                            {motorbike.status === 'rented' && (
                                <Alert
                                    message="Không thể xóa xe đang được thuê"
                                    description="Xe máy này đang được thuê và không thể xóa. Vui lòng đợi xe được trả lại."
                                    type="error"
                                    showIcon
                                    className="mb-3"
                                />
                            )}
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="text-center">
                        <Space size="large">
                            <Button
                                type="primary"
                                danger
                                size="large"
                                icon={<DeleteOutlined />}
                                onClick={handleDeleteMotorbike}
                                loading={deleting}
                                disabled={motorbike.status === 'rented'}
                            >
                                {deleting ? 'Đang xóa...' : 'Xác nhận xóa'}
                            </Button>
                            <Button
                                size="large"
                                icon={<ArrowLeftOutlined />}
                                onClick={handleCancel}
                            >
                                Hủy bỏ
                            </Button>
                        </Space>
                    </div>

                    {/* Additional Information */}
                    <Card title="Lưu ý" className="mt-4">
                        <ul>
                            <li>Xe máy sẽ bị xóa vĩnh viễn khỏi hệ thống</li>
                            <li>Tất cả dữ liệu liên quan đến xe máy này sẽ bị mất</li>
                            <li>Không thể xóa xe máy đang được thuê</li>
                            <li>Hành động này sẽ cập nhật số lượng tổng của loại xe tương ứng</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DeleteMotorbikePage;