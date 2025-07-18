import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';

const SpecificationPage = () => {
    const [specs, setSpecs] = useState([]);

    const getAllSpecs = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/specifications/get-all',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setSpecs(res.data.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllSpecs();
    }, []);

    return (
        <AdminLayout>
            <div className="p-2">
                <h1 className="d-flex justify-content-center">QUẢN LÝ THÔNG SỐ KỸ THUẬT</h1>
                <Link
                    to="/admin/specification/create"
                    className="d-flex justify-content-end fs-1"
                >
                    <MdOutlineAddBox />
                </Link>
                <table className="table table-bordered table-hover mt-3">
                    <thead className="table-dark text-center">
                        <tr>
                            <th>STT</th>
                            <th>Loại xe</th>
                            <th>Truyền động</th>
                            <th>Số cấp</th>
                            <th>Dung tích động cơ</th>
                            <th>Chiều cao yên</th>
                            <th>Trọng lượng</th>
                            <th>Công suất</th>
                            <th>Dung tích bình xăng</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {specs.map((spec, index) => (
                            <tr key={spec._id} className="align-middle text-center">
                                <td>{index + 1}</td>
                                <td>{spec.motorbikeType?.name}</td>
                                <td>{spec.transmission}</td>
                                <td>{spec.gears}</td>
                                <td>{spec.engineSize}</td>
                                <td>{spec.seatHeight}</td>
                                <td>{spec.weight}</td>
                                <td>{spec.horsePower}</td>
                                <td>{spec.tankSize}</td>
                                <td>
                                    <div className="d-flex justify-content-center gap-3">
                                        <Link to={`/admin/specification/update/${spec._id}`}>
                                            <AiOutlineEdit className="fs-4 text-warning" />
                                        </Link>
                                        <Link to={`/admin/specification/delete/${spec._id}`}>
                                            <MdOutlineDelete className="fs-4 text-danger" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default SpecificationPage; 