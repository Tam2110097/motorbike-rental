import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminLayout';

const FeedBackPage = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8080/api/v1/admin/feedback/get-all', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setFeedbacks(data.feedbacks || []);
                } else {
                    setError(data.message || 'Failed to fetch feedbacks');
                }
            } catch {
                setError('Error fetching feedbacks');
            } finally {
                setLoading(false);
            }
        };
        fetchFeedbacks();
    }, []);

    return (
        <AdminLayout>
            <h2 className="text-center">Feed Back Page</h2>
            {loading ? (
                <div>Loading...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Customer</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Score</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Comment</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Order Info</th>
                            <th style={{ border: '1px solid #ccc', padding: 8 }}>Created At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {feedbacks.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center' }}>No feedback found.</td></tr>
                        ) : feedbacks.map(fb => {
                            const order = fb.rentalOrderId;
                            return (
                                <tr key={fb._id}>
                                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.customerId?.fullName || 'N/A'}<br />{fb.customerId?.email || ''}</td>
                                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.satisfactionScore}</td>
                                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.comment}</td>
                                    <td style={{ border: '1px solid #ccc', padding: 8 }}>
                                        <div><b>Order ID:</b> {order?._id || 'N/A'}</div>
                                        <div><b>Branch Receive:</b> {order?.branchReceive ? `${order.branchReceive.city}, ${order.branchReceive.address}` : 'N/A'}</div>
                                        <div><b>Branch Return:</b> {order?.branchReturn ? `${order.branchReturn.city}, ${order.branchReturn.address}` : 'N/A'}</div>
                                        <div><b>Motorbikes:</b>
                                            {order?.motorbikes && order.motorbikes.length > 0 ? (
                                                <table style={{ width: '100%', border: '1px solid #eee', marginTop: 4 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ border: '1px solid #eee', padding: 4 }}>Type</th>
                                                            <th style={{ border: '1px solid #eee', padding: 4 }}>Code</th>
                                                            <th style={{ border: '1px solid #eee', padding: 4 }}>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {order.motorbikes.map((mb, idx) => (
                                                            <tr key={idx}>
                                                                <td style={{ border: '1px solid #eee', padding: 4 }}>{mb.motorbikeTypeId?.name || '-'}</td>
                                                                <td style={{ border: '1px solid #eee', padding: 4 }}>{mb.motorbikeId?.code || '-'}</td>
                                                                <td style={{ border: '1px solid #eee', padding: 4 }}>{mb.motorbikeId?.status || '-'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            ) : 'N/A'}
                                        </div>
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{new Date(fb.createdAt).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </AdminLayout>
    );
};

export default FeedBackPage;
