const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET /api/dashboard
router.get('/', protect, authorize('admin'), dashboardController.getDashboardData);

module.exports = router;
