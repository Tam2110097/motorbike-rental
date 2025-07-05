import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AiOutlineEdit } from "react-icons/ai";
import { BsInfoCircle } from "react-icons/bs";
import { MdOutlineAddBox, MdOutlineDelete } from "react-icons/md";
import axios from "axios";
import AdminLayout from "../../../components/AdminLayout";

const AccessoryPage = () => {
    const [accessories, setAccessories] = useState([]);
    //getAllAccessory
    const getAllAccessory = async () => {
        try {
            const res = await axios.get(
                "http://localhost:8080/api/v1/employee/accessory/get-all-accessories",
                // {
                //   headers: {
                //     Authorization: `Bearer ${localStorage.getItem("token")}`,
                //   },
                // }
            );
            if (res.data.success) {
                setAccessories(res.data.accessories);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllAccessory();
    }, []);
    useEffect(() => {
        console.log(accessories)
    }, [accessories]);

    return (
        <AdminLayout>
            <div className="p-2">
                <h1 className="d-flex justify-content-center">QUẢN LÝ SẢN PHẨM</h1>
                <Link
                    to="/employee/accessory/create"
                    className="d-flex justify-content-end fs-1"
                >
                    <MdOutlineAddBox></MdOutlineAddBox>
                </Link>
                <table className="table table-bordered table-hover">
                    <thead className="table-dark text-center">
                        <tr>
                            <th>STT</th>
                            <th>Tên</th>
                            <th>Giá</th>
                            <th>Số lượng</th>
                            <th>Mô tả</th>
                            <th>Hình ảnh</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(accessories) && accessories.map((accessory, index) => (
                            <tr key={accessory._id} className="align-middle text-center">
                                <td>{index + 1}</td>
                                <td>{accessory.name}</td>
                                <td>{accessory.price}</td>
                                <td>{accessory.quantity}</td>
                                <td>{accessory.description}</td>
                                <td>
                                    <img
                                        src={`http://localhost:8080${accessory.image}`}
                                        alt="Accessory"
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            objectFit: "cover",
                                        }}
                                    />
                                </td>
                                <td>
                                    <div className="d-flex justify-content-center gap-3">
                                        <Link to={`/employee/accessory/update/${accessory._id}`}>
                                            <AiOutlineEdit className="fs-4 text-warning" />
                                        </Link>
                                        <Link to={`/employee/accessory/delete/${accessory._id}`}>
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

export default AccessoryPage;
