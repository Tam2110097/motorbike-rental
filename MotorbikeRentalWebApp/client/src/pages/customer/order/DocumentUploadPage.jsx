import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Button, Upload, message, Typography, Spin, Alert, Modal } from 'antd';
import { UploadOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import HeaderBar from '../../../components/HeaderBar';
import axios from 'axios';

const { Content } = Layout;
const { Title, Text } = Typography;

const DocumentUploadPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);
    const [cccdFiles, setCccdFiles] = useState({});
    const [licenseFiles, setLicenseFiles] = useState({});
    const [existingDocuments, setExistingDocuments] = useState(null);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        fetchOrderInfo();
    }, [orderId]);

    const fetchOrderInfo = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/v1/customer/order/${orderId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setOrderInfo(response.data.rentalOrder);
            }

            // Fetch existing documents
            try {
                const docResponse = await axios.get(`http://localhost:8080/api/v1/customer/order/${orderId}/documents`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log('Document response:', docResponse.data);

                if (docResponse.data.success && docResponse.data.documents) {
                    setExistingDocuments(docResponse.data.documents);
                    console.log('Existing documents set:', docResponse.data.documents);
                }
            } catch (error) {
                console.log('Error fetching documents:', error);
                // No existing documents found
                setExistingDocuments(null);
            }
        } catch {
            message.error('Không thể tải thông tin đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    // Calculate total motorbike quantity from order
    const getTotalMotorbikeQuantity = () => {
        if (!orderInfo?.motorbikes) return 0;
        return orderInfo.motorbikes.reduce((total, motorbike) => total + motorbike.quantity, 0);
    };

    const handleCccdUpload = (index, { fileList }) => {
        setCccdFiles(prev => ({
            ...prev,
            [index]: fileList
        }));
    };

    const handleLicenseUpload = (index, { fileList }) => {
        setLicenseFiles(prev => ({
            ...prev,
            [index]: fileList
        }));
    };

    const handleSubmit = async () => {
        const totalQuantity = getTotalMotorbikeQuantity();
        const allCccdFiles = Object.values(cccdFiles).flat();
        const allLicenseFiles = Object.values(licenseFiles).flat();

        if (allCccdFiles.length === 0 && allLicenseFiles.length === 0) {
            message.warning('Vui lòng tải lên ít nhất một loại giấy tờ');
            return;
        }

        // Validate that we have enough documents for each motorbike
        if (allCccdFiles.length < totalQuantity) {
            message.warning(`Vui lòng tải lên đủ ${totalQuantity} CCCD/CMND cho ${totalQuantity} xe`);
            return;
        }

        if (allLicenseFiles.length < totalQuantity) {
            message.warning(`Vui lòng tải lên đủ ${totalQuantity} bằng lái xe cho ${totalQuantity} xe`);
            return;
        }

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            console.log('Frontend - allCccdFiles:', allCccdFiles);
            console.log('Frontend - allLicenseFiles:', allLicenseFiles);

            allCccdFiles.forEach((file, index) => {
                console.log(`Frontend - CCCD file ${index}:`, file);
                formData.append('cccdImages', file.originFileObj);
            });

            allLicenseFiles.forEach((file, index) => {
                console.log(`Frontend - License file ${index}:`, file);
                formData.append('driverLicenseImages', file.originFileObj);
            });

            const response = await axios.post(
                `http://localhost:8080/api/v1/customer/order/${orderId}/documents`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.data.success) {
                const { isCompleted } = response.data.documentInfo;

                if (isCompleted) {
                    message.success(response.data.message);
                    navigate('/order/my-order');
                } else {
                    message.warning(response.data.message);
                    // Optionally refresh the page or update state to show current progress
                    fetchOrderInfo();
                }
            } else {
                message.error(response.data.message || 'Tải lên thất bại');
            }
        } catch {
            message.error('Có lỗi xảy ra khi tải lên giấy tờ');
        } finally {
            setUploading(false);
        }
    };

    const uploadProps = {
        beforeUpload: () => false, // Prevent auto upload
        multiple: true,
        accept: 'image/*',
        listType: 'picture-card'
    };

    if (loading) {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <HeaderBar />
                <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Spin size="large" />
                </Content>
            </Layout>
        );
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <HeaderBar />
            <Content style={{
                padding: '40px 24px',
                background: '#f5f5f5',
                minHeight: '100vh'
            }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <Card style={{
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: 'none'
                    }}>
                        <div style={{
                            textAlign: 'center',
                            marginBottom: 32,
                            padding: '24px'
                        }}>
                            <Title level={2} style={{
                                color: '#333',
                                marginBottom: 8,
                                fontSize: '28px',
                                fontWeight: '600'
                            }}>
                                Cung cấp hình ảnh giấy tờ
                            </Title>
                            <Text style={{
                                color: '#666',
                                fontSize: '16px'
                            }}>
                                Đơn hàng: <span style={{ fontWeight: '600' }}>{orderInfo?.orderCode || orderId}</span>
                            </Text>
                        </div>

                        <Alert
                            message="Hướng dẫn tải lên giấy tờ"
                            description={`Vui lòng tải lên mặt trước hình ảnh rõ ràng của CCCD/CMND và bằng lái xe cho ${getTotalMotorbikeQuantity()} xe. Hình ảnh phải đầy đủ thông tin và dễ đọc.`}
                            type="info"
                            showIcon
                            style={{
                                marginBottom: 24,
                                borderRadius: 8
                            }}
                        />

                        {/* Show existing documents if available */}
                        {existingDocuments && (
                            <div style={{
                                background: '#f6ffed',
                                border: '1px solid #b7eb8f',
                                borderRadius: 8,
                                padding: 16,
                                marginBottom: 24
                            }}>
                                <div style={{ marginBottom: 12, fontWeight: '600', color: '#52c41a' }}>
                                    Giấy tờ đã tải lên ({existingDocuments.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'})
                                </div>
                                <div style={{ fontSize: 14, color: '#666', marginBottom: 12 }}>
                                    Tải lên lúc: {new Date(existingDocuments.uploadedAt).toLocaleString('vi-VN')}
                                </div>

                                {/* Display existing CCCD images */}
                                {existingDocuments.cccdImages && existingDocuments.cccdImages.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontWeight: '600', marginBottom: 8, color: '#333' }}>
                                            CCCD/CMND đã tải ({existingDocuments.cccdImages.length} hình ảnh):
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                            gap: 12
                                        }}>
                                            {existingDocuments.cccdImages.map((image, index) => (
                                                <div key={`existing-cccd-${index}`} style={{
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 6,
                                                    overflow: 'hidden',
                                                    background: '#fff'
                                                }}>
                                                    <img
                                                        src={`http://localhost:8080/uploads/${image}`}
                                                        alt={`CCCD ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            display: 'block',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => {
                                                            setPreviewImage(`http://localhost:8080/uploads/${image}`);
                                                            setPreviewTitle(`CCCD ${index + 1}`);
                                                            setPreviewVisible(true);
                                                        }}
                                                        onError={(e) => {
                                                            console.log('CCCD image failed to load:', `http://localhost:8080/uploads/${image}`);
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div style={{
                                                        display: 'none',
                                                        width: '100%',
                                                        height: '80px',
                                                        background: '#f5f5f5',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        color: '#999'
                                                    }}>
                                                        Lỗi tải ảnh
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 8px',
                                                        fontSize: '11px',
                                                        textAlign: 'center',
                                                        background: '#fafafa',
                                                        color: '#666'
                                                    }}>
                                                        CCCD {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Display existing Driver License images */}
                                {existingDocuments.driverLicenseImages && existingDocuments.driverLicenseImages.length > 0 && (
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontWeight: '600', marginBottom: 8, color: '#333' }}>
                                            Bằng lái xe đã tải ({existingDocuments.driverLicenseImages.length} hình ảnh):
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                            gap: 12
                                        }}>
                                            {existingDocuments.driverLicenseImages.map((image, index) => (
                                                <div key={`existing-license-${index}`} style={{
                                                    border: '1px solid #d9d9d9',
                                                    borderRadius: 6,
                                                    overflow: 'hidden',
                                                    background: '#fff'
                                                }}>
                                                    <img
                                                        src={`http://localhost:8080/uploads/${image}`}
                                                        alt={`Bằng lái ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '80px',
                                                            objectFit: 'cover',
                                                            display: 'block',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => {
                                                            setPreviewImage(`http://localhost:8080/uploads/${image}`);
                                                            setPreviewTitle(`Bằng lái ${index + 1}`);
                                                            setPreviewVisible(true);
                                                        }}
                                                        onError={(e) => {
                                                            console.log('Driver license image failed to load:', `http://localhost:8080/uploads/${image}`);
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div style={{
                                                        display: 'none',
                                                        width: '100%',
                                                        height: '80px',
                                                        background: '#f5f5f5',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        color: '#999'
                                                    }}>
                                                        Lỗi tải ảnh
                                                    </div>
                                                    <div style={{
                                                        padding: '4px 8px',
                                                        fontSize: '11px',
                                                        textAlign: 'center',
                                                        background: '#fafafa',
                                                        color: '#666'
                                                    }}>
                                                        Bằng lái {index + 1}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
                                    Bạn có thể tải lên lại để thay thế giấy tờ hiện tại.
                                </div>
                                <div style={{ marginTop: 12, textAlign: 'center' }}>
                                    <Button
                                        type="link"
                                        danger
                                        onClick={async () => {
                                            try {
                                                const token = localStorage.getItem('token');
                                                const response = await axios.delete(
                                                    `http://localhost:8080/api/v1/customer/order/${orderId}/documents`,
                                                    {
                                                        headers: { Authorization: `Bearer ${token}` }
                                                    }
                                                );
                                                if (response.data.success) {
                                                    message.success(response.data.message);
                                                    setExistingDocuments(null);
                                                    fetchOrderInfo();
                                                }
                                            } catch {
                                                message.error('Có lỗi xảy ra khi xóa giấy tờ');
                                            }
                                        }}
                                    >
                                        Xóa giấy tờ hiện tại và tải lên lại
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* CCCD/CMND Upload Areas */}
                        <div style={{ marginBottom: 32 }}>
                            <Title level={4} style={{
                                marginBottom: 16,
                                color: '#333',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                CCCD/CMND ({getTotalMotorbikeQuantity()} xe)
                            </Title>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 16
                            }}>
                                {Array.from({ length: getTotalMotorbikeQuantity() }, (_, index) => (
                                    <div key={`cccd-${index}`} style={{
                                        border: '2px dashed #d9d9d9',
                                        borderRadius: 8,
                                        padding: 16,
                                        background: '#fafafa',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#1890ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#d9d9d9';
                                        }}
                                    >
                                        <div style={{
                                            marginBottom: 8,
                                            fontWeight: '600',
                                            color: '#1890ff',
                                            fontSize: '14px'
                                        }}>
                                            Xe {index + 1}
                                        </div>
                                        <Upload
                                            {...uploadProps}
                                            fileList={cccdFiles[index] || []}
                                            onChange={(info) => handleCccdUpload(index, info)}
                                        >
                                            <div>
                                                <UploadOutlined style={{ fontSize: 20, color: '#666' }} />
                                                <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                                                    CCCD/CMND
                                                </div>
                                            </div>
                                        </Upload>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Driver License Upload Areas */}
                        <div style={{ marginBottom: 32 }}>
                            <Title level={4} style={{
                                marginBottom: 16,
                                color: '#333',
                                fontSize: '18px',
                                fontWeight: '600'
                            }}>
                                Bằng lái xe ({getTotalMotorbikeQuantity()} xe)
                            </Title>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: 16
                            }}>
                                {Array.from({ length: getTotalMotorbikeQuantity() }, (_, index) => (
                                    <div key={`license-${index}`} style={{
                                        border: '2px dashed #d9d9d9',
                                        borderRadius: 8,
                                        padding: 16,
                                        background: '#fafafa',
                                        textAlign: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#fa8c16';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#d9d9d9';
                                        }}
                                    >
                                        <div style={{
                                            marginBottom: 8,
                                            fontWeight: '600',
                                            color: '#fa8c16',
                                            fontSize: '14px'
                                        }}>
                                            Xe {index + 1}
                                        </div>
                                        <Upload
                                            {...uploadProps}
                                            fileList={licenseFiles[index] || []}
                                            onChange={(info) => handleLicenseUpload(index, info)}
                                        >
                                            <div>
                                                <UploadOutlined style={{ fontSize: 20, color: '#666' }} />
                                                <div style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
                                                    Bằng lái xe
                                                </div>
                                            </div>
                                        </Upload>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progress Summary */}
                        <div style={{
                            background: '#fafafa',
                            border: '1px solid #e8e8e8',
                            borderRadius: 8,
                            padding: 20,
                            marginBottom: 24
                        }}>
                            <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                <strong style={{ color: '#333', fontSize: 16 }}>Tóm tắt tải lên</strong>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                flexWrap: 'wrap',
                                gap: 16
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                                        {Object.values(cccdFiles).flat().length}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666' }}>CCCD/CMND đã tải</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                                        {Object.values(licenseFiles).flat().length}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666' }}>Bằng lái đã tải</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                                        {getTotalMotorbikeQuantity()}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#666' }}>Tổng số xe</div>
                                </div>
                            </div>

                            {/* Completion Status */}
                            {(() => {
                                const isComplete = Object.values(cccdFiles).flat().length === getTotalMotorbikeQuantity() &&
                                    Object.values(licenseFiles).flat().length === getTotalMotorbikeQuantity();

                                return (
                                    <div style={{
                                        padding: 16,
                                        borderRadius: 8,
                                        background: isComplete ? '#f6ffed' : '#fff7e6',
                                        border: `1px solid ${isComplete ? '#b7eb8f' : '#ffd591'}`
                                    }}>
                                        <div style={{
                                            textAlign: 'center',
                                            color: isComplete ? '#52c41a' : '#fa8c16',
                                            fontWeight: 'bold',
                                            fontSize: 14
                                        }}>
                                            {isComplete ? 'Đã đủ giấy tờ cần thiết' : 'Chưa đủ giấy tờ cần thiết'}
                                        </div>
                                        <div style={{
                                            textAlign: 'center',
                                            fontSize: 12,
                                            color: '#666',
                                            marginTop: 4
                                        }}>
                                            {isComplete
                                                ? 'Có thể hoàn tất tải lên'
                                                : `Cần thêm ${getTotalMotorbikeQuantity() - Object.values(cccdFiles).flat().length} CCCD và ${getTotalMotorbikeQuantity() - Object.values(licenseFiles).flat().length} bằng lái xe`
                                            }
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 32 }}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={handleSubmit}
                                loading={uploading}
                                style={{
                                    marginRight: 16,
                                    minWidth: 160
                                }}
                            >
                                {existingDocuments ? 'Cập nhật giấy tờ' : 'Hoàn tất tải lên'}
                            </Button>
                            <Button
                                size="large"
                                onClick={() => navigate('/order/my-order')}
                                style={{
                                    minWidth: 120
                                }}
                            >
                                Quay lại
                            </Button>
                        </div>
                    </Card>
                </div>
            </Content>

            {/* Image Preview Modal */}
            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
            >
                <img
                    alt="preview"
                    style={{ width: '100%' }}
                    src={previewImage}
                />
            </Modal>
        </Layout>
    );
};

export default DocumentUploadPage; 