const LocationModel = require('../../models/locationModels');
const MotorbikeModel = require('../../models/motorbikeModels');
const gpsSimulator = require('../../utils/gpsSimulatorService');

// Get current location of all rented motorbikes
const getAllRentedMotorbikeLocations = async (req, res) => {
    try {
        // Get all rented motorbikes with their latest location
        const rentedMotorbikes = await MotorbikeModel.find({ status: 'rented' })
            .populate('motorbikeType')
            .populate('branchId');

        const locationsWithMotorbikes = [];

        for (const motorbike of rentedMotorbikes) {
            const currentLocation = await LocationModel.findOne({
                motorbikeId: motorbike._id,
                isActive: true
            }).sort({ timestamp: -1 });

            locationsWithMotorbikes.push({
                motorbike: {
                    _id: motorbike._id,
                    code: motorbike.code,
                    motorbikeType: motorbike.motorbikeType,
                    branchId: motorbike.branchId,
                    status: motorbike.status
                },
                location: currentLocation || null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Retrieved all rented motorbike locations',
            data: locationsWithMotorbikes
        });
    } catch (error) {
        console.error('Error getting rented motorbike locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving motorbike locations',
            error: error.message
        });
    }
};

// Get current location of a specific motorbike (only if rented)
const getMotorbikeLocation = async (req, res) => {
    try {
        const { motorbikeId } = req.params;

        const motorbike = await MotorbikeModel.findById(motorbikeId)
            .populate('motorbikeType')
            .populate('branchId');

        if (!motorbike) {
            return res.status(404).json({
                success: false,
                message: 'Motorbike not found'
            });
        }

        // Only allow access to location data for rented motorbikes
        if (motorbike.status !== 'rented') {
            return res.status(403).json({
                success: false,
                message: 'Location data is only available for rented motorbikes'
            });
        }

        const currentLocation = await LocationModel.findOne({
            motorbikeId,
            isActive: true
        }).sort({ timestamp: -1 });

        res.status(200).json({
            success: true,
            message: 'Retrieved motorbike location',
            data: {
                motorbike,
                location: currentLocation
            }
        });
    } catch (error) {
        console.error('Error getting motorbike location:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving motorbike location',
            error: error.message
        });
    }
};

// Get location history for a specific motorbike (only if rented)
const getMotorbikeLocationHistory = async (req, res) => {
    try {
        const { motorbikeId } = req.params;
        const { limit = 100 } = req.query;

        const motorbike = await MotorbikeModel.findById(motorbikeId);
        if (!motorbike) {
            return res.status(404).json({
                success: false,
                message: 'Motorbike not found'
            });
        }

        // Only allow access to location history for rented motorbikes
        if (motorbike.status !== 'rented') {
            return res.status(403).json({
                success: false,
                message: 'Location history is only available for rented motorbikes'
            });
        }

        const locationHistory = await LocationModel.find({
            motorbikeId
        }).sort({ timestamp: -1 }).limit(parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Retrieved motorbike location history',
            data: {
                motorbike: {
                    _id: motorbike._id,
                    code: motorbike.code,
                    status: motorbike.status
                },
                locationHistory
            }
        });
    } catch (error) {
        console.error('Error getting motorbike location history:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving motorbike location history',
            error: error.message
        });
    }
};

// Start GPS simulation for a specific motorbike
const startMotorbikeSimulation = async (req, res) => {
    try {
        const { motorbikeId } = req.params;

        const motorbike = await MotorbikeModel.findById(motorbikeId);
        if (!motorbike) {
            return res.status(404).json({
                success: false,
                message: 'Motorbike not found'
            });
        }

        if (motorbike.status !== 'rented') {
            return res.status(400).json({
                success: false,
                message: 'GPS simulation can only be started for rented motorbikes'
            });
        }

        await gpsSimulator.startSimulation(motorbikeId);

        res.status(200).json({
            success: true,
            message: `GPS simulation started for motorbike ${motorbike.code}`
        });
    } catch (error) {
        console.error('Error starting motorbike simulation:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting GPS simulation',
            error: error.message
        });
    }
};

// Stop GPS simulation for a specific motorbike
const stopMotorbikeSimulation = async (req, res) => {
    try {
        const { motorbikeId } = req.params;

        const motorbike = await MotorbikeModel.findById(motorbikeId);
        if (!motorbike) {
            return res.status(404).json({
                success: false,
                message: 'Motorbike not found'
            });
        }

        await gpsSimulator.stopSimulation(motorbikeId);

        res.status(200).json({
            success: true,
            message: `GPS simulation stopped for motorbike ${motorbike.code}`
        });
    } catch (error) {
        console.error('Error stopping motorbike simulation:', error);
        res.status(500).json({
            success: false,
            message: 'Error stopping GPS simulation',
            error: error.message
        });
    }
};

// Start GPS simulation for all rented motorbikes
const startAllRentedSimulations = async (req, res) => {
    try {
        // Check if there are any rented motorbikes
        const hasRentedMotorbikes = await gpsSimulator.hasRentedMotorbikes();

        if (!hasRentedMotorbikes) {
            return res.status(400).json({
                success: false,
                message: 'No rented motorbikes found. GPS simulation can only be started for rented motorbikes.'
            });
        }

        await gpsSimulator.startAllRentedSimulations();

        res.status(200).json({
            success: true,
            message: 'GPS simulation started for all rented motorbikes'
        });
    } catch (error) {
        console.error('Error starting all rented simulations:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting GPS simulations',
            error: error.message
        });
    }
};

