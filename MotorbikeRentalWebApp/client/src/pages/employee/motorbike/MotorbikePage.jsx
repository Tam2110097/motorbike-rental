import React, { useState } from 'react'
import axios from 'axios'
import { useEffect } from 'react'
import AdminLayout from '../../../components/AdminLayout'
import { Link } from 'react-router-dom'
import { MdOutlineAddBox } from 'react-icons/md'
import { AiOutlineEdit } from 'react-icons/ai'
import { MdOutlineDelete } from 'react-icons/md'
import { Form, message, Select, Button, Tabs } from 'antd'

const MotorbikePage = () => {
    const [motorbikes, setMotorbikes] = useState([]);
    const [branchList, setBranchList] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState("");
    const [loading, setLoading] = useState(false);

    const getAllMotorbikes = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:8080/api/v1/employee/motorbike/get-all",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setMotorbikes(res.data.motorbikes);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách xe máy");
        } finally {
            setLoading(false);
        }
    }

    const getMotorbikesByBranch = async (branchId) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/employee/motorbike/get-by-branch/${branchId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setMotorbikes(res.data.motorbikes);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách xe máy theo chi nhánh");
        } finally {
            setLoading(false);
        }
    }

    const getAllBranch = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/v1/admin/branch/get-all",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setBranchList(res.data.branches);
            } else {
                message.error(res.data.message || "Lỗi khi lấy danh sách chi nhánh");
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi lấy danh sách chi nhánh");
        }
    }

    const handleBranchChange = (branchId) => {
        setSelectedBranchId(branchId);
        if (branchId) {
            getMotorbikesByBranch(branchId);
        } else {
            getAllMotorbikes();
        }
    }

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
    }

    // Group motorbikes by status
    const groupMotorbikesByStatus = (motorbikes) => {
        const grouped = {
            available: [],
            rented: [],
            maintenance: [],
            out_of_service: [],
            reserved: []
        };

        motorbikes.forEach(motorbike => {
            if (grouped[motorbike.status]) {
                grouped[motorbike.status].push(motorbike);
            }
        });

        return grouped;
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'available': return 'Có sẵn';
            case 'rented': return 'Đã thuê';
            case 'maintenance': return 'Đang sửa chữa';
            case 'out_of_service': return 'Đã hỏng';
            case 'reserved': return 'Đã đặt';
            default: return status;
        }
    };

    useEffect(() => {
        getAllMotorbikes();
        getAllBranch();
    }, []);

    return (
        <AdminLayout>
            <div className="p-2">
                <h1 className="d-flex justify-content-center">QUẢN LÝ XE MÁY</h1>

                {/* Branch Filter */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={{ width: '300px' }}>
                        <Select
                            placeholder="Chọn chi nhánh để lọc (hoặc để trống để xem tất cả)"
                            value={selectedBranchId}
                            onChange={handleBranchChange}
                            allowClear
                            style={{ width: '100%' }}
                        >
                            {branchList.map((branch) => (
                                <Select.Option key={branch._id} value={branch._id}>
                                    {branch.city}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <Link to="/employee/motorbike/create">
                        <Button type="primary" icon={<MdOutlineAddBox />}>
                            Thêm xe máy
                        </Button>
                    </Link>
                </div>
                {/* Summary */}
                <div className="mt-3">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="card bg-primary text-white">
                                <div className="card-body text-center">
                                    <h5>Tổng số xe</h5>
                                    <h3>{motorbikes.length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-success text-white">
                                <div className="card-body text-center">
                                    <h5>Có sẵn</h5>
                                    <h3>{motorbikes.filter(m => m.status === 'available').length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-warning text-white">
                                <div className="card-body text-center">
                                    <h5>Đã thuê</h5>
                                    <h3>{motorbikes.filter(m => m.status === 'rented').length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-info text-white">
                                <div className="card-body text-center">
                                    <h5>Đang sửa chữa</h5>
                                    <h3>{motorbikes.filter(m => m.status === 'maintenance').length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Motorbikes Table with Tabs */}
                <div className="table-responsive">
                    <Tabs
                        defaultActiveKey="all"
                        style={{ background: '#fff', padding: '20px', borderRadius: '12px' }}
                        items={[
                            {
                                key: 'all',
                                label: `Tất cả (${motorbikes.length})`,
                                children: (
                                    <table className="table table-bordered table-hover">
                                        <thead className="table-dark text-center">
                                            <tr>
                                                <th>STT</th>
                                                <th>Mã xe</th>
                                                <th>Loại xe</th>
                                                {!selectedBranchId && <th>Chi nhánh</th>}
                                                <th>Hình ảnh biển số</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan={selectedBranchId ? 7 : 8} className="text-center">
                                                        <div className="spinner-border" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : motorbikes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={selectedBranchId ? 7 : 8} className="text-center">
                                                        {selectedBranchId ? 'Không có xe máy nào trong chi nhánh này' : 'Không có xe máy nào'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                motorbikes.map((motorbike, index) => (
                                                    <tr key={motorbike._id} className="align-middle text-center">
                                                        <td>{index + 1}</td>
                                                        <td>
                                                            <strong>{motorbike.code}</strong>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>{motorbike.motorbikeType?.name}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    Giá: {motorbike.motorbikeType?.price?.toLocaleString('vi-VN')} VNĐ
                                                                </small>
                                                            </div>
                                                        </td>
                                                        {!selectedBranchId && (
                                                            <td>
                                                                <strong>{motorbike.branchId?.city}</strong>
                                                                <br />
                                                                <small className="text-muted">
                                                                    {motorbike.branchId?.address}
                                                                </small>
                                                            </td>
                                                        )}
                                                        <td>
                                                            {motorbike.licensePlateImage ? (
                                                                <img
                                                                    src={`http://localhost:8080${motorbike.licensePlateImage}`}
                                                                    alt="Biển số xe"
                                                                    style={{
                                                                        width: "80px",
                                                                        height: "60px",
                                                                        objectFit: "cover",
                                                                        borderRadius: "4px"
                                                                    }}
                                                                    className="img-thumbnail"
                                                                />
                                                            ) : (
                                                                <span className="text-muted">Không có ảnh</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {getStatusBadge(motorbike.status)}
                                                        </td>
                                                        <td>
                                                            {new Date(motorbike.createdAt).toLocaleDateString('vi-VN')}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex justify-content-center gap-2">
                                                                <Link to={`/employee/motorbike/update/${motorbike._id}`}>
                                                                    <AiOutlineEdit className="fs-4 text-warning" title="Chỉnh sửa" />
                                                                </Link>
                                                                <Link to={`/employee/motorbike/delete/${motorbike._id}`}>
                                                                    <MdOutlineDelete className="fs-4 text-danger" title="Xóa" />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                )
                            },
                            ...Object.entries(groupMotorbikesByStatus(motorbikes)).map(([status, statusMotorbikes]) => ({
                                key: status,
                                label: (
                                    <span>
                                        {getStatusLabel(status)} ({statusMotorbikes.length})
                                    </span>
                                ),
                                children: statusMotorbikes.length > 0 ? (
                                    <table className="table table-bordered table-hover">
                                        <thead className="table-dark text-center">
                                            <tr>
                                                <th>STT</th>
                                                <th>Mã xe</th>
                                                <th>Loại xe</th>
                                                {!selectedBranchId && <th>Chi nhánh</th>}
                                                <th>Hình ảnh biển số</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statusMotorbikes.map((motorbike, index) => (
                                                <tr key={motorbike._id} className="align-middle text-center">
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <strong>{motorbike.code}</strong>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <strong>{motorbike.motorbikeType?.name}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                Giá: {motorbike.motorbikeType?.price?.toLocaleString('vi-VN')} VNĐ
                                                            </small>
                                                        </div>
                                                    </td>
                                                    {!selectedBranchId && (
                                                        <td>
                                                            <strong>{motorbike.branchId?.city}</strong>
                                                            <br />
                                                            <small className="text-muted">
                                                                {motorbike.branchId?.address}
                                                            </small>
                                                        </td>
                                                    )}
                                                    <td>
                                                        {motorbike.licensePlateImage ? (
                                                            <img
                                                                src={`http://localhost:8080${motorbike.licensePlateImage}`}
                                                                alt="Biển số xe"
                                                                style={{
                                                                    width: "80px",
                                                                    height: "60px",
                                                                    objectFit: "cover",
                                                                    borderRadius: "4px"
                                                                }}
                                                                className="img-thumbnail"
                                                            />
                                                        ) : (
                                                            <span className="text-muted">Không có ảnh</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {getStatusBadge(motorbike.status)}
                                                    </td>
                                                    <td>
                                                        {new Date(motorbike.createdAt).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td>
                                                        <div className="d-flex justify-content-center gap-2">
                                                            <Link to={`/employee/motorbike/update/${motorbike._id}`}>
                                                                <AiOutlineEdit className="fs-4 text-warning" title="Chỉnh sửa" />
                                                            </Link>
                                                            <Link to={`/employee/motorbike/delete/${motorbike._id}`}>
                                                                <MdOutlineDelete className="fs-4 text-danger" title="Xóa" />
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                        Không có xe máy nào ở trạng thái "{getStatusLabel(status)}"
                                    </div>
                                )
                            }))
                        ]}
                    />
                </div>
            </div>
        </AdminLayout>
    )
}

export default MotorbikePage