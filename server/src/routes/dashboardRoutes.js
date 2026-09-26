const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/kpis', dashboardController.getKpis);
router.get('/chart', dashboardController.getChart);
router.get('/low-stock', dashboardController.getLowStock);
router.get('/activity', dashboardController.getActivity);
router.get('/ai-suggestions', dashboardController.getAiSuggestions);

module.exports = router;
