import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox, MdOutlineDelete, MdInfoOutline, MdSettings } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';
import { Modal } from 'antd';

const MotorbikeTypePage = () => {
    const [motorbikeTypes, setMotorbikeTypes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMotorbike, setSelectedMotorbike] = useState(null); // để chứa dữ liệu loại xe được bấm vào

    const getAllMotorbikeTypes = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/motorbike-type/get-all',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setMotorbikeTypes(res.data.motorbikeTypes);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllMotorbikeTypes();
    }, []);

    const showModal = (motorbikeType) => {
        setSelectedMotorbike(motorbikeType);
        setIsModalOpen(true);
    };
    const handleOk = () => setIsModalOpen(false);
    const handleCancel = () => setIsModalOpen(false);

    return (
        <AdminLayout>
            <div className="p-2">
                <h1 className="d-flex justify-content-center">QUẢN LÝ LOẠI XE</h1>
                <Link
                    to="/admin/motorbike-type/create"
                    className="d-flex justify-content-end fs-1"
                >
                    <MdOutlineAddBox />
                </Link>
                <table className="table table-bordered table-hover mt-3">
                    <thead className="table-dark text-center">
                        <tr>
                            <th>STT</th>
                            <th>Tên loại xe</th>
                            <th>Giá loại xe</th>
                            <th>Hình ảnh</th>
                            <th>Mã loại xe</th>
                            <th>Số lượng</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {motorbikeTypes.map((motorbikeType, index) => (
                            <tr key={motorbikeType._id} className="align-middle text-center">
                                <td>{index + 1}</td>
                                <td>{motorbikeType.name}</td>
                                <td>{motorbikeType.price}</td>
                                <td>
                                    <img src={`http://localhost:8080${motorbikeType.image}`}
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                        }}
                                        alt={motorbikeType.name}
                                        className="img-fluid"
                                    />
                                </td>
                                <td>{motorbikeType.prefixCode}</td>
                                <td>{motorbikeType.totalQuantity}</td>
                                <td>
                                    <div className="d-flex justify-content-center gap-3">
                                        <Link to={`/admin/motorbike-type/update/${motorbikeType._id}`}>
                                            <AiOutlineEdit className="fs-4 text-warning" />
                                        </Link>
                                        <Link to={`/admin/motorbike-type/delete/${motorbikeType._id}`}>
                                            <MdOutlineDelete className="fs-4 text-danger" />
                                        </Link>
                                        <MdInfoOutline
                                            className="fs-4 text-primary"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => showModal(motorbikeType)}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Modal chi tiết */}
                <Modal
                    title="Chi tiết loại xe"
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    footer={null}
                >
                    {selectedMotorbike && (
                        <div className="d-flex flex-column gap-1 fs-5">
                            {[
                                { label: "Tên", value: selectedMotorbike.name },
                                { label: "Giá", value: selectedMotorbike.price },
                                { label: "Mã loại xe", value: selectedMotorbike.prefixCode },
                                { label: "Số lượng", value: selectedMotorbike.totalQuantity },
                                { label: "Tiền cọc", value: selectedMotorbike.deposit },
                                { label: "Tiền cọc trước", value: selectedMotorbike.preDeposit },
                                { label: "Tiền bảo hiểm", value: selectedMotorbike.dailyDamageWaiver },
                                { label: "Quy tắc giá", value: selectedMotorbike.pricingRule?.name },
                                { label: "Mô tả", value: selectedMotorbike.description },
                            ].map((item, index) => (
                                <div key={index}>
                                    <strong>{item.label}:</strong> {item.value}
                                </div>
                            ))}

                            <div className="mt-2">
                                <strong>Ảnh:</strong><br />
                                <img
                                    src={`http://localhost:8080${selectedMotorbike.image}`}
                                    alt={selectedMotorbike.name}
                                    style={{ width: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 8 }}
                                />
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AdminLayout>
    );
};

export default MotorbikeTypePage;
