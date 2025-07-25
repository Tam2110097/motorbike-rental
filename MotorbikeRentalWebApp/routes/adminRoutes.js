const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');
const {
    createAccount,
    getAllUsers,
    deleteUser,
    updateUser,
    getUserById,
} = require('../controllers/admin-controller/accountCtrl');

const {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
} = require('../controllers/admin-controller/branchCtrl');

const {
    createMotorbikeType,
    getAllMotorbikeTypes,
    getMotorbikeTypeById,
    updateMotorbikeType,
    deleteMotorbikeType,
    getMotorbikeTypesWithoutSpec
} = require('../controllers/admin-controller/motorbikeTypeCtrl');

const {
    getAllPricingRules,
    createPricingRule,
    getPricingRuleById,
    updatePricingRule,
    deletePricingRule,
} = require('../controllers/admin-controller/pricingRuleCtrl');

const {
    createSpec,
    getAllSpecs,
    getSpecById,
    updateSpec,
    deleteSpec,
    getSpecByMotorbikeType,
} = require('../controllers/admin-controller/specCtrl');

const { getAllFeedbacks } = require('../controllers/admin-controller/feedbackCtrl');

//router onject
const router = express.Router();

/*
**************ADMIN ROUTE ACCOUNT**************
*/
//create account
router.post('/account/create', authMiddleware, authorizeRoles('admin'), createAccount);

//get all users
router.get('/account/get-all', authMiddleware, authorizeRoles('admin'), getAllUsers);

//delete account
router.delete('/account/delete/:id', authMiddleware, authorizeRoles('admin'), deleteUser);

//get user by id
router.get('/account/get-by-id/:id', authMiddleware, authorizeRoles('admin'), getUserById);

//update account
router.put('/account/update/:id', authMiddleware, authorizeRoles('admin'), updateUser);

/*
**************ADMIN ROUTE BRANCH**************
*/
//create branch
router.post('/branch/create', authMiddleware, authorizeRoles('admin'), createBranch);

//get all branches
router.get('/branch/get-all', getAllBranches);

//get branch by id
router.get('/branch/get-by-id/:id', getBranchById);

//update branch
router.put('/branch/update/:id', authMiddleware, authorizeRoles('admin'), updateBranch);

//delete branch
router.delete('/branch/delete/:id', authMiddleware, authorizeRoles('admin'), deleteBranch);

/*
**************ADMIN ROUTE MOTORBIKE TYPE**************
*/
// create motorbike type
router.post('/motorbike-type/create', authMiddleware, authorizeRoles('admin'), createMotorbikeType);
// get all motorbike types
router.get('/motorbike-type/get-all', getAllMotorbikeTypes);
// get motorbike type by id
router.get('/motorbike-type/get-by-id/:id', getMotorbikeTypeById);
// update motorbike type
router.put('/motorbike-type/update/:id', authMiddleware, authorizeRoles('admin'), updateMotorbikeType);
// delete motorbike type
router.delete('/motorbike-type/delete/:id', authMiddleware, authorizeRoles('admin'), deleteMotorbikeType);
// get motorbike types without specification
router.get('/motorbike-type/get-without-spec', authMiddleware, authorizeRoles('admin'), getMotorbikeTypesWithoutSpec);

/*
**************ADMIN ROUTE PRICING RULE**************
*/
// create pricing rule
router.post('/pricing-rule/create', authMiddleware, authorizeRoles('admin'), createPricingRule);
// get all pricing rules
router.get('/pricing-rule/get-all', getAllPricingRules);
// get pricing rule by id
router.get('/pricing-rule/get-by-id/:id', getPricingRuleById);
// update pricing rule
router.put('/pricing-rule/update/:id', authMiddleware, authorizeRoles('admin'), updatePricingRule);
// delete pricing rule
router.delete('/pricing-rule/delete/:id', authMiddleware, authorizeRoles('admin'), deletePricingRule);

/*
**************ADMIN ROUTE SPECIFICATION CRUD**************
*/
// create specification
router.post('/specifications/create', authMiddleware, authorizeRoles('admin'), createSpec);
// get all specifications
router.get('/specifications/get-all', getAllSpecs);
// get specification by id
router.get('/specifications/get-by-id/:id', getSpecById);
// update specification
router.put('/specifications/update/:id', authMiddleware, authorizeRoles('admin'), updateSpec);
// delete specification
router.delete('/specifications/delete/:id', authMiddleware, authorizeRoles('admin'), deleteSpec);

// Get all feedbacks
router.get('/feedback/get-all', authMiddleware, authorizeRoles('admin'), getAllFeedbacks);

module.exports = router;