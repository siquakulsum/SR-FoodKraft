const {
    Order,
    Payment,
    User,
    Inquiry,
    OrderItem,
    MenuItem,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

const getDashboardData = async () => {
    // KPI Cards
    // 1. Total Orders
    const totalOrdersPromise = Order.count();

    // 2. Total Revenue (Success payments)
    const totalRevenuePromise = Payment.sum('amount', {
        where: { status: 'completed' }
    });

    // 3. Total Customers
    const totalCustomersPromise = User.count({
        where: { role: 'customer' }
    });

    // 4. Total Inquiries
    const totalInquiriesPromise = Inquiry.count();

    // 5. Today's Revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRevenuePromise = Payment.sum('amount', {
        where: {
            status: 'completed',
            created_at: { [Op.gte]: todayStart }
        }
    });

    // 6. Pending Orders
    const pendingOrdersPromise = Order.count({
        where: {
            status: { [Op.ne]: 'delivered' } // Assuming 'delivered' is the final state. Or specifically 'pending'?
            // Prompt says: "Pending Orders -> GET /orders?status!=delivered"
        }
    });

    // 7. New Customers Today
    const newCustomersTodayPromise = User.count({
        where: {
            role: 'customer',
            created_at: { [Op.gte]: todayStart }
        }
    });

    // 8. Pending Payments
    const pendingPaymentsPromise = Payment.count({
        where: { status: 'pending' }
    });


    // Recent Lists
    // 9. Recent Orders (Limit 5)
    const recentOrdersPromise = Order.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['name', 'email', 'phone']
            },
            {
                model: OrderItem,
                as: 'items',
                limit: 3,
                include: [{
                    model: MenuItem,
                    as: 'menu_item',
                    attributes: ['image_url']
                }]
            }
        ]
    });

    // 10. Recent Inquiries (Limit 5)
    const recentInquiriesPromise = Inquiry.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
            {
                model: User,
                as: 'assignedUser',
                attributes: ['name']
            }
        ] // Add assignedUser if needed
    });

    // Charts Data
    // 11. Orders by Status
    const ordersByStatusPromise = Order.findAll({
        attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['status']
    });

    // 12. Orders by Type
    const ordersByTypePromise = Order.findAll({
        attributes: ['order_type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['order_type']
    });

    // 13. Sales Last 7 Days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const salesLast7DaysPromise = Payment.findAll({
        attributes: [
            [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
            [sequelize.fn('SUM', sequelize.col('amount')), 'revenue'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
            created_at: { [Op.gte]: sevenDaysAgo },
            status: 'completed'
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // 14. Top Selling Items
    const topSellingItemsPromise = OrderItem.findAll({
        attributes: [
            'menu_item_id',
            'menu_item_name', // Assuming name is stored in snapshot
            [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold']
        ],
        group: ['menu_item_id', 'menu_item_name'],
        order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
        limit: 5,
        include: [
            // Optional: Join MenuItem for image if 'menu_item_name' isn't enough or image not in Item
            // Assuming MenuItem model exists and check logic later.
            {
                model: MenuItem,
                as: 'menu_item',
                attributes: ['image_url', 'price']
            }
        ]
    });

    const [
        totalOrders,
        totalRevenue,
        totalCustomers,
        totalInquiries,
        todayRevenue,
        pendingOrders,
        newCustomersToday,
        pendingPayments,
        recentOrders,
        recentInquiries,
        ordersByStatus,
        ordersByType,
        salesLast7Days,
        topSellingItems
    ] = await Promise.all([
        totalOrdersPromise,
        totalRevenuePromise,
        totalCustomersPromise,
        totalInquiriesPromise,
        todayRevenuePromise,
        pendingOrdersPromise,
        newCustomersTodayPromise,
        pendingPaymentsPromise,
        recentOrdersPromise,
        recentInquiriesPromise,
        ordersByStatusPromise,
        ordersByTypePromise,
        salesLast7DaysPromise,
        topSellingItemsPromise
    ]);

    return {
        stats: {
            totalOrders,
            totalRevenue: totalRevenue || 0,
            totalCustomers,
            totalInquiries,
            todayRevenue: todayRevenue || 0,
            pendingOrders,
            newCustomersToday,
            pendingPayments
        },
        recentOrders,
        recentInquiries,
        charts: {
            ordersByStatus,
            ordersByType,
            salesLast7Days,
            topSellingItems
        }
    };
};

module.exports = {
    getDashboardData
};
