const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getAllCities
} = require('../controllers/customer-controller/cityCtrl');

//router onject
const router = express.Router();


//customer routes
//get all branches
router.get('/city/get-all', getAllCities);

module.exports = router;