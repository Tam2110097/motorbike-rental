import React from "react";
import Spinner from "../../../components/Spinner";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { hideLoading, showLoading } from "../../../redux/features/alertSlice";
import { message } from "antd";
import AdminLayout from "../../../components/AdminLayout";

const DeleteMotorbikeTypePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const handleDeleteMotorbikeType = async () => {
        dispatch(showLoading());
        try {
            const res = await axios.delete(
                `http://localhost:8080/api/v1/admin/motorbike-type/delete/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            dispatch(hideLoading());
            if (res.data.success) {
                message.success("Xoá loại xe thành công");
            } else {
                message.error(res.data.message);
            }
            setTimeout(() => navigate("/admin/motorbike-type"), 500);
        } catch (error) {
            dispatch(hideLoading());
            console.error("Lỗi khi xoá loại xe:", error);
            const errorMessage =
                error.response?.data?.message || "Lỗi khi xoá loại xe!";
            message.error(errorMessage);
        }
    };
    const handleCancel = () => {
        navigate("/admin/motorbike-type");
    };
    return (
        <AdminLayout>
            <div>
                <h1 className="text-center">Xoá loại xe</h1>
                <div className="m-2 border border-secondary bg-light rounded">
                    <h3 className="text-center">
                        Bạn có chắc chắn muốn xóa loại xe này không?
                    </h3>
                    <div className="d-flex justify-content-center">
                        <button
                            className="m-1 btn btn-danger"
                            onClick={handleDeleteMotorbikeType}
                        >
                            Đồng ý
                        </button>
                        <button className="m-1 btn btn-secondary" onClick={handleCancel}>
                            Hủy
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DeleteMotorbikeTypePage;