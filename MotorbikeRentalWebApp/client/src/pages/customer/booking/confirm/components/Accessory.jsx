import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Table, Button, Typography, Image, message } from 'antd'
import IncrementAnDecrementButton from '../../../../../components/IncrementAnDecrementButton'
import { useBooking } from '../../../../../context/BookingContext';


const { Title, Text, Paragraph } = Typography

const Accessory = () => {
    const { bookingData, setBookingData } = useBooking();
    const [accessories, setAccessories] = useState([])
    const [selected, setSelected] = useState({}) // { [id]: quantity }

    const getAllAccessory = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/v1/employee/accessory/get-all-accessories')
            if (res.data.success) {
                setAccessories(res.data.accessories)
            }
        } catch {
            message.error('Không thể tải phụ tùng')
        }
    }

    useEffect(() => {
        getAllAccessory()
        const selectedMap = {};
        (bookingData.accessories || []).forEach(item => {
            if (item.accessory && item.accessory._id) {
                selectedMap[item.accessory._id] = item.quantity;
            }
        });
        setSelected(selectedMap);
    }, [bookingData.accessories])
    useEffect(() => {
        console.log('📦 Phụ tùng sau khi cập nhật:', bookingData.accessories);
    }, [bookingData.accessories]);


    const handleAdd = (id) => {
        const accessory = accessories.find(item => item._id === id);
        if (!accessory) return;

        // Nếu đã tồn tại thì không thêm nữa
        const exists = (bookingData.accessories || []).some(item => item.accessory._id === id);
        if (exists) return;

        setSelected(prev => ({ ...prev, [id]: 1 }));

        setBookingData(prev => ({
            ...prev,
            accessories: [
                ...(prev.accessories || []),
                { accessory: accessory, quantity: 1 }
            ]
        }));
    };



    const handleRemove = (id) => {
        // Xóa khỏi local selected
        setSelected(prev => {
            const newSelected = { ...prev };
            delete newSelected[id];
            return newSelected;
        });
        // Xóa khỏi context accessories
        setBookingData(prev => ({
            ...prev,
            accessories: (prev.accessories || []).filter(item => item.accessory._id !== id)
        }));
    };


    const handleQuantityChange = (id, value) => {
        setSelected(prev => ({ ...prev, [id]: value }));

        setBookingData(prev => ({
            ...prev,
            accessories: (prev.accessories || []).map(item =>
                item.accessory._id === id ? { ...item, quantity: value } : item
            )
        }));
    };


    const columns = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                selected[record._id] ? (
                    <Button danger onClick={() => handleRemove(record._id)}>
                        Remove
                    </Button>
                ) : (
                    <Button type="primary" onClick={() => handleAdd(record._id)}>
                        Add
                    </Button>
                )
            )
        },
        {
            title: 'Item',
            dataIndex: 'item',
            key: 'item',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Image
                        src={`http://localhost:8080${record.image}`}
                        alt={record.name}
                        width={64}
                        height={64}
                        style={{ objectFit: 'cover', borderRadius: 8, background: '#f5f5f5' }}
                        fallback="https://via.placeholder.com/64"
                        preview={false}
                    />
                    <div>
                        <Text strong style={{ fontSize: 16 }}>{record.name}</Text>
                        <div>
                            <Text type="danger" style={{ fontWeight: 500 }}>{record.price?.toLocaleString('vi-VN')}₫</Text>
                        </div>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0, color: '#666', maxWidth: 220 }}>{record.description}</Paragraph>
                    </div>
                </div>
            )
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
            render: (_, record) => (
                record.price === 0 ? (
                    <div style={{ textAlign: 'center', color: '#52c41a', fontWeight: 500 }}>Free</div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <IncrementAnDecrementButton
                            min={1}
                            max={record.quantity}
                            defaultValue={selected[record._id] || 1}
                            onChange={val => handleQuantityChange(record._id, val)}
                            disabled={!selected[record._id]}
                        />
                    </div>
                )
            )
        }
    ]

    return (
        <div
            style={{
                maxWidth: 900,
                margin: '0 auto',
                padding: 32,
                background: '#fafdff',
                borderRadius: 16,
                boxShadow: '0 2px 12px rgba(24,144,255,0.07)',
                border: '1px solid #e6f7ff',
            }}
        >
            <Title
                level={3}
                style={{
                    textAlign: 'center',
                    marginBottom: 32,
                    color: '#1890ff',
                    fontWeight: 700,
                    letterSpacing: 1
                }}
            >
                Phụ kiện
            </Title>
            <Table
                columns={columns}
                dataSource={accessories}
                rowKey="_id"
                pagination={false}
                bordered
                style={{
                    background: '#fff',
                    borderRadius: 14,
                    boxShadow: '0 1px 6px rgba(24,144,255,0.05)',
                    border: '1px solid #e6f7ff',
                    overflow: 'hidden',
                }}
            />
        </div>
    )
}

export default Accessory