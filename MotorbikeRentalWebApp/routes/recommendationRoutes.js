const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation/recommendationCtrl');

router.post('/suggest-motorbikes', recommendationController.getSuggestedMotorbikeTypes);

module.exports = router;
