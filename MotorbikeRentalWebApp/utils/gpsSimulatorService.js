const LocationModel = require('../models/locationModels');
const MotorbikeModel = require('../models/motorbikeModels');

class GPSSimulatorService {
    constructor() {
        this.activeSimulations = new Map(); // Map to store active simulations
        this.simulationIntervals = new Map(); // Map to store interval IDs
    }

    // Generate random coordinates within a bounding box (Ho Chi Minh City area)
    generateRandomCoordinates() {
        // Ho Chi Minh City bounding box
        const minLat = 10.4;
        const maxLat = 11.0;
        const minLng = 106.4;
        const maxLng = 107.0;

        const latitude = Math.random() * (maxLat - minLat) + minLat;
        const longitude = Math.random() * (maxLng - minLng) + minLng;

        return { latitude, longitude };
    }

    // Calculate new position based on current position, speed, and heading
    calculateNewPosition(currentLat, currentLng, speed, heading) {
        // Convert speed from km/h to degrees (approximate)
        const speedInDegrees = speed / 111000; // 1 degree ≈ 111km

        // Convert heading to radians
        const headingRad = (heading * Math.PI) / 180;

        // Calculate new position
        const deltaLat = speedInDegrees * Math.cos(headingRad);
        const deltaLng = speedInDegrees * Math.sin(headingRad) / Math.cos(currentLat * Math.PI / 180);

        return {
            latitude: currentLat + deltaLat,
            longitude: currentLng + deltaLng
        };
    }

    // Generate realistic movement pattern
    generateMovementPattern(currentLat, currentLng) {
        // Random speed between 0-60 km/h
        const speed = Math.random() * 60;

        // Random heading change (slight turns)
        const headingChange = (Math.random() - 0.5) * 30; // ±15 degrees

        // Get current heading or generate new one
        let currentHeading = Math.random() * 360;

        // Apply heading change
        currentHeading = (currentHeading + headingChange + 360) % 360;

        // Calculate new position
        const newPosition = this.calculateNewPosition(currentLat, currentLng, speed, currentHeading);

        return {
            latitude: newPosition.latitude,
            longitude: newPosition.longitude,
            speed: speed,
            heading: currentHeading
        };
    }

    // Start GPS simulation for a motorbike
    async startSimulation(motorbikeId) {
        try {
            // Check if simulation is already running
            if (this.activeSimulations.has(motorbikeId)) {
                console.log(`GPS simulation already running for motorbike ${motorbikeId}`);
                return;
            }

            // Get initial coordinates
            const initialCoords = this.generateRandomCoordinates();

            // Store current position for this motorbike
            this.activeSimulations.set(motorbikeId, {
                latitude: initialCoords.latitude,
                longitude: initialCoords.longitude,
                speed: 0,
                heading: 0
            });

            // Save initial location to database
            await this.saveLocation(motorbikeId, initialCoords.latitude, initialCoords.longitude, 0, 0);

            // Start interval for location updates
            const intervalId = setInterval(async () => {
                await this.updateLocation(motorbikeId);
            }, 5000); // Update every 5 seconds

            this.simulationIntervals.set(motorbikeId, intervalId);

            console.log(`GPS simulation started for motorbike ${motorbikeId}`);
        } catch (error) {
            console.error(`Error starting GPS simulation for motorbike ${motorbikeId}:`, error);
        }
    }

    // Update location for a specific motorbike
    async updateLocation(motorbikeId) {
        try {
            const currentData = this.activeSimulations.get(motorbikeId);
            if (!currentData) {
                console.log(`No active simulation found for motorbike ${motorbikeId}`);
                return;
            }

            // Generate new movement
            const newMovement = this.generateMovementPattern(currentData.latitude, currentData.longitude);

            // Update stored position
            this.activeSimulations.set(motorbikeId, {
                latitude: newMovement.latitude,
                longitude: newMovement.longitude,
                speed: newMovement.speed,
                heading: newMovement.heading
            });

            // Save to database
            await this.saveLocation(
                motorbikeId,
                newMovement.latitude,
                newMovement.longitude,
                newMovement.speed,
                newMovement.heading
            );

            console.log(`Updated location for motorbike ${motorbikeId}:`, {
                lat: newMovement.latitude.toFixed(6),
                lng: newMovement.longitude.toFixed(6),
                speed: newMovement.speed.toFixed(1),
                heading: newMovement.heading.toFixed(1)
            });
        } catch (error) {
            console.error(`Error updating location for motorbike ${motorbikeId}:`, error);
        }
    }

    // Save location to database
    async saveLocation(motorbikeId, latitude, longitude, speed, heading) {
        try {
            const locationData = new LocationModel({
                motorbikeId,
                latitude,
                longitude,
                speed,
                heading,
                timestamp: new Date(),
                isActive: true
            });

            await locationData.save();

            // Emit real-time update via Socket.IO
            if (global.io) {
                global.io.to(`motorbike-${motorbikeId}`).emit('location-update', {
                    motorbikeId,
                    latitude,
                    longitude,
                    speed,
                    heading,
                    timestamp: locationData.timestamp
                });
            }
        } catch (error) {
            console.error(`Error saving location for motorbike ${motorbikeId}:`, error);
        }
    }

    // Stop GPS simulation for a motorbike
    async stopSimulation(motorbikeId) {
        try {
            const intervalId = this.simulationIntervals.get(motorbikeId);
            if (intervalId) {
                clearInterval(intervalId);
                this.simulationIntervals.delete(motorbikeId);
            }

            this.activeSimulations.delete(motorbikeId);

            // Mark all locations as inactive for this motorbike
            await LocationModel.updateMany(
                { motorbikeId, isActive: true },
                { isActive: false }
            );

            console.log(`GPS simulation stopped for motorbike ${motorbikeId}`);
        } catch (error) {
            console.error(`Error stopping GPS simulation for motorbike ${motorbikeId}:`, error);
        }
    }

    // Start simulations for all rented motorbikes
    async startAllRentedSimulations() {
        try {
            const rentedMotorbikes = await MotorbikeModel.find({ status: 'rented' });

            console.log(`Found ${rentedMotorbikes.length} rented motorbikes`);

            for (const motorbike of rentedMotorbikes) {
                await this.startSimulation(motorbike._id);
            }
        } catch (error) {
            console.error('Error starting all rented simulations:', error);
        }
    }

    // Stop all active simulations
    async stopAllSimulations() {
        try {
            const motorbikeIds = Array.from(this.activeSimulations.keys());

            for (const motorbikeId of motorbikeIds) {
                await this.stopSimulation(motorbikeId);
            }

            console.log('All GPS simulations stopped');
        } catch (error) {
            console.error('Error stopping all simulations:', error);
        }
    }

    // Get current location of a motorbike
    async getCurrentLocation(motorbikeId) {
        try {
            const latestLocation = await LocationModel.findOne({
                motorbikeId,
                isActive: true
            }).sort({ timestamp: -1 });

            return latestLocation;
        } catch (error) {
            console.error(`Error getting current location for motorbike ${motorbikeId}:`, error);
            return null;
        }
    }

    // Get location history for a motorbike
    async getLocationHistory(motorbikeId, limit = 100) {
        try {
            const history = await LocationModel.find({
                motorbikeId
            }).sort({ timestamp: -1 }).limit(limit);

            return history;
        } catch (error) {
            console.error(`Error getting location history for motorbike ${motorbikeId}:`, error);
            return [];
        }
    }
}

module.exports = new GPSSimulatorService(); 