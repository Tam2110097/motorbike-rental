const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const uploadMiddleware = require('../middlewares/uploadMiddleware');
const {
    getAllBranches,
    getBranchById
} = require('../controllers/customer-controller/branchCtrl');
const {
    // getAvailableMotorbikeTypesAtBranch,
    // getAllAvailableMotorbikeTypes
    getAvailableMotorbikeTypes
} = require('../controllers/customer-controller/motorbikeCtrl');
const {
    createRentalOrder,
    getCustomerRentalOrders,
    getRentalOrderById,
    updateRentalOrderStatus,
    cancelRentalOrder,
    getCustomerOrderStatistics,
    createOrderFeedback,
    getOrderFeedback,
    uploadOrderDocuments,
    getDocumentStatus,
    getExistingDocuments,
    testFileAccess,
    cleanupDuplicateDocuments
} = require('../controllers/customer-controller/orderCtrl');

//router onject
const router = express.Router();


//customer routes
//get all branches
router.get('/branch/get-all', getAllBranches);
//get branch by id
router.get('/branch/get-by-id/:id', getBranchById);
//get available motorbike types at branch
// router.get('/motorbike-type/available-at-branch/:branchId', getAvailableMotorbikeTypesAtBranch);
//get all available motorbike types
// router.get('/motorbike-type/available', getAllAvailableMotorbikeTypes);
router.get('/motorbike-type/available', getAvailableMotorbikeTypes);

// Order routes
// Create rental order
router.post('/order/create', authMiddleware, createRentalOrder);
// Get all rental orders for a customer (from token)
router.get('/order/get-all', authMiddleware, getCustomerRentalOrders);
// Get rental order by ID (auth required)
router.get('/order/:id', authMiddleware, getRentalOrderById);
// Update rental order status
router.put('/order/:id/status', updateRentalOrderStatus);
// Cancel rental order
router.put('/order/:id/cancel', cancelRentalOrder);
// Get customer order statistics
router.get('/order/customer/:customerId/statistics', getCustomerOrderStatistics);
// Add feedback route
router.post('/order/:orderId/feedback', authMiddleware, createOrderFeedback);
// Add get feedback route
router.get('/order/:orderId/feedback', authMiddleware, getOrderFeedback);
// Upload order documents
router.post('/order/:orderId/documents', authMiddleware, uploadMiddleware.fields([
    { name: 'cccdImages', maxCount: 10 },
    { name: 'driverLicenseImages', maxCount: 10 }
]), uploadOrderDocuments);
// Get document status
router.get('/order/:orderId/documents/status', authMiddleware, getDocumentStatus);
// Get existing documents
router.get('/order/:orderId/documents', authMiddleware, getExistingDocuments);
// Test file access
router.get('/test-file-access', testFileAccess);
// Clean up duplicate documents
router.delete('/order/:orderId/documents', authMiddleware, cleanupDuplicateDocuments);

module.exports = router;