import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';

const BranchPage = () => {
    const [branches, setBranches] = useState([]);

    const getAllBranches = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/branch/get-all',
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (res.data.success) {
                setBranches(res.data.branches);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllBranches();
    }, []);

    return (
        <AdminLayout>
            <div className="p-2">
                <h1 className="d-flex justify-content-center">QUẢN LÝ CHI NHÁNH</h1>
                <Link
                    to="/admin/branch/create"
                    className="d-flex justify-content-end fs-1"
                >
                    <MdOutlineAddBox />
                </Link>
                <table className="table table-bordered table-hover mt-3">
                    <thead className="table-dark text-center">
                        <tr>
                            <th>STT</th>
                            <th>Tên chi nhánh</th>
                            <th>Địa chỉ</th>
                            <th>Số điện thoại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches.map((branch, index) => (
                            <tr key={branch._id} className="align-middle text-center">
                                <td>{index + 1}</td>
                                <td>{branch.city}</td>
                                <td>{branch.address}</td>
                                <td>{branch.phone}</td>
                                <td>
                                    {branch.isActive ? (
                                        <span className="badge bg-success">Hoạt động</span>
                                    ) : (
                                        <span className="badge bg-danger">Ngừng hoạt động</span>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex justify-content-center gap-3">
                                        <Link to={`/admin/branch/update/${branch._id}`}>
                                            <AiOutlineEdit className="fs-4 text-warning" />
                                        </Link>
                                        <Link to={`/admin/branch/delete/${branch._id}`}>
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

export default BranchPage;
