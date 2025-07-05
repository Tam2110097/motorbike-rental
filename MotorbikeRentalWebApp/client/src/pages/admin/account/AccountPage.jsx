import React, { useEffect, useState } from 'react'
import AdminLayout from '../../../components/AdminLayout'
import { Space, Table, Tag } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';
import { Tabs } from 'antd';

const AccountPage = () => {
    const [accounts, setAccounts] = useState([]);

    const getAllAccounts = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/account/get-all');
            if (res.data.success) {
                setAccounts(res.data.users);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getAllAccounts();
    }, []);

    const renderTable = (roleName) => {
        const filteredAccounts = accounts.filter((acc) => acc.role?.name === roleName);
        return (
            <table className="table table-bordered table-hover">
                <thead className="table-dark text-center">
                    <tr>
                        <th>STT</th>
                        <th>Họ và tên</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Vai trò</th>
                        {/* {roleName === "employee" && <th>Ngày nhận việc</th>} */}
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAccounts.map((account, index) => (
                        <tr key={account._id} className="align-middle text-center">
                            <td>{index + 1}</td>
                            <td>{account.fullName}</td>
                            <td>{account.email}</td>
                            <td>{account.phone}</td>
                            <td>{account.role?.name || 'Unknown'}</td>
                            {/* {roleName === "employee" && (
                    <td>{new Date(account?.hire_date).toLocaleDateString()}</td>
                  )} */}
                            <td>
                                <div className="d-flex justify-content-center gap-3">
                                    <Link to={`/admin/account/update/${account._id}`}>
                                        <AiOutlineEdit className="fs-4 text-warning" />
                                    </Link>
                                    <Link to={`/admin/account/delete/${account._id}`}>
                                        <MdOutlineDelete className="fs-4 text-danger" />
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    return (
        <AdminLayout>
            <div className="p-2">
                <h1 className="d-flex justify-content-center">QUẢN LÝ TÀI KHOẢN</h1>
                <Link
                    to="/admin/account/create"
                    className="d-flex justify-content-end fs-1"
                >
                    <MdOutlineAddBox />
                </Link>
                <Tabs
                    defaultActiveKey="admin"
                    items={[
                        { key: "admin", label: "Admin", children: renderTable("admin") },
                        {
                            key: "employee",
                            label: "Nhân viên",
                            children: renderTable("employee"),
                        },
                        {
                            key: "customer",
                            label: "Khách hàng",
                            children: renderTable("customer"),
                        },
                    ]}
                />
            </div>
        </AdminLayout>
    )
}

export default AccountPage
