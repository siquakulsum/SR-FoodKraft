const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const {
    validateOrderSearch,
    validateStatusUpdate,
    validateOrderUpdate
} = require('../validators/orderValidator');

// All routes are protected and restricted to admin (and staff if applicable)
// Prompt said "Admin-only access", so we restrict to admin.
router.use(protect);
router.use(authorize('admin'));

// Search & List Orders
router.get('/', validateOrderSearch, orderController.getAllOrders);

// Order Count
router.get('/count', validateOrderSearch, orderController.getOrdersCount);

// Get Order Details
router.get('/:id', orderController.getOrderById);

// Update Order Status
router.patch('/:id/status', validateStatusUpdate, orderController.updateOrderStatus);

// Update Order Details
router.patch('/:id', validateOrderUpdate, orderController.updateOrder);

// Delete Order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
