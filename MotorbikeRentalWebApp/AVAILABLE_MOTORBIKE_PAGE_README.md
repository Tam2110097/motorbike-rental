# Available Motorbike Page - Documentation

## Overview
This document describes the enhanced Available Motorbike Page that displays all available motorbike types with a modern, responsive UI.

## Backend Changes

### New API Endpoints

#### 1. Get All Available Motorbike Types
- **URL**: `GET /api/v1/customer/motorbike-type/available`
- **Description**: Returns all available motorbike types across all branches
- **Response**:
```json
{
  "success": true,
  "message": "Lấy danh sách tất cả loại xe khả dụng thành công",
  "motorbikeTypes": [
    {
      "_id": "motorbikeTypeId",
      "name": "Honda Blade 110cc",
      "price": 150000,
      "description": "Xe máy tiết kiệm nhiên liệu",
      "deposit": 2000000,
      "dailyDamageWaiver": 50000,
      "image": "image_url",
      "availableCount": 5,
      "isActive": true
    }
  ]
}
```

#### 2. Get Available Motorbike Types at Specific Branch
- **URL**: `GET /api/v1/customer/motorbike-type/available-at-branch/:branchId`
- **Description**: Returns available motorbike types at a specific branch
- **Parameters**: `branchId` (string/ObjectId)
- **Response**: Same structure as above

### Controller Improvements

#### Fixed Issues:
1. **ObjectId Conversion**: Added proper ObjectId conversion for branchId parameter
2. **Error Handling**: Enhanced error logging and response messages
3. **Data Filtering**: Added `isActive` filter to only show active motorbike types
4. **Sorting**: Added alphabetical sorting by name for better UX

#### New Function: `getAllAvailableMotorbikeTypes`
- Aggregates motorbike data to count available vehicles per type
- Filters by `status: 'available'` and `isActive: true`
- Returns motorbike types with `availableCount` field

## Frontend Changes

### Enhanced AvailableMotorbikePage Component

#### Key Features:
1. **Responsive Design**: Uses Ant Design Grid system for mobile-friendly layout
2. **Loading States**: Shows spinner during data fetching
3. **Error Handling**: Displays user-friendly error messages with retry option
4. **Modern UI**: Card-based layout with hover effects and icons
5. **Status Indicators**: Color-coded tags showing availability status
6. **Price Formatting**: Vietnamese currency formatting
7. **Image Fallbacks**: Handles missing images gracefully

#### Component Props:
- Accepts `branchId` and `startCity` from navigation state
- Automatically determines API endpoint based on props
- Handles both branch-specific and all-branches views

#### UI Elements:
- **Header**: Shows title and location information
- **Cards**: Each motorbike type displayed in a card with:
  - Image with availability status tag
  - Name and available count
  - Description (truncated if too long)
  - Pricing information (rental price, deposit, insurance)
  - Action button (disabled if no vehicles available)

#### Status Colors:
- **Green**: Plenty of vehicles available (>2)
- **Orange**: Limited availability (1-2 vehicles)
- **Red**: No vehicles available

### Test Page
Created `TestAvailableMotorbikePage.jsx` for testing different scenarios:
1. View all available motorbikes
2. View motorbikes at specific branch
3. View motorbikes at different city

## Usage Examples

### 1. Navigate to All Available Motorbikes
```javascript
navigate('/available-motorbikes', { 
  state: {} 
})
```

### 2. Navigate to Branch-Specific Motorbikes
```javascript
navigate('/available-motorbikes', { 
  state: { 
    branchId: '507f1f77bcf86cd799439011',
    startCity: 'Hà Nội'
  } 
})
```

### 3. Select a Motorbike Type
When user clicks "Chọn xe", it navigates to booking page:
```javascript
navigate('/booking/select-motorbike', {
  state: {
    motorbikeType: selectedMotorbikeType,
    branchId,
    startCity
  }
})
```

## Data Structure

### Motorbike Type Model
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  description: String,
  deposit: Number,
  dailyDamageWaiver: Number,
  image: String,
  isActive: Boolean,
  availableCount: Number // Added by aggregation
}
```

### Motorbike Model
```javascript
{
  _id: ObjectId,
  motorbikeType: ObjectId,
  branchId: ObjectId,
  status: String, // 'available', 'rented', 'maintenance', etc.
  licensePlateImage: String,
  code: String
}
```

## API Routes

### Customer Routes (`routes/customerRoutes.js`)
```javascript
// Get all available motorbike types
router.get('/motorbike-type/available', getAllAvailableMotorbikeTypes);

// Get available motorbike types at branch
router.get('/motorbike-type/available-at-branch/:branchId', getAvailableMotorbikeTypesAtBranch);
```

## Error Handling

### Backend Errors
- **400**: Invalid branchId or missing parameters
- **404**: Branch not found
- **500**: Server errors with detailed logging

### Frontend Errors
- **Network Errors**: Shows retry button
- **API Errors**: Displays error message from server
- **Empty Data**: Shows empty state with appropriate message

## Styling

### Color Scheme
- **Primary**: #1890ff (Blue)
- **Success**: #52c41a (Green)
- **Warning**: #faad14 (Orange)
- **Error**: #ff4d4f (Red)
- **Purple**: #722ed1 (Insurance)

### Responsive Breakpoints
- **xs**: < 576px (1 column)
- **sm**: ≥ 576px (2 columns)
- **lg**: ≥ 992px (3 columns)
- **xl**: ≥ 1200px (4 columns)

## Testing

### Manual Testing
1. Start backend server
2. Navigate to test page: `/test-available-motorbikes`
3. Try different scenarios
4. Verify responsive design on different screen sizes

### Data Requirements
- At least one active motorbike type
- At least one motorbike with status 'available'
- Valid branch data (for branch-specific views)

## Future Enhancements

### Potential Improvements:
1. **Search/Filter**: Add search by name or filter by price range
2. **Sorting**: Allow sorting by price, availability, etc.
3. **Pagination**: Handle large datasets
4. **Favorites**: Allow users to save favorite motorbike types
5. **Reviews**: Display user reviews and ratings
6. **Real-time Updates**: WebSocket integration for live availability

### Performance Optimizations:
1. **Image Optimization**: Lazy loading and compression
2. **Caching**: Implement Redis caching for frequently accessed data
3. **CDN**: Use CDN for static assets
4. **Database Indexing**: Optimize MongoDB queries

## Troubleshooting

### Common Issues:
1. **No data displayed**: Check if motorbikes exist with 'available' status
2. **Images not loading**: Verify image URLs in database
3. **API errors**: Check server logs and database connection
4. **Responsive issues**: Test on different devices and browsers

### Debug Steps:
1. Check browser console for errors
2. Verify API responses using browser dev tools
3. Check server logs for backend errors
4. Validate database data structure 