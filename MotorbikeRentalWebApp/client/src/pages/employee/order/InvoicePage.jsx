import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const InvoicePage = () => {
    const { orderId } = useParams();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://localhost:8080/api/v1/employee/order/full-invoice/${orderId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => {
                setInvoice(res.data.invoice);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                setInvoice(null);
            });
    }, [orderId]);

    if (loading) return <div>Đang tải dữ liệu...</div>;
    if (!invoice) return <div>Không tìm thấy hóa đơn.</div>;

    const totalDays = Math.max(
        1,
        Math.ceil((new Date(invoice.returnDate) - new Date(invoice.receiveDate)) / (1000 * 60 * 60 * 24))
    );

    // Helper for safe access
    const getTypeName = (obj, fallback) => (obj && typeof obj === 'object' ? obj.name : fallback || '');
    const getTypePrice = (obj, fallback) => (obj && typeof obj === 'object' ? obj.price : fallback || 0);
    // const getTypeImage = (obj) => (obj && typeof obj === 'object' ? obj.image : '');
    // const getPlateImage = (mb) => mb?.motorbikeId?.licensePlateImage ? `http://localhost:8080${mb.motorbikeId.licensePlateImage}` : '';

    return (
        <div style={{ padding: 30, maxWidth: 900, margin: '0 auto', fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff', color: '#222', boxShadow: '0 2px 16px rgba(0,0,0,0.08)', borderRadius: 10 }}>
            <style>{`
                @media print {
                    button { display: none !important; }
                    .no-print { display: none !important; }
                    body { background: #fff !important; }
                }
                th, td { padding: 8px 12px; font-size: 15px; }
                th { background: #f3f4f6; font-weight: 600; }
                table { border-radius: 6px; overflow: hidden; }
                h1 { font-size: 2.1rem; margin-bottom: 10px; }
                h3 { margin-top: 28px; margin-bottom: 10px; font-size: 1.15rem; color: #374151; }
                .invoice-section { margin-bottom: 18px; }
                .invoice-label { color: #555; min-width: 120px; display: inline-block; }
                .invoice-value { font-weight: 500; }
            `}</style>
            <h1 style={{ textAlign: 'center', marginBottom: 8, letterSpacing: 1 }}>HÓA ĐƠN THUÊ XE</h1>
            <div style={{ textAlign: 'center', marginBottom: 24, fontWeight: 600, color: '#374151' }}>Motorbike Rental - {new Date().toLocaleDateString()}</div>
            <div className="invoice-section">
                <span className="invoice-label"><strong>Mã đơn:</strong></span> <span className="invoice-value">{invoice.orderCode}</span>
            </div>
            <div className="invoice-section">
                <span className="invoice-label"><strong>Ngày thuê:</strong></span> <span className="invoice-value">{invoice.receiveDate ? new Date(invoice.receiveDate).toLocaleDateString() : ''}</span>
            </div>
            <div className="invoice-section">
                <span className="invoice-label"><strong>Ngày trả:</strong></span> <span className="invoice-value">{invoice.returnDate ? new Date(invoice.returnDate).toLocaleDateString() : ''}</span>
            </div>

            <h3>Thông tin khách hàng</h3>
            <div className="invoice-section"><span className="invoice-label">Họ tên:</span> <span className="invoice-value">{invoice.customerId?.fullName || '-'}</span></div>
            <div className="invoice-section"><span className="invoice-label">Email:</span> <span className="invoice-value">{invoice.customerId?.email || '-'}</span></div>
            <div className="invoice-section"><span className="invoice-label">SĐT:</span> <span className="invoice-value">{invoice.customerId?.phone || '-'}</span></div>

            <h3>Chi nhánh</h3>
            <div className="invoice-section"><span className="invoice-label">Nhận xe tại:</span> <span className="invoice-value">{invoice.branchReceive?.city || '-'} - {invoice.branchReceive?.address || '-'}</span></div>
            <div className="invoice-section"><span className="invoice-label">Trả xe tại:</span> <span className="invoice-value">{invoice.branchReturn?.city || '-'} - {invoice.branchReturn?.address || '-'}</span></div>

            <h3>Chi tiết loại xe thuê</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 10, border: '1px solid #e5e7eb' }}>
                <thead>
                    <tr>
                        <th>Tên loại xe</th>
                        <th>SL</th>
                        <th>Đơn giá/ngày</th>
                        <th>Ngày</th>
                        <th>Bảo hiểm</th>
                        <th>Tổng</th>
                    </tr>
                </thead>
                <tbody>
                    {(invoice.motorbikeDetails || []).map((d, idx) => {
                        const type = d.motorbikeTypeId;
                        const unitPrice = d.unitPrice || getTypePrice(type);
                        const total = unitPrice * totalDays * d.quantity + (d.damageWaiverFee || 0) * totalDays * d.quantity;
                        return (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td>{getTypeName(type)}</td>
                                <td>{d.quantity}</td>
                                <td>{unitPrice.toLocaleString()}đ</td>
                                <td>{totalDays}</td>
                                <td>{d.damageWaiverFee ? d.damageWaiverFee.toLocaleString() + 'đ/ngày' : '-'}</td>
                                <td>{total.toLocaleString()}đ</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <h3>Chi tiết xe giao</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, border: '1px solid #e5e7eb' }}>
                <thead>
                    <tr>
                        <th>Tên xe</th>
                        <th>SL</th>
                        <th>Mã xe</th>
                    </tr>
                </thead>
                <tbody>
                    {invoice.motorbikesByType ?
                        Object.values(invoice.motorbikesByType).map((typeData, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td>{getTypeName(typeData.motorbikeTypeId)}</td>
                                <td>{typeData.quantity}</td>
                                <td>{typeData.codes && typeData.codes.length > 0 ? typeData.codes.join(', ') : '-'}</td>
                            </tr>
                        ))
                        :
                        (invoice.motorbikes || []).map((m, idx) => (
                            <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td>{getTypeName(m.motorbikeTypeId)}</td>
                                <td>{m.quantity}</td>
                                <td>{m.motorbikeId?.code || '-'}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

            {invoice.accessories && invoice.accessories.length > 0 && (
                <>
                    <h3>Phụ kiện thuê thêm</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, border: '1px solid #e5e7eb' }}>
                        <thead>
                            <tr>
                                <th>Tên phụ kiện</th>
                                <th>SL</th>
                                <th>Đơn giá</th>
                                <th>Tổng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.accessories.map((a, idx) => {
                                const type = a.accessory;
                                const price = getTypePrice(type);
                                const total = price * a.quantity;
                                return (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                        <td>{getTypeName(type)}</td>
                                        <td>{a.quantity}</td>
                                        <td>{price.toLocaleString()}đ</td>
                                        <td>{total.toLocaleString()}đ</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            )}

            <div style={{ margin: '24px 0', textAlign: 'right', fontSize: 18 }}>
                <div><b>Đặt cọc trước:</b> {invoice.preDepositTotal?.toLocaleString()}đ</div>
                <div><b>Đặt cọc khi nhận xe:</b> {invoice.depositTotal?.toLocaleString()}đ</div>
                <div><b>Tổng cộng:</b> <span style={{ fontSize: 22, color: '#b91c1c' }}>{invoice.grandTotal?.toLocaleString()}đ</span></div>
            </div>

            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', width: '40%' }}>
                    <div><b>Khách hàng</b></div>
                    <div style={{ height: 60 }}></div>
                    <div>(Ký, ghi rõ họ tên)</div>
                </div>
                <div style={{ textAlign: 'center', width: '40%' }}>
                    <div><b>Nhân viên</b></div>
                    <div style={{ height: 60 }}></div>
                    <div>(Ký, ghi rõ họ tên)</div>
                </div>
            </div>

            <div className="no-print" style={{ marginTop: 30, textAlign: 'center' }}>
                <button onClick={() => window.print()}>In hóa đơn</button>
            </div>
        </div>
    );
};

export default InvoicePage;
