const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation/recommendationCtrl');

router.post('/suggest-motorbikes', recommendationController.getSuggestedMotorbikeTypes);
router.get('/top-popular', recommendationController.getTopPopularMotorbikeTypes);

module.exports = router;
