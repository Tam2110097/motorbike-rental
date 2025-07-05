import React, { useEffect, useState } from 'react'
import AdminLayout from '../../../components/AdminLayout'
import { Space, Table, Tag } from 'antd';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import { AiOutlineEdit } from 'react-icons/ai';
import { Tabs } from 'antd';

const PricingRulePage = () => {
    const [pricingRules, setPricingRules] = useState([]);

    const getAllPricingRules = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/admin/pricing-rule/get-all');
            if (res.data.success) {
                setPricingRules(res.data.pricingRules);
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        getAllPricingRules();
    }, []);

    const renderTable = () => {
        return (
            <table className="table table-bordered table-hover">
                <thead className="table-dark text-center" style={{ textAlign: "center", verticalAlign: "middle" }}>
                    <tr>
                        <th rowSpan="2" >STT</th>
                        <th rowSpan="2">Tên quy tắc</th>
                        <th colSpan="2">Giá thuê</th>
                        <th rowSpan="2">Số ngày bắt đầu giảm giá</th>
                        <th rowSpan="2">% Giảm giá</th>
                        <th rowSpan="2">Hành động</th>
                    </tr>
                    <tr>
                        <th>Nhận/trả cùng chi nhánh</th>
                        <th>Nhận/trả khác chi nhánh</th>
                    </tr>
                </thead>
                <tbody>
                    {pricingRules.map((pricingRule, index) => (
                        <tr key={pricingRule._id} className="align-middle text-center">
                            <td>{index + 1}</td>
                            <td>{pricingRule.name}</td>
                            <td>{pricingRule.sameBranchPrice}</td>
                            <td>{pricingRule.differentBranchPrice}</td>
                            <td rowSpan="1">{pricingRule.discountDay}</td>
                            <td rowSpan="1">{pricingRule.discountPercent}%</td>
                            <td rowSpan="1">
                                <div className="d-flex justify-content-center gap-3">
                                    <Link to={`/admin/pricing-rule/update/${pricingRule._id}`}>
                                        <AiOutlineEdit className="fs-4 text-warning" />
                                    </Link>
                                    <Link to={`/admin/pricing-rule/delete/${pricingRule._id}`}>
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
                <h1 className="d-flex justify-content-center">QUY TẮC GIÁ THUÊ</h1>
                <Link
                    to="/admin/pricing-rule/create"
                    className="d-flex justify-content-end fs-1"
                >
                    <MdOutlineAddBox />
                </Link>
                {renderTable()}
            </div>
        </AdminLayout>
    )
}

export default PricingRulePage
