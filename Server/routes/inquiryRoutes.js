const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public/Protected routes (all require authentication)
router.use(protect); // All inquiry routes require authentication

// Dashboard statistics (admin only)
router.get('/stats', authorize('admin'), inquiryController.getStats);

// Export inquiries (admin only)
router.get('/export', authorize('admin'), inquiryController.exportInquiries);

// List inquiries with filters
router.get('/', inquiryController.listInquiries);

// Create new inquiry
router.post('/', inquiryController.createInquiry);

// Get inquiry by ID
router.get('/:id', inquiryController.getInquiryById);

// Update inquiry
router.patch('/:id', inquiryController.updateInquiry);

// Update inquiry status (inline)
router.patch('/:id/status', inquiryController.updateStatus);

// Update inquiry priority (inline)
router.patch('/:id/priority', inquiryController.updatePriority);

// Delete inquiry (soft delete)
router.delete('/:id', inquiryController.deleteInquiry);

module.exports = router;
