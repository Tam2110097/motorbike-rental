const gpsSimulator = require('../utils/gpsSimulatorService');
const MotorbikeModel = require('../models/motorbikeModels');

// Function to start GPS simulation for a motorbike when it becomes rented
const startSimulationForRentedMotorbike = async (motorbikeId) => {
    try {
        const motorbike = await MotorbikeModel.findById(motorbikeId);

        if (motorbike && motorbike.status === 'rented') {
            console.log(`Starting GPS simulation for newly rented motorbike: ${motorbike.code}`);
            await gpsSimulator.startSimulation(motorbikeId);
        }
    } catch (error) {
        console.error(`Error starting GPS simulation for motorbike ${motorbikeId}:`, error);
    }
};

// Function to stop GPS simulation for a motorbike when it's no longer rented
const stopSimulationForNonRentedMotorbike = async (motorbikeId) => {
    try {
        const motorbike = await MotorbikeModel.findById(motorbikeId);

        if (motorbike && motorbike.status !== 'rented') {
            console.log(`Stopping GPS simulation for motorbike (no longer rented): ${motorbike.code}`);
            await gpsSimulator.stopSimulation(motorbikeId);
        }
    } catch (error) {
        console.error(`Error stopping GPS simulation for motorbike ${motorbikeId}:`, error);
    }
};

// Function to sync all GPS simulations with current motorbike statuses
const syncGPSSimulations = async () => {
    try {
        console.log('Syncing GPS simulations with motorbike statuses...');

        // Check if there are any rented motorbikes
        const hasRentedMotorbikes = await gpsSimulator.hasRentedMotorbikes();

        if (!hasRentedMotorbikes) {
            console.log('No rented motorbikes found, stopping all GPS simulations');
            await gpsSimulator.stopAllSimulations();
            return;
        }

        // Get all motorbikes
        const allMotorbikes = await MotorbikeModel.find({});

        for (const motorbike of allMotorbikes) {
            const isSimulationActive = gpsSimulator.activeSimulations.has(motorbike._id.toString());

            if (motorbike.status === 'rented' && !isSimulationActive) {
                // Start simulation for rented motorbikes that don't have active simulation
                console.log(`Starting GPS simulation for rented motorbike: ${motorbike.code}`);
                await gpsSimulator.startSimulation(motorbike._id);
            } else if (motorbike.status !== 'rented' && isSimulationActive) {
                // Stop simulation for non-rented motorbikes that have active simulation
                console.log(`Stopping GPS simulation for non-rented motorbike: ${motorbike.code}`);
                await gpsSimulator.stopSimulation(motorbike._id);
            }
        }

        console.log('GPS simulation sync completed');
    } catch (error) {
        console.error('Error syncing GPS simulations:', error);
    }
};

// Function to check and stop all simulations if no rented motorbikes
const checkAndStopSimulationsIfNoRented = async () => {
    try {
        const hasRentedMotorbikes = await gpsSimulator.hasRentedMotorbikes();

        if (!hasRentedMotorbikes) {
            console.log('No rented motorbikes found, stopping all GPS simulations');
            await gpsSimulator.stopAllSimulations();
        }
    } catch (error) {
        console.error('Error checking for rented motorbikes:', error);
    }
};

// Export functions for use in other parts of the application
module.exports = {
    startSimulationForRentedMotorbike,
    stopSimulationForNonRentedMotorbike,
    syncGPSSimulations,
    checkAndStopSimulationsIfNoRented
}; 