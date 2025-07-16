import React, { useState } from 'react'
import './PolicyAgreement.css'

const PolicyAgreement = ({ onPolicyChange }) => {
    const [policies, setPolicies] = useState({
        rentalPolicy: false,
        safetyPolicy: false
    })

    const handlePolicyChange = (policyName) => {
        const newPolicies = {
            ...policies,
            [policyName]: !policies[policyName]
        }
        setPolicies(newPolicies)

        if (onPolicyChange) {
            onPolicyChange(newPolicies)
        }
    }

    const allPoliciesAccepted = policies.rentalPolicy && policies.safetyPolicy

    return (
        <div className="policy-agreement-container">
            <h3 className="policy-title">Chấp thuận chính sách</h3>
            <p className="policy-description">
                Vui lòng đọc và đồng ý với các chính sách sau trước khi tiếp tục đặt xe:
            </p>

            <div className="policy-checkboxes">
                {/* Rental Policy */}
                <div className="policy-item">
                    <div className="policy-header">
                        <input
                            type="checkbox"
                            id="rentalPolicy"
                            checked={policies.rentalPolicy}
                            onChange={() => handlePolicyChange('rentalPolicy')}
                            className="policy-checkbox"
                        />
                        <label htmlFor="rentalPolicy" className="policy-label">
                            Tôi đã đọc và đồng ý với <strong>Chính sách cho thuê</strong>
                        </label>
                    </div>
                    <div className="policy-content">
                        <h4>Chính sách cho thuê:</h4>
                        <ul>
                            <li>Yêu cầu giấy tờ tùy thân và bằng lái xe hợp lệ</li>
                            <li>Khách hàng phải từ 18 tuổi trở lên</li>
                            <li>Yêu cầu đặt cọc khi nhận xe</li>
                            <li>Xe phải được trả trong tình trạng như khi nhận</li>
                            <li>Trả xe trễ sẽ bị mất cọc</li>
                        </ul>
                    </div>
                </div>

                {/* Safety Policy */}
                <div className="policy-item">
                    <div className="policy-header">
                        <input
                            type="checkbox"
                            id="safetyPolicy"
                            checked={policies.safetyPolicy}
                            onChange={() => handlePolicyChange('safetyPolicy')}
                            className="policy-checkbox"
                        />
                        <label htmlFor="safetyPolicy" className="policy-label">
                            Tôi đã đọc và đồng ý với <strong>Chính sách an toàn</strong>
                        </label>
                    </div>
                    <div className="policy-content">
                        <h4>Chính sách an toàn:</h4>
                        <ul>
                            <li>Bắt buộc đội mũ bảo hiểm khi điều khiển xe</li>
                            <li>Tuân thủ luật giao thông và biển báo</li>
                            <li>Không lái xe khi đã uống rượu bia hoặc dùng chất kích thích</li>
                            <li>Tối đa 2 người/xe máy</li>
                            <li>Phải báo ngay khi có tai nạn hoặc hư hỏng</li>
                            <li>Đậu xe đúng nơi quy định</li>
                            <li>Thông tin liên hệ khẩn cấp có trong hồ sơ thuê xe</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="policy-status">
                {allPoliciesAccepted ? (
                    <div className="policy-accepted">
                        ✅ Bạn đã đồng ý với tất cả chính sách. Có thể tiếp tục đặt xe.
                    </div>
                ) : (
                    <div className="policy-pending">
                        ⚠️ Vui lòng đọc và đồng ý với cả hai chính sách để tiếp tục.
                    </div>
                )}
            </div>
        </div>
    )
}

export default PolicyAgreement
