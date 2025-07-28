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

module.exports = router;
