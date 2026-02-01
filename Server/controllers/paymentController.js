const paymentService = require('../services/paymentService');
const { validateAddPayment, validateUpdatePayment } = require('../validators/paymentValidator');

const getDashboardMetrics = async (req, res, next) => {
    try {
        const metrics = await paymentService.getDashboardMetrics();
        res.status(200).json({ success: true, data: metrics });
    } catch (error) {
        next(error);
    }
};

const { Order } = require('../models');

// Helper to check if string is UUID
const isUUID = (str) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(str);
};

const addPayment = async (req, res, next) => {
    try {
        const { error } = validateAddPayment(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        let { order_id } = req.body;

        // Smart Resolution: If order_id isn't a UUID, assume it's an Order Number (e.g., ORD-xxxx)
        if (!isUUID(order_id)) {
            const order = await Order.findOne({ where: { order_number: order_id } });
            if (!order) {
                return res.status(404).json({ success: false, message: `Order with number '${order_id}' not found.` });
            }
            // Swap with resolved UUID
            req.body.order_id = order.id;
        }

        const payment = await paymentService.addPayment(req.body, req.user ? req.user.id : null, req.ip);
        res.status(201).json({ success: true, message: 'Payment added successfully', data: payment });
    } catch (error) {
        next(error);
    }
};

const getAllPayments = async (req, res, next) => {
    try {
        const result = await paymentService.getAllPayments(req.query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getPaymentById = async (req, res, next) => {
    try {
        const payment = await paymentService.getPaymentById(req.params.id);
        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        next(error);
    }
};

const updatePayment = async (req, res, next) => {
    try {
        const { error } = validateUpdatePayment(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const payment = await paymentService.updatePayment(req.params.id, req.body, req.user ? req.user.id : null, req.ip);
        res.status(200).json({ success: true, message: 'Payment updated successfully', data: payment });
    } catch (error) {
        next(error);
    }
};

const deletePayment = async (req, res, next) => {
    try {
        const result = await paymentService.deletePayment(req.params.id, req.user ? req.user.id : null, req.ip);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        next(error);
    }
};

const exportPayments = async (req, res, next) => {
    try {
        const csvData = await paymentService.exportPayments(req.query);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
        res.send(csvData);
    } catch (error) {
        next(error);
    }
};

// Simple count endpoint as per requirements
const getTransactionsCount = async (req, res, next) => {
    try {
        const metrics = await paymentService.getDashboardMetrics();
        res.status(200).json({ success: true, count: metrics.totalTransactions });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboardMetrics,
    addPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    exportPayments,
    getTransactionsCount
};
