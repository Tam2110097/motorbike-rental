const express = require('express');
const {
    createAccessory,
    getAllAccessories,
    getAccessoryById,
    updateAccessory,
    deleteAccessory,
    searchAccessories,
    updateAccessoryQuantity
} = require('../controllers/employee-controller/accessoryCtrl');

const {
    createMotorbike,
    getAllMotorbikes,
    getMotorbikeById,
    updateMotorbike,
    deleteMotorbike,
    getMotorbikesByType,
    getAvailableMotorbikes,
    getMotorbikesByBranch,
    updateMotorbikeStatus
} = require('../controllers/employee-controller/motorbikeCtrl');

// Router object
const router = express.Router();

/*
**************EMPLOYEE ROUTE ACCESSORY**************
*/
// Create accessory
router.post('/accessory/create-accessory', createAccessory);

// Get all accessories
router.get('/accessory/get-all-accessories', getAllAccessories);

// Get accessory by ID
router.get('/accessory/get-accessory-by-id/:id', getAccessoryById);

// Update accessory
router.put('/accessory/update-accessory/:id', updateAccessory);

// Delete accessory
router.delete('/accessory/delete-accessory/:id', deleteAccessory);

// Search accessories by name
router.get('/accessory/search-accessories', searchAccessories);

// Update accessory quantity (for inventory management)
router.patch('/accessory/update-quantity/:id', updateAccessoryQuantity);

/*
**************EMPLOYEE ROUTE MOTORBIKE**************
*/
// Create motorbike
router.post('/motorbike/create', createMotorbike);

// Get all motorbikes
router.get('/motorbike/get-all', getAllMotorbikes);

// Get motorbike by ID
router.get('/motorbike/get-by-id/:id', getMotorbikeById);

// Update motorbike
router.put('/motorbike/update/:id', updateMotorbike);

// Delete motorbike
router.delete('/motorbike/delete/:id', deleteMotorbike);

// Get motorbikes by type
router.get('/motorbike/get-by-type/:motorbikeTypeId', getMotorbikesByType);

// Get available motorbikes
router.get('/motorbike/get-available', getAvailableMotorbikes);

// Get motorbikes by branch
router.get('/motorbike/get-by-branch/:branchId', getMotorbikesByBranch);

// Update motorbike status
router.patch('/motorbike/update-status/:id', updateMotorbikeStatus);

module.exports = router;
