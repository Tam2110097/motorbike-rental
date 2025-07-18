import React, { useEffect, useState } from 'react';
import { Button, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../../components/AdminLayout';
import BackButton from '../../../components/BackButton';

const DeleteSpecificationPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [spec, setSpec] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpec = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/v1/admin/specifications/get-by-id/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                if (res.data.success) {
                    setSpec(res.data.data);
                }
                setLoading(false);
            } catch {
                message.error('Không thể tải dữ liệu');
                setLoading(false);
            }
        };
        fetchSpec();
    }, [id]);

    const handleDelete = async () => {
        try {
            const res = await axios.delete(`http://localhost:8080/api/v1/admin/specifications/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                message.success('Xóa thông số kỹ thuật thành công');
                navigate('/admin/specification');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (!spec) return <div>Không tìm thấy thông số kỹ thuật</div>;

    return (
        <AdminLayout>
            <div className="p-4">
                <BackButton path="/admin/specification" />
                <h3 className="text-center">Xóa thông số kỹ thuật</h3>
                <div className="mb-3">Bạn có chắc chắn muốn xóa thông số kỹ thuật cho loại xe <b>{spec.motorbikeType?.name}</b> không?</div>
                <Button type="primary" danger onClick={handleDelete}>Xóa</Button>
            </div>
        </AdminLayout>
    );
};

export default DeleteSpecificationPage; 