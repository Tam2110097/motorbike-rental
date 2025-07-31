const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
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

const {
    getAllOrders,
    getOrderById,
    getInvoiceData,
    getAccessoryDetailsForOrder,
    getFullInvoiceData,
    markPaidOrder,
    checkInOrder,
    checkoutOrder,
    createRefund,
    completeRefund,
    getAllRefunds,
    getOrderDocuments,
    validateOrderDocuments
} = require('../controllers/employee-controller/orderManagementCtrl');

const {
    getMaintenanceLevels,
    getOrderMotorbikesForMaintenance,
    createMaintenanceForOrder,
    getAllMaintenance,
    completeMaintenance
} = require('../controllers/employee-controller/maintenanceCtrl');

const {
    getAllRentedMotorbikeLocations,
    getMotorbikeLocation,
    getMotorbikeLocationHistory,
    startMotorbikeSimulation,
    stopMotorbikeSimulation,
    startAllRentedSimulations,
    stopAllSimulations,
    getSimulationStatus,
    manualUpdateLocation
} = require('../controllers/employee-controller/locationCtrl');

// Router object
const router = express.Router();

/*
**************EMPLOYEE ROUTE ACCESSORY**************
*/
// Create accessory
router.post('/accessory/create-accessory', authMiddleware, authorizeRoles('employee'), createAccessory);

// Get all accessories
router.get('/accessory/get-all-accessories', getAllAccessories);

// Get accessory by ID
router.get('/accessory/get-accessory-by-id/:id', getAccessoryById);

// Update accessory
router.put('/accessory/update-accessory/:id', authMiddleware, authorizeRoles('employee'), updateAccessory);

// Delete accessory
router.delete('/accessory/delete-accessory/:id', authMiddleware, authorizeRoles('employee'), deleteAccessory);

// Search accessories by name
router.get('/accessory/search-accessories', authMiddleware, authorizeRoles('employee'), searchAccessories);

// Update accessory quantity (for inventory management)
router.patch('/accessory/update-quantity/:id', authMiddleware, authorizeRoles('employee'), updateAccessoryQuantity);

/*
**************EMPLOYEE ROUTE MOTORBIKE**************
*/
// Create motorbike
router.post('/motorbike/create', authMiddleware, authorizeRoles('employee'), createMotorbike);

// Get all motorbikes
router.get('/motorbike/get-all', getAllMotorbikes);

// Get motorbike by ID
router.get('/motorbike/get-by-id/:id', getMotorbikeById);

// Update motorbike
router.put('/motorbike/update/:id', authMiddleware, authorizeRoles('employee'), updateMotorbike);

// Delete motorbike
router.delete('/motorbike/delete/:id', authMiddleware, authorizeRoles('employee'), deleteMotorbike);

// Get motorbikes by type
router.get('/motorbike/get-by-type/:motorbikeTypeId', authMiddleware, authorizeRoles('employee'), getMotorbikesByType);

// Get available motorbikes
router.get('/motorbike/get-available', authMiddleware, authorizeRoles('employee'), getAvailableMotorbikes);

// Get motorbikes by branch
router.get('/motorbike/get-by-branch/:branchId', authMiddleware, authorizeRoles('employee'), getMotorbikesByBranch);

// Update motorbike status
router.patch('/motorbike/update-status/:id', authMiddleware, authorizeRoles('employee'), updateMotorbikeStatus);

/*
**************EMPLOYEE ROUTE ORDER MANAGEMENT**************
*/
router.get('/order/get-all', authMiddleware, authorizeRoles('employee'), getAllOrders);
router.get('/order/:id', authMiddleware, authorizeRoles('employee'), getOrderById);
router.get('/order/invoice/:orderId', authMiddleware, authorizeRoles('employee'), getInvoiceData);
router.get('/order/:orderId/accessories', authMiddleware, authorizeRoles('employee'), getAccessoryDetailsForOrder);
router.get('/order/full-invoice/:orderId', authMiddleware, authorizeRoles('employee'), getFullInvoiceData);
router.put('/order/:orderId/mark-paid', authMiddleware, authorizeRoles('employee'), markPaidOrder);
router.put('/order/:orderId/check-in', authMiddleware, authorizeRoles('employee'), checkInOrder);
router.put('/order/:orderId/checkout', authMiddleware, authorizeRoles('employee'), checkoutOrder);

// Refund routes
router.get('/refund/all', authMiddleware, authorizeRoles('employee'), getAllRefunds);
router.post('/refund/complete/:refundId', authMiddleware, authorizeRoles('employee'), uploadMiddleware.single('invoiceImage'), completeRefund);
router.post('/refund/create/:orderId', authMiddleware, authorizeRoles('employee'), createRefund);

// Document validation routes
router.get('/order/:orderId/documents', authMiddleware, authorizeRoles('employee'), getOrderDocuments);
router.put('/order/:orderId/validate-documents', authMiddleware, authorizeRoles('employee'), validateOrderDocuments);

/*
**************EMPLOYEE ROUTE MAINTENANCE**************
*/
// Get maintenance levels configuration
router.get('/maintenance/levels', authMiddleware, authorizeRoles('employee'), getMaintenanceLevels);

// Get motorbikes from completed order for maintenance selection
router.get('/maintenance/order/:orderId/motorbikes', authMiddleware, authorizeRoles('employee'), getOrderMotorbikesForMaintenance);

// Create maintenance records for motorbikes
router.post('/maintenance/order/:orderId/create', authMiddleware, authorizeRoles('employee'), uploadMiddleware.array('images', 10), createMaintenanceForOrder);

// Get all maintenance records
router.get('/maintenance/all', authMiddleware, authorizeRoles('employee'), getAllMaintenance);

// Complete maintenance
router.put('/maintenance/:maintenanceId/complete', authMiddleware, authorizeRoles('employee'), completeMaintenance);

/*
**************EMPLOYEE ROUTE LOCATION TRACKING**************
*/
// Get all rented motorbike locations
router.get('/location/rented-motorbikes', authMiddleware, authorizeRoles('employee'), getAllRentedMotorbikeLocations);

// Get specific motorbike location
router.get('/location/motorbike/:motorbikeId', authMiddleware, authorizeRoles('employee'), getMotorbikeLocation);

// Get motorbike location history
router.get('/location/motorbike/:motorbikeId/history', authMiddleware, authorizeRoles('employee'), getMotorbikeLocationHistory);

// Start GPS simulation for specific motorbike
router.post('/location/simulation/start/:motorbikeId', authMiddleware, authorizeRoles('employee'), startMotorbikeSimulation);

// Stop GPS simulation for specific motorbike
router.post('/location/simulation/stop/:motorbikeId', authMiddleware, authorizeRoles('employee'), stopMotorbikeSimulation);

// Start GPS simulation for all rented motorbikes
router.post('/location/simulation/start-all', authMiddleware, authorizeRoles('employee'), startAllRentedSimulations);

// Stop all GPS simulations
router.post('/location/simulation/stop-all', authMiddleware, authorizeRoles('employee'), stopAllSimulations);

// Get simulation status
router.get('/location/simulation/status', authMiddleware, authorizeRoles('employee'), getSimulationStatus);

// Manual location update from frontend simulation
router.post('/location/simulation/manual', authMiddleware, authorizeRoles('employee'), manualUpdateLocation);

module.exports = router;
