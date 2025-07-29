# Checkout and Refund Logic

## Overview
This document explains the enhanced checkout and refund logic implemented in the motorbike rental system.

## Checkout Time Calculation

### Key Features
1. **Precise Time Tracking**: Checkout time is recorded to the exact second when the checkout button is pressed
2. **Full Day Requirement**: Refunds are only given for complete full days (24 hours), not partial days
3. **Detailed Time Display**: The system shows remaining time in days, hours, minutes, and seconds

### Time Calculation Logic

```javascript
// Calculate remaining time in hours
const remainingHours = plannedReturn.diff(actualCheckout, 'hour', true);
const remainingDays = Math.floor(remainingHours / 24);
const remainingHoursInDay = remainingHours % 24;
```

### Refund Rules

1. **Minimum Requirement**: At least 1 full day (24 hours) must remain for any refund
2. **Full Days Only**: Only complete days are refunded, partial days are not
3. **No Refund Scenarios**:
   - Less than 24 hours remaining
   - No early checkout (checkout at or after planned return time)
   - No payment found for the order

### Example Scenarios

#### Scenario 1: Early Checkout with 2.5 Days Remaining
- **Remaining Time**: 60 hours (2.5 days)
- **Full Days**: 2 days
- **Partial Day**: 12 hours
- **Refund**: 2 full days only
- **Result**: ✅ Refund given for 2 days

#### Scenario 2: Early Checkout with 18 Hours Remaining
- **Remaining Time**: 18 hours (0.75 days)
- **Full Days**: 0 days
- **Partial Day**: 18 hours
- **Refund**: None
- **Result**: ❌ No refund (less than 1 full day)

#### Scenario 3: Checkout at Planned Time
- **Remaining Time**: 0 hours
- **Full Days**: 0 days
- **Refund**: None
- **Result**: ❌ No refund (no early checkout)

## Frontend Updates

### Enhanced Countdown Display
- Shows remaining time in format: `Xd Yh Zm Ws`
- Real-time updates every second
- Color-coded (blue for active, red for expired)

### Refund Information Display
- Shows refund eligibility before checkout
- Displays detailed refund information after checkout
- Includes remaining days and hours in refund modal

### Checkout Button Logic
- Updated to handle new response format
- Shows refund information immediately after checkout
- Displays appropriate messages based on refund status

## Backend Updates

### Enhanced Logging
- Detailed console logs for debugging
- Tracks refund calculation steps
- Records refund creation with full details

### Improved Error Handling
- Better error messages for different scenarios
- Validation of refund requirements
- Proper handling of edge cases

### Response Format
```javascript
{
  success: true,
  message: "Detailed success message",
  refund: {
    amount: 500000,
    remainingDays: 2,
    remainingHours: 6
  }
}
```

## API Endpoints

### Checkout Order
- **Endpoint**: `PUT /api/v1/employee/order/:orderId/checkout`
- **Response**: Includes refund information if applicable

### Create Refund
- **Endpoint**: `POST /api/v1/employee/refund/create/:orderId`
- **Validation**: Ensures minimum 1 full day remaining

## Benefits

1. **Fair Pricing**: Customers only pay for what they actually use
2. **Clear Communication**: Detailed information about refund eligibility
3. **Precise Calculation**: Accurate time tracking prevents disputes
4. **Business Protection**: Minimum requirements prevent abuse
5. **User Experience**: Real-time countdown and clear feedback

## Testing

To test the functionality:

1. Create an order with a future return date
2. Check in the order (status: active)
3. Wait some time or modify the return date
4. Click checkout and verify refund calculation
5. Check console logs for detailed calculation steps 