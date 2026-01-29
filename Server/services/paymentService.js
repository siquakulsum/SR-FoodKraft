const { Payment, Order, User, AuditLog, Sequelize } = require('../models');
const { Op } = Sequelize;

const getDashboardMetrics = async () => {
    try {
        const totalRevenue = await Payment.sum('amount', {
            where: { status: 'completed' }
        });

        const totalTransactions = await Payment.count();

        const completedPayments = await Payment.count({
            where: { status: 'completed' }
        });

        return {
            totalRevenue: totalRevenue || 0,
            totalTransactions,
            completedPayments
        };
    } catch (error) {
        throw new Error('Error fetching dashboard metrics: ' + error.message);
    }
};

const addPayment = async (data, userId, ipAddress) => {
    const { order_id, amount, payment_method, transaction_id, provider, provider_response, status } = data;

    // Check if order exists
    const order = await Order.findByPk(order_id);
    if (!order) {
        throw new Error('Order not found');
    }

    // Check for duplicate successful payment for this order
    const existingPayment = await Payment.findOne({
        where: {
            order_id,
            status: 'completed'
        }
    });

    if (existingPayment) {
        throw new Error('Order already has a completed payment');
    }

    const t = await Payment.sequelize.transaction();

    try {
        const payment = await Payment.create({
            order_id,
            amount,
            payment_method,
            transaction_id: transaction_id || `TXN-${Date.now()}`,
            provider,
            provider_response,
            status: status || 'pending'
        }, { transaction: t });

        // Update Order payment status if completed
        if (payment.status === 'completed') {
            await order.update({ payment_status: 'paid' }, { transaction: t });
        }

        // Log action
        await AuditLog.create({
            user_id: userId,
            action: 'CREATE_PAYMENT',
            target_type: 'Payment',
            target_id: payment.id,
            details: { amount, order_id, status: payment.status },
            ip_address: ipAddress
        }, { transaction: t });

        await t.commit();
        return payment;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const getAllPayments = async (query) => {
    const { status, payment_method, startDate, endDate, search, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (payment_method) whereClause.payment_method = payment_method;
    if (startDate && endDate) {
        whereClause.created_at = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    const includeOptions = [
        {
            model: Order,
            as: 'order',
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'phone', 'email']
                }
            ]
        }
    ];

    if (search) {
        whereClause[Op.or] = [
            { transaction_id: { [Op.like]: `%${search}%` } },
            // Search in associated tables needs specific handling or separate query logic usually,
            // but for simplicity in Sequelize we can try basic inclusion logic or rely on client side filter if acceptable.
            // However, request says "Search (fuzzy): transaction_id, customer name, customer phone".
            // To search nested fields in Sequelize usually requires top-level `$` references or subqueries.
            // Simplified approach: Search transaction_id only here, or use advanced where.
            { '$order.user.name$': { [Op.like]: `%${search}%` } },
            { '$order.user.phone$': { [Op.like]: `%${search}%` } }
        ];
    }

    const { count, rows } = await Payment.findAndCountAll({
        where: whereClause,
        include: includeOptions,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
    });

    return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        payments: rows
    };
};

const getPaymentById = async (id) => {
    const payment = await Payment.findByPk(id, {
        include: [
            {
                model: Order,
                as: 'order',
                include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] }]
            }
        ]
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
};

const updatePayment = async (id, data, userId, ipAddress) => {
    const payment = await Payment.findByPk(id);
    if (!payment) throw new Error('Payment not found');

    const t = await Payment.sequelize.transaction();

    try {
        const oldStatus = payment.status;
        await payment.update(data, { transaction: t });

        // Update Order if status changed to completed
        if (data.status === 'completed' && oldStatus !== 'completed') {
            await Order.update({ payment_status: 'paid' }, { where: { id: payment.order_id }, transaction: t });
        }

        // Log action
        await AuditLog.create({
            user_id: userId,
            action: 'UPDATE_PAYMENT',
            target_type: 'Payment',
            target_id: payment.id,
            details: { oldStatus, newStatus: data.status, updates: data },
            ip_address: ipAddress
        }, { transaction: t });

        await t.commit();
        return payment;
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const deletePayment = async (id, userId, ipAddress) => {
    const payment = await Payment.findByPk(id);
    if (!payment) throw new Error('Payment not found');

    const t = await Payment.sequelize.transaction();
    try {
        await payment.destroy({ transaction: t }); // Soft delete

        await AuditLog.create({
            user_id: userId,
            action: 'DELETE_PAYMENT',
            target_type: 'Payment',
            target_id: id,
            details: { message: 'Soft deleted payment' },
            ip_address: ipAddress
        }, { transaction: t });

        await t.commit();
        return { message: 'Payment deleted successfully' };
    } catch (error) {
        await t.rollback();
        throw error;
    }
};

const exportPayments = async (query) => {
    // Re-use logic for fetching but without pagination
    const { status, payment_method, startDate, endDate, search } = query;
    const whereClause = {};
    if (status) whereClause.status = status;
    if (payment_method) whereClause.payment_method = payment_method;
    if (startDate && endDate) {
        whereClause.created_at = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    }

    // Note: Search relies on joined columns which can be tricky without the exact same setup as getAllPayments
    // For export, we generally iterate all matching records.

    const payments = await Payment.findAll({
        where: whereClause,
        include: [
            {
                model: Order,
                as: 'order',
                include: [{ model: User, as: 'user' }]
            }
        ],
        order: [['created_at', 'DESC']]
    });

    // Convert to CSV string manually or return data for controller to format
    const fields = ['id', 'transaction_id', 'amount', 'status', 'payment_method', 'created_at', 'order_number', 'customer_name'];
    const header = fields.join(',') + '\n';

    const rows = payments.map(p => {
        return [
            p.id,
            p.transaction_id,
            p.amount,
            p.status,
            p.payment_method,
            p.createdAt,
            p.order ? p.order.order_number : 'N/A',
            p.order && p.order.user ? p.order.user.name : 'N/A'
        ].join(',');
    }).join('\n');

    return header + rows;
};

module.exports = {
    getDashboardMetrics,
    addPayment,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    exportPayments
};