// Stop all GPS simulations
const stopAllSimulations = async (req, res) => {
    try {
        await gpsSimulator.stopAllSimulations();

        res.status(200).json({
            success: true,
            message: 'All GPS simulations stopped'
        });
    } catch (error) {
        console.error('Error stopping all simulations:', error);
        res.status(500).json({
            success: false,
            message: 'Error stopping GPS simulations',
            error: error.message
        });
    }
};

// Get simulation status
const getSimulationStatus = async (req, res) => {
    try {
        const activeSimulations = Array.from(gpsSimulator.activeSimulations.keys());
        const hasRentedMotorbikes = await gpsSimulator.hasRentedMotorbikes();

        res.status(200).json({
            success: true,
            message: 'Retrieved simulation status',
            data: {
                activeSimulations,
                totalActive: activeSimulations.length,
                hasRentedMotorbikes
            }
        });
    } catch (error) {
        console.error('Error getting simulation status:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving simulation status',
            error: error.message
        });
    }
};

// Manual location update from frontend simulation (only for rented motorbikes)
const manualUpdateLocation = async (req, res) => {
    try {
        const { motorbikeId, latitude, longitude, speed, heading, timestamp, isActive } = req.body;

        // Validate required fields
        if (!motorbikeId || latitude === undefined || longitude === undefined) {
            return res.status(400).json({
                success: false,
                message: 'MotorbikeId, latitude, and longitude are required'
            });
        }

        // Check if motorbike exists and is rented
        const motorbike = await MotorbikeModel.findById(motorbikeId);
        if (!motorbike) {
            return res.status(404).json({
                success: false,
                message: 'Motorbike not found'
            });
        }

        if (motorbike.status !== 'rented') {
            return res.status(403).json({
                success: false,
                message: 'Location updates are only allowed for rented motorbikes'
            });
        }

        // Create new location record
        const locationData = {
            motorbikeId,
            latitude: Number(latitude),
            longitude: Number(longitude),
            speed: Number(speed) || 0,
            heading: Number(heading) || 0,
            timestamp: timestamp || new Date(),
            isActive: isActive !== undefined ? isActive : true
        };

        const newLocation = await LocationModel.create(locationData);

        // Emit real-time update via Socket.IO
        if (global.io) {
            global.io.to(`motorbike-${motorbikeId}`).emit('location-update', {
                motorbikeId,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                speed: locationData.speed,
                heading: locationData.heading,
                timestamp: locationData.timestamp
            });
        }

        res.status(201).json({
            success: true,
            message: 'Location updated successfully',
            data: newLocation
        });

    } catch (error) {
        console.error('Error in manualUpdateLocation:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Get location data only from rented motorbikes and save to database
const getAndSaveRentedMotorbikeLocations = async (req, res) => {
    try {
        // Get all rented motorbikes
        const rentedMotorbikes = await MotorbikeModel.find({ status: 'rented' })
            .populate('motorbikeType')
            .populate('branchId');

        if (rentedMotorbikes.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No rented motorbikes found',
                data: []
            });
        }

        const locationsWithMotorbikes = [];

        for (const motorbike of rentedMotorbikes) {
            // Generate new location data for the motorbike
            const newLocation = await gpsSimulator.generateMovementPattern(
                motorbike.lastKnownLatitude || 10.762622, // Default to Ho Chi Minh City
                motorbike.lastKnownLongitude || 106.660172
            );

            // Save the new location to database
            const savedLocation = await LocationModel.create({
                motorbikeId: motorbike._id,
                latitude: newLocation.latitude,
                longitude: newLocation.longitude,
                speed: newLocation.speed,
                heading: newLocation.heading,
                timestamp: new Date(),
                isActive: true
            });

            // Update motorbike's last known position
            await MotorbikeModel.findByIdAndUpdate(motorbike._id, {
                lastKnownLatitude: newLocation.latitude,
                lastKnownLongitude: newLocation.longitude
            });

            locationsWithMotorbikes.push({
                motorbike: {
                    _id: motorbike._id,
                    code: motorbike.code,
                    motorbikeType: motorbike.motorbikeType,
                    branchId: motorbike.branchId,
                    status: motorbike.status
                },
                location: savedLocation
            });

            // Emit real-time update via Socket.IO
            if (global.io) {
                global.io.to(`motorbike-${motorbike._id}`).emit('location-update', {
                    motorbikeId: motorbike._id,
                    latitude: newLocation.latitude,
                    longitude: newLocation.longitude,
                    speed: newLocation.speed,
                    heading: newLocation.heading,
                    timestamp: savedLocation.timestamp
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Retrieved and saved location data for ${rentedMotorbikes.length} rented motorbikes`,
            data: locationsWithMotorbikes
        });
    } catch (error) {
        console.error('Error getting and saving rented motorbike locations:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving and saving motorbike locations',
            error: error.message
        });
    }
};

module.exports = {
    getAllRentedMotorbikeLocations,
    getMotorbikeLocation,
    getMotorbikeLocationHistory,
    startMotorbikeSimulation,
    stopMotorbikeSimulation,
    startAllRentedSimulations,
    stopAllSimulations,
    getSimulationStatus,
    manualUpdateLocation,
    getAndSaveRentedMotorbikeLocations
}; 