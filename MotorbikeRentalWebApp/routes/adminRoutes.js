const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    createAccount,
    getAllUsers,
    deleteUser,
    updateUser,
    getUserById,
} = require('../controllers/admin controller/accountCtrl');

const {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
} = require('../controllers/admin controller/branchCtrl');

//router onject
const router = express.Router();

/*
**************ADMIN ROUTE ACCOUNT**************
*/
//create account
router.post('/account/create-account', createAccount);

//get all users
router.get('/account/get-all-users', getAllUsers);

//delete account
router.delete('/account/delete-account/:id', deleteUser);

//get user by id
router.get('/account/get-user-by-id/:id', getUserById);

//update account
router.put('/account/update-account/:id', updateUser);

/*
**************ADMIN ROUTE BRANCH**************
*/
//create branch
router.post('/branch/create-branch', createBranch);

//get all branches
router.get('/branch/get-all-branches', getAllBranches);

//get branch by id
router.get('/branch/get-branch-by-id/:id', getBranchById);

//update branch
router.put('/branch/update-branch/:id', updateBranch);

//delete branch
router.delete('/branch/delete-branch/:id', deleteBranch);



module.exports = router;