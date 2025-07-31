# GPS Tracking System for Motorbike Rental

## Overview

This system provides real-time GPS tracking simulation for rented motorbikes. It automatically starts GPS simulation when a motorbike is rented and stops when the rental ends.

## Features

### 🚀 Real-time GPS Simulation
- Automatically generates realistic GPS coordinates within Ho Chi Minh City area
- Simulates realistic movement patterns with speed and heading changes
- Updates location every 5 seconds
- Real-time updates via Socket.IO

### 📍 Location Tracking
- Stores GPS coordinates, speed, heading, and timestamp
- Maintains location history for each motorbike
- Real-time location updates to connected clients

### 🎮 Manual Controls
- Start/stop GPS simulation for individual motorbikes
- Start/stop GPS simulation for all rented motorbikes
- Monitor simulation status and active simulations

## System Architecture

### Backend Components

#### 1. Location Model (`models/locationModels.js`)
```javascript
{
    motorbikeId: ObjectId,
    latitude: Number,
    longitude: Number,
    speed: Number,
    heading: Number,
    timestamp: Date,
    isActive: Boolean
}
```

#### 2. GPS Simulator Service (`utils/gpsSimulatorService.js`)
- Generates realistic GPS coordinates
- Manages active simulations
- Handles real-time updates via Socket.IO
- Provides location history and current location

#### 3. Location Controller (`controllers/employee-controller/locationCtrl.js`)
- REST API endpoints for location management
- Simulation control endpoints
- Location history retrieval

#### 4. GPS Simulation Job (`jobs/gpsSimulationJob.js`)
- Automatically starts GPS simulation for newly rented motorbikes
- Stops GPS simulation when motorbike is no longer rented
- Syncs simulations with motorbike statuses

### Frontend Components

#### Location Tracking Page (`client/src/pages/employee/location/LocationTrackingPage.jsx`)
- Real-time location monitoring interface
- Simulation control panel
- Location history display
- Socket.IO integration for live updates

## API Endpoints

### Location Management
- `GET /api/v1/employee/location/rented-motorbikes` - Get all rented motorbike locations
- `GET /api/v1/employee/location/motorbike/:motorbikeId` - Get specific motorbike location
- `GET /api/v1/employee/location/motorbike/:motorbikeId/history` - Get location history

### Simulation Controls
- `POST /api/v1/employee/location/simulation/start/:motorbikeId` - Start GPS simulation for specific motorbike
- `POST /api/v1/employee/location/simulation/stop/:motorbikeId` - Stop GPS simulation for specific motorbike
- `POST /api/v1/employee/location/simulation/start-all` - Start GPS simulation for all rented motorbikes
- `POST /api/v1/employee/location/simulation/stop-all` - Stop all GPS simulations
- `GET /api/v1/employee/location/simulation/status` - Get simulation status

## Socket.IO Events

### Client to Server
- `join-location-room` - Join room for specific motorbike location updates
- `leave-location-room` - Leave room for specific motorbike

### Server to Client
- `location-update` - Real-time location update for a motorbike

## GPS Simulation Details

### Coordinate Generation
- Bounds: Ho Chi Minh City area (10.4°N - 11.0°N, 106.4°E - 107.0°E)
- Realistic movement patterns with speed changes (0-60 km/h)
- Heading changes with slight turns (±15 degrees)

### Update Frequency
- Location updates every 5 seconds
- Real-time Socket.IO emissions
- Database storage for location history

## Installation & Setup

### 1. Install Dependencies
```bash
# Server dependencies
npm install socket.io

# Client dependencies
cd client
npm install socket.io-client react-toastify
```

### 2. Database Setup
The location model will be automatically created when the application starts.

### 3. Start the Application
```bash
# Development
npm run dev

# Production
npm start
```

## Usage

### For Employees

1. **Access Location Tracking**
   - Navigate to the employee dashboard
   - Click on "Location Tracking" in the sidebar

2. **Monitor Rented Motorbikes**
   - View all rented motorbikes with their current locations
   - See simulation status (Active/Inactive)

3. **Control Simulations**
   - Use "Start All Simulations" to begin GPS tracking for all rented motorbikes
   - Use "Stop All Simulations" to stop all GPS tracking
   - Individual motorbike controls available for each motorbike

4. **View Location Details**
   - Select a motorbike to view detailed location information
   - See current location with coordinates, speed, and heading
   - View location history with timestamps

### Automatic Behavior

- **When a motorbike is rented**: GPS simulation automatically starts
- **When a motorbike is returned**: GPS simulation automatically stops
- **Server restart**: All GPS simulations are synced with current motorbike statuses

## Configuration

### GPS Simulation Settings
Location: `utils/gpsSimulatorService.js`

```javascript
// Update frequency (milliseconds)
setInterval(async () => {
    await this.updateLocation(motorbikeId);
}, 5000); // 5 seconds

// Speed range (km/h)
const speed = Math.random() * 60; // 0-60 km/h

// Heading change range (degrees)
const headingChange = (Math.random() - 0.5) * 30; // ±15 degrees
```

### Geographic Bounds
```javascript
// Ho Chi Minh City bounding box
const minLat = 10.4;
const maxLat = 11.0;
const minLng = 106.4;
const maxLng = 107.0;
```

## Security Considerations

- All location endpoints require employee authentication
- Socket.IO connections are validated
- Location data is stored securely in MongoDB
- Real-time updates are scoped to specific motorbike rooms

## Performance Considerations

- Location updates are throttled to 5-second intervals
- Database indexes optimize location queries
- Socket.IO rooms limit unnecessary broadcasts
- Location history is limited to prevent memory issues

## Troubleshooting

### Common Issues

1. **GPS simulation not starting**
   - Check if motorbike status is 'rented'
   - Verify database connection
   - Check server logs for errors

2. **Real-time updates not working**
   - Verify Socket.IO connection
   - Check if client is in correct room
   - Ensure server is running on correct port

3. **Location history not loading**
   - Check database connection
   - Verify motorbike ID is correct
   - Check for location data in database

### Debug Commands

```javascript
// Check active simulations
console.log(gpsSimulator.activeSimulations);

// Check simulation status
console.log(simulationStatus);

// Check location data
const locations = await LocationModel.find({ motorbikeId });
console.log(locations);
```

## Future Enhancements

- [ ] Integration with real GPS devices
- [ ] Route optimization and traffic simulation
- [ ] Geofencing capabilities
- [ ] Location analytics and reporting
- [ ] Mobile app integration
- [ ] Emergency location alerts 