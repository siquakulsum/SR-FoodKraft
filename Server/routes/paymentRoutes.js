const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Dashboard & Stats
router.get('/stats', protect, authorize('admin', 'staff'), paymentController.getDashboardMetrics);
router.get('/count', protect, authorize('admin', 'staff'), paymentController.getTransactionsCount);

// Export
router.get('/export', protect, authorize('admin'), paymentController.exportPayments);

// CRUD
router.post('/', protect, authorize('admin', 'staff'), paymentController.addPayment);
router.get('/', protect, authorize('admin', 'staff'), paymentController.getAllPayments);
router.get('/:id', protect, authorize('admin', 'staff'), paymentController.getPaymentById);
router.patch('/:id', protect, authorize('admin'), paymentController.updatePayment); // Admin only often used for updates
router.delete('/:id', protect, authorize('admin'), paymentController.deletePayment);

module.exports = router;

