const orderService = require('../services/orderService');

const createOrder = async (req, res, next) => {
    try {
        const userId = req.user.id; // From auth middleware
        const order = await orderService.createOrder(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

const getAllOrders = async (req, res, next) => {
    try {
        const result = await orderService.getAllOrders(req.query);
        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const getOrdersCount = async (req, res, next) => {
    try {
        const count = await orderService.getOrdersCount(req.query);
        res.status(200).json({
            success: true,
            message: 'Orders count retrieved successfully',
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await orderService.getOrderById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Order details retrieved successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

const updateOrderStatus = async (req, res, next) => {
    try {
        const { status, note } = req.body;
        const userId = req.user.id; // From authMiddleware

        const updatedOrder = await orderService.updateOrderStatus(req.params.id, status, userId, note);

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

const updateOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updatedOrder = await orderService.updateOrderDetails(req.params.id, req.body, userId);

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

const deleteOrder = async (req, res, next) => {
    try {
        const userId = req.user.id;
        await orderService.deleteOrder(req.params.id, userId);

        res.status(200).json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllOrders,
    getOrdersCount,
    getOrderById,
    updateOrderStatus,
    updateOrder,
    deleteOrder,
    createOrder
};
