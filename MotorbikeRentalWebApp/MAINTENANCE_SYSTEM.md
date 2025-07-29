# Maintenance System

## Overview
This document explains the maintenance system implemented for the motorbike rental application. After checkout, staff can select maintenance levels for vehicles, with fees calculated as a percentage of the vehicle's value.

## Maintenance Levels

### 1. Normal Maintenance (Bảo dưỡng thường)
- **Duration**: 1 day
- **Fee**: 0% of vehicle value (FREE)
- **Description**: Regular maintenance, oil change, general inspection
- **Color**: Green

### 2. Light Maintenance (Bảo dưỡng nhẹ)
- **Duration**: 2 days
- **Fee**: 5% of vehicle value
- **Description**: Small parts replacement, system adjustment
- **Color**: Blue

### 3. Medium Maintenance (Bảo dưỡng trung bình)
- **Duration**: 5 days
- **Fee**: 15% of vehicle value
- **Description**: Major parts replacement, system repair
- **Color**: Orange

### 4. Heavy Maintenance (Bảo dưỡng nặng)
- **Duration**: 10 days
- **Fee**: 30% of vehicle value
- **Description**: Major overhaul, engine or large parts replacement
- **Color**: Red

## System Flow

### 1. After Checkout
- When an order is completed (checkout), staff can access maintenance selection
- A "Bảo dưỡng xe" (Maintenance) button appears for completed orders
- Clicking the button navigates to the maintenance selection page

### 2. Maintenance Selection Page
- Displays all motorbikes from the completed order
- Shows vehicle information (code, type, value)
- Allows selection of maintenance level for each vehicle
- Calculates fees in real-time based on vehicle value
- Shows estimated completion time
- Allows custom descriptions for each maintenance

### 3. Maintenance Creation
- Creates maintenance records in the database
- Updates motorbike status to 'maintenance'
- Adds maintenance fees to the rental order's additionalFee
- Sets estimated completion date based on maintenance level

### 4. Maintenance Management
- Separate page to view all maintenance records
- Shows maintenance status (in_progress/completed)
- Allows staff to mark maintenance as completed
- Updates motorbike status back to 'available' when completed

## Database Schema

### Maintenance Model
```javascript
{
    motorbikeId: ObjectId,        // Reference to motorbike
    rentalOrderId: ObjectId,      // Reference to rental order
    level: String,                // 'normal', 'light', 'medium', 'heavy'
    description: String,          // Custom description
    startDate: Date,              // Maintenance start date
    estimatedEndDate: Date,       // Estimated completion date
    actualEndDate: Date,          // Actual completion date
    feeIfNoInsurance: Number,     // Maintenance fee
    status: String                // 'in_progress', 'completed'
}
```

### Updated Rental Order Model
- Added `additionalFee` field to track maintenance costs
- Maintenance fees are added to this field

## API Endpoints

### Maintenance Levels
- `GET /api/v1/employee/maintenance/levels` - Get maintenance level configurations

### Order Maintenance
- `GET /api/v1/employee/maintenance/order/:orderId/motorbikes` - Get motorbikes for maintenance selection
- `POST /api/v1/employee/maintenance/order/:orderId/create` - Create maintenance records

### Maintenance Management
- `GET /api/v1/employee/maintenance/all` - Get all maintenance records
- `PUT /api/v1/employee/maintenance/:maintenanceId/complete` - Complete maintenance

## Frontend Pages

### 1. Maintenance Selection Page
- **Route**: `/employee/maintenance/selection/:orderId`
- **Features**:
  - Display order information
  - List all motorbikes from the order
  - Maintenance level selection with real-time fee calculation
  - Custom description input
  - Total fee calculation
  - Confirmation and cancellation options

### 2. Maintenance Management Page
- **Route**: `/employee/maintenance`
- **Features**:
  - Table view of all maintenance records
  - Status tracking (in_progress/completed)
  - Complete maintenance functionality
  - Filtering and pagination
  - Navigation back to order management

## Fee Calculation

### Formula
```
Maintenance Fee = Vehicle Value × Fee Percentage
```

### Examples
- **Vehicle Value**: 50,000,000 VND
- **Normal Maintenance**: 50,000,000 × 0% = 0 VND
- **Light Maintenance**: 50,000,000 × 5% = 2,500,000 VND
- **Medium Maintenance**: 50,000,000 × 15% = 7,500,000 VND
- **Heavy Maintenance**: 50,000,000 × 30% = 15,000,000 VND

## User Interface Features

### 1. Visual Indicators
- Color-coded maintenance levels
- Status badges for maintenance progress
- Real-time fee calculations
- Progress indicators

### 2. User Experience
- Intuitive selection interface
- Clear fee breakdown
- Confirmation modals
- Success/error messages
- Navigation between pages

### 3. Data Validation
- Ensures at least one vehicle is selected
- Validates maintenance level selection
- Prevents duplicate maintenance records
- Validates order status (must be completed)

## Business Logic

### 1. Vehicle Status Management
- **Available** → **Maintenance** (when maintenance starts)
- **Maintenance** → **Available** (when maintenance completes)

### 2. Fee Tracking
- Maintenance fees are added to rental order's additionalFee
- Fees are calculated based on vehicle value at time of maintenance
- No insurance considerations in current implementation

### 3. Time Management
- Estimated completion dates are calculated automatically
- Based on maintenance level duration
- Actual completion dates are recorded when maintenance is completed

## Benefits

1. **Automated Fee Calculation**: Eliminates manual calculation errors
2. **Standardized Process**: Consistent maintenance levels and fees
3. **Transparency**: Clear fee breakdown for customers
4. **Efficiency**: Streamlined maintenance workflow
5. **Tracking**: Complete maintenance history and status tracking
6. **Flexibility**: Custom descriptions for specific maintenance needs

## Future Enhancements

1. **Insurance Integration**: Consider insurance coverage for maintenance costs
2. **Parts Inventory**: Track parts used in maintenance
3. **Technician Assignment**: Assign specific technicians to maintenance tasks
4. **Maintenance History**: Detailed maintenance history for each vehicle
5. **Scheduled Maintenance**: Automatic maintenance scheduling based on usage
6. **Photo Documentation**: Upload photos of maintenance work
7. **Customer Notifications**: Notify customers of maintenance status 