import React from "react";
import { useBooking } from "../../../../../context/BookingContext";
import dayjs from "dayjs";

const tableContainerStyle = {
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(24,144,255,0.07)',
    padding: 24,
    marginBottom: 32,
    marginTop: 24,
    overflowX: 'auto',
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    fontSize: 16,
};

const thStyle = {
    background: '#f5f7fa',
    textAlign: 'left',
    padding: '12px 10px',
    borderBottom: '2px solid #e6e6e6',
    fontWeight: 700,
    fontSize: 17,
};

const tdStyle = {
    padding: '12px 10px',
    borderBottom: '1px solid #f0f0f0',
    verticalAlign: 'top',
    background: '#fff',
};

const totalRowStyle = {
    fontWeight: 700,
    background: '#f8fafc',
    fontSize: 17,
};

const depositTitleStyle = {
    margin: '32px 0 12px 0',
    fontWeight: 700,
    fontSize: 18,
    color: '#3b5998',
};

const OrderDetail = () => {
    const { bookingData } = useBooking();
    const motorbikes = bookingData?.motorbikes || [];
    const accessories = bookingData?.accessories || [];

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

    const start = dayjs(`${bookingData.startDate}T${bookingData.startTime}`);
    const end = dayjs(`${bookingData.endDate}T${bookingData.endTime}`);
    const rentalDays = Math.max(1, Math.ceil(end.diff(start, "day", true)));

    const isSameBranch = bookingData.startBranch === bookingData.endBranch;

    const productRows = [];
    let totalRental = 0, totalAccessory = 0, totalDeposit = 0, totalPreDeposit = 0, totalWaiver = 0;

    // Motorbikes
    motorbikes.forEach(({ motorbikeType, quantity, hasDamageWaiver }) => {
        const pricing = motorbikeType.pricingRule || {};
        const basePrice = isSameBranch ? pricing.sameBranchPrice || motorbikeType.price : pricing.differentBranchPrice || motorbikeType.price;
        const discountDay = pricing.discountDay || 0;
        const discountPercent = pricing.discountPercent || 0;
        const discountPrice = basePrice - (basePrice * discountPercent) / 100;

        const fullDays = Math.min(rentalDays, discountDay);
        const discountDays = Math.max(0, rentalDays - discountDay);
        const rentalFee = (fullDays * basePrice + discountDays * discountPrice) * quantity;

        const deposit = (motorbikeType.deposit || 0) * quantity;
        const preDeposit = (motorbikeType.preDeposit || 0) * quantity;
        const waiver = hasDamageWaiver ? (motorbikeType.dailyDamageWaiver || 0) * rentalDays * quantity : 0;

        totalRental += rentalFee;
        totalDeposit += deposit;
        totalPreDeposit += preDeposit;
        totalWaiver += waiver;

        const detailLines = [
            `- Đặt cọc: ${formatPrice(deposit)}`,
            `- Thuê xe: ${formatPrice(rentalFee)}`,
            hasDamageWaiver && waiver > 0 ? `- Miễn trừ thiệt hại: ${formatPrice(waiver)}` : null
        ].filter(Boolean).join('\n');

        productRows.push({
            label: `${motorbikeType.name} × ${quantity}`,
            value: detailLines
        });
    });

    // Accessories
    accessories.forEach(({ accessory, quantity }) => {
        const total = (accessory.price || 0) * quantity;
        totalAccessory += total;
        productRows.push({ label: `${accessory.name} × ${quantity}`, value: formatPrice(total) });
    });

    const grandTotal = totalRental + totalAccessory + totalWaiver;

    const depositRows = [
        { label: "Tổng tiền đặt cọc", value: formatPrice(totalDeposit + totalPreDeposit) },
        { label: "Số tiền này chỉ là đặt cọc và sẽ được hoàn trả", value: "" },
        { label: "- Đặt cọc khi đặt trước", value: formatPrice(totalPreDeposit) },
        { label: "- Đặt cọc khi nhận xe", value: formatPrice(totalDeposit) }
    ];

    return (
        <div style={tableContainerStyle}>
            <h3 style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, color: '#2d3a4b' }}>Chi tiết đơn hàng</h3>
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>Sản phẩm</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Tạm tính</th>
                    </tr>
                </thead>
                <tbody>
                    {productRows.map((row, idx) => (
                        <tr key={idx} style={{ transition: 'background 0.2s' }}>
                            <td style={tdStyle}>{row.label}</td>
                            <td style={{ ...tdStyle, textAlign: 'right', whiteSpace: 'pre-line' }}>{row.value}</td>
                        </tr>
                    ))}
                    <tr style={totalRowStyle}>
                        <td style={tdStyle}>Tổng cộng</td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{formatPrice(grandTotal)}</td>
                    </tr>
                </tbody>
            </table>

            <div style={depositTitleStyle}>Chi tiết đặt cọc</div>
            <table style={tableStyle}>
                <tbody>
                    {depositRows.map((row, idx) => (
                        <tr key={idx}>
                            <td style={tdStyle}>{row.label}</td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>{row.value}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderDetail;
