const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
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
    createTripPurpose,
    getAllTripPurposes,
    getTripPurposeById,
    updateTripPurpose,
    deleteTripPurpose
} = require('../controllers/admin-controller/tripPurposeCtrl');

const {
    createDistanceSuggestion,
    getAllDistanceSuggestions,
    getDistanceSuggestionById,
    updateDistanceSuggestion,
    deleteDistanceSuggestion
} = require('../controllers/admin-controller/distanceSuggestionCtrl');

const {
    createSpec,
    getAllSpecs,
    getSpecById,
    updateSpec,
    deleteSpec,
    getSpecByMotorbikeType,
} = require('../controllers/admin-controller/specCtrl');

//router onject
const router = express.Router();

/*
**************ADMIN ROUTE ACCOUNT**************
*/
//create account
router.post('/account/create', createAccount);

//get all users
router.get('/account/get-all', getAllUsers);

//delete account
router.delete('/account/delete/:id', deleteUser);

//get user by id
router.get('/account/get-by-id/:id', getUserById);

//update account
router.put('/account/update/:id', updateUser);

/*
**************ADMIN ROUTE BRANCH**************
*/
//create branch
router.post('/branch/create', createBranch);

//get all branches
router.get('/branch/get-all', getAllBranches);

//get branch by id
router.get('/branch/get-by-id/:id', getBranchById);

//update branch
router.put('/branch/update/:id', updateBranch);

//delete branch
router.delete('/branch/delete/:id', deleteBranch);

/*
**************ADMIN ROUTE MOTORBIKE TYPE**************
*/
// create motorbike type
router.post('/motorbike-type/create', createMotorbikeType);
// get all motorbike types
router.get('/motorbike-type/get-all', getAllMotorbikeTypes);
// get motorbike type by id
router.get('/motorbike-type/get-by-id/:id', getMotorbikeTypeById);
// update motorbike type
router.put('/motorbike-type/update/:id', updateMotorbikeType);
// delete motorbike type
router.delete('/motorbike-type/delete/:id', deleteMotorbikeType);
// get motorbike types without specification
router.get('/motorbike-type/get-without-spec', getMotorbikeTypesWithoutSpec);

/*
**************ADMIN ROUTE PRICING RULE**************
*/
// create pricing rule
router.post('/pricing-rule/create', createPricingRule);
// get all pricing rules
router.get('/pricing-rule/get-all', getAllPricingRules);
// get pricing rule by id
router.get('/pricing-rule/get-by-id/:id', getPricingRuleById);
// update pricing rule
router.put('/pricing-rule/update/:id', updatePricingRule);
// delete pricing rule
router.delete('/pricing-rule/delete/:id', deletePricingRule);

/*
**************ADMIN ROUTE TRIP PURPOSE**************
*/
// create trip purpose
router.post('/trip-purpose/create', createTripPurpose);
// get all trip purposes
router.get('/trip-purpose/get-all', getAllTripPurposes);
// get trip purpose by id
router.get('/trip-purpose/get-by-id/:id', getTripPurposeById);
// update trip purpose
router.put('/trip-purpose/update/:id', updateTripPurpose);
// delete trip purpose
router.delete('/trip-purpose/delete/:id', deleteTripPurpose);

/*
**************ADMIN ROUTE DISTANCE SUGGESTION**************
*/
// create distance suggestion
router.post('/distance-suggestion/create', createDistanceSuggestion);
// get all distance suggestions
router.get('/distance-suggestion/get-all', getAllDistanceSuggestions);
// get distance suggestion by id
router.get('/distance-suggestion/get-by-id/:id', getDistanceSuggestionById);
// update distance suggestion
router.put('/distance-suggestion/update/:id', updateDistanceSuggestion);
// delete distance suggestion
router.delete('/distance-suggestion/delete/:id', deleteDistanceSuggestion);

/*
**************ADMIN ROUTE SPECIFICATION CRUD**************
*/
// create specification
router.post('/specifications/create', createSpec);
// get all specifications
router.get('/specifications/get-all', getAllSpecs);
// get specification by id
router.get('/specifications/get-by-id/:id', getSpecById);
// update specification
router.put('/specifications/update/:id', updateSpec);
// delete specification
router.delete('/specifications/delete/:id', deleteSpec);

module.exports = router;