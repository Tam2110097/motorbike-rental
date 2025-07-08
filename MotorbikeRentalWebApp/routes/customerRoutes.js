const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getAllBranches,
    getBranchById
} = require('../controllers/customer-controller/branchCtrl');
const {
    getAvailableMotorbikeTypesAtBranch,
    getAllAvailableMotorbikeTypes
} = require('../controllers/customer-controller/motorbikeCtrl');

//router onject
const router = express.Router();


//customer routes
//get all branches
router.get('/branch/get-all', getAllBranches);
//get branch by id
router.get('/branch/get-by-id/:id', getBranchById);
//get available motorbike types at branch
router.get('/motorbike-type/available-at-branch/:branchId', getAvailableMotorbikeTypesAtBranch);
//get all available motorbike types
router.get('/motorbike-type/available', getAllAvailableMotorbikeTypes);

module.exports = router;