# GPS Tracking System for Motorbike Rental

## Overview

This system provides real-time GPS tracking simulation for rented motorbikes. It automatically starts GPS simulation when a motorbike is rented and stops when the rental ends. **The system only saves location data to the database when there are rented motorbikes.**

## Features

### 🚀 Real-time GPS Simulation
- Automatically generates realistic GPS coordinates within Ho Chi Minh City area
- Simulates realistic movement patterns with speed and heading changes
- Updates location every 5 seconds
- Real-time updates via Socket.IO
- **Only works with rented motorbikes**

### 📍 Location Tracking
- Stores GPS coordinates, speed, heading, and timestamp
- Maintains location history for each motorbike
- Real-time location updates to connected clients
- **Only saves location data for rented motorbikes**

### 🎮 Manual Controls
- Start/stop GPS simulation for individual motorbikes
- Start/stop GPS simulation for all rented motorbikes
- Monitor simulation status and active simulations
- **Get and save location data only from rented motorbikes**

### 🔒 Security & Efficiency
- **No location data is saved when there are no rented motorbikes**
- **Only rented motorbikes can have their location tracked**
- Automatic cleanup when motorbikes are no longer rented
- Efficient resource usage by only tracking active rentals

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
- **Checks if motorbike is rented before saving location data**
- **Stops simulations when motorbikes are no longer rented**

#### 3. Location Controller (`controllers/employee-controller/locationCtrl.js`)
- REST API endpoints for location management
- Simulation control endpoints
- Location history retrieval
- **New endpoint: Get and save location data only from rented motorbikes**
- **All endpoints now validate that motorbikes are rented before processing**

#### 4. GPS Simulation Job (`jobs/gpsSimulationJob.js`)
- Automatically starts GPS simulation for newly rented motorbikes
- Stops GPS simulation when motorbike is no longer rented
- Syncs simulations with motorbike statuses
- **Checks if there are any rented motorbikes before starting simulations**

### Frontend Components

#### Location Tracking Page (`client/src/pages/employee/location/LocationTrackingPage.jsx`)
- Real-time location monitoring interface
- Simulation control panel
- **New button: "Get & Save Rented Locations"**
- **Only displays and tracks rented motorbikes**

## API Endpoints

### Location Management
- `GET /api/v1/employee/location/rented-motorbikes` - Get all rented motorbike locations
- `GET /api/v1/employee/location/rented-motorbikes/save` - **NEW: Get and save location data only from rented motorbikes**
- `GET /api/v1/employee/location/motorbike/:motorbikeId` - Get specific motorbike location (rented only)
- `GET /api/v1/employee/location/motorbike/:motorbikeId/history` - Get motorbike location history (rented only)

### Simulation Control
- `POST /api/v1/employee/location/simulation/start/:motorbikeId` - Start GPS simulation for specific motorbike
- `POST /api/v1/employee/location/simulation/stop/:motorbikeId` - Stop GPS simulation for specific motorbike
- `POST /api/v1/employee/location/simulation/start-all` - Start GPS simulation for all rented motorbikes
- `POST /api/v1/employee/location/simulation/stop-all` - Stop all GPS simulations
- `GET /api/v1/employee/location/simulation/status` - Get simulation status
- `POST /api/v1/employee/location/simulation/manual` - Manual location update (rented motorbikes only)

## Key Changes

### 1. Rented Motorbike Validation
- All location endpoints now validate that motorbikes are rented
- Returns 403 error if trying to access location data for non-rented motorbikes
- Automatic cleanup when motorbikes are no longer rented

### 2. Database Efficiency
- No location data is saved when there are no rented motorbikes
- Automatic stopping of simulations when motorbikes are returned
- Efficient resource usage by only tracking active rentals

### 3. New Frontend Feature
- Added "Get & Save Rented Locations" button
- Shows status of whether there are rented motorbikes
- Only displays rented motorbikes in the interface

### 4. Enhanced Security
- Location data is only accessible for rented motorbikes
- Prevents unauthorized access to location data
- Automatic cleanup of location data when rentals end

## Usage

### For Employees
1. Navigate to the Location Tracking page
2. Use "Get & Save Rented Locations" to fetch and save location data only from rented motorbikes
3. Start/stop GPS simulations as needed
4. Monitor real-time location updates

### For System Administrators
1. The system automatically manages GPS simulations based on motorbike rental status
2. No manual intervention needed for basic functionality
3. Monitor system logs for simulation status and errors

## Benefits

1. **Resource Efficiency**: Only tracks and saves location data for active rentals
2. **Security**: Location data is only accessible for rented motorbikes
3. **Performance**: Reduced database load when no motorbikes are rented
4. **Compliance**: Automatic cleanup ensures no location data persists after rentals end
5. **User Experience**: Clear indication of rented motorbike status and location availability 