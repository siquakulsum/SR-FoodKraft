const {
    Order,
    OrderItem,
    User,
    Address,
    Payment,
    OrderStatusHistory,
    Notification,
    MenuItem,
    Offer, // Added Offer if needed directly, but usually via service
    sequelize
} = require('../models');
const { Op } = require('sequelize');
const offersService = require('../modules/offers/offersService');

const createOrder = async (orderData, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const {
            items,
            offer_code,
            order_type,
            delivery_address_id,
            special_instructions,
            payment_method,
            delivery_date,
            delivery_time
        } = orderData;

        // 1. Calculate Subtotal
        let subtotal = 0;
        const processItems = items.map(item => {
            const total = parseFloat(item.quantity) * parseFloat(item.unit_price);
            subtotal += total;
            return {
                ...item,
                total_price: total
            };
        });

        // 2. Validate Offer (If applied)
        let discountAmount = 0;
        let appliedOfferId = null;

        if (offer_code) {
            const validation = await offersService.validateOffer(offer_code, userId, subtotal);
            // validateOffer throws if invalid
            discountAmount = parseFloat(validation.discountAmount);
            appliedOfferId = validation.offer.id;
        }

        // 3. Calculate Final Total
        // Simplified Logic: Total = Subtotal - Discount + Taxes/Delivery
        // For simulation, assuming fixed delivery/tax or generated elsewhere.
        const deliveryCharge = order_type === 'delivery' ? 50 : 0;
        const gstAmount = (subtotal - discountAmount) * 0.05; // 5% GST
        const serviceCharge = 0;

        let totalAmount = subtotal - discountAmount + deliveryCharge + gstAmount + serviceCharge;
        if (totalAmount < 0) totalAmount = 0;

        // 4. Generate Order Number
        const orderNumber = await generateOrderNumber();

        // 5. Create Order
        const order = await Order.create({
            order_number: orderNumber,
            user_id: userId,
            status: 'pending',
            order_type,
            payment_status: 'pending', // Initial status
            payment_method,
            subtotal,
            discount_amount: discountAmount,
            delivery_charges: deliveryCharge,
            service_charges: serviceCharge,
            gst_amount: gstAmount,
            total_amount: totalAmount,
            special_instructions,
            coupon_code: offer_code || null, // Storing code for reference
            delivery_address_json: delivery_address_id ? { id: delivery_address_id } : { type: order_type }, // Ensure not null
            event_date: delivery_date || new Date(), // Map delivery_date to event_date, default to today
            event_time: delivery_time || new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) // Default to now HH:mm
        }, { transaction });

        // 6. Create Order Items
        const orderItemsData = processItems.map(item => ({
            order_id: order.id,
            menu_item_id: item.menu_item_id,
            menu_item_name: item.menu_item_name,
            quantity: item.quantity,
            unit_type: item.unit_type,
            unit_price: item.unit_price,
            total_price: item.total_price,
            special_instructions: item.special_instructions
        }));

        await OrderItem.bulkCreate(orderItemsData, { transaction });

        // 7. Track Offer Usage (If applied)
        if (appliedOfferId) {
            await offersService.trackUsage(appliedOfferId, userId, order.id);
        }

        // 8. Create History Entry
        await OrderStatusHistory.create({
            order_id: order.id,
            status: 'pending',
            changed_by: userId,
            notes: 'Order placed successfully'
        }, { transaction });

        await transaction.commit();

        return await getOrderById(order.id);

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const generateOrderNumber = async () => {
    // Simple generation logic: ORD + timestamp or increment
    // Since we need to ensure uniqueness, we could use a sequence or count
    // For this implementation, let's use a timestamp-based random string or count + padding if we can lock.
    // Given the constraints and typical low-volume, a simple random string might suffice or count.
    // Let's try to find the max order number and increment.
    // Format: ORD00001
    const lastOrder = await Order.findOne({
        order: [['created_at', 'DESC']],
        paranoid: false
    });

    let nextNum = 1;
    if (lastOrder && lastOrder.order_number) {
        const match = lastOrder.order_number.match(/ORD(\d+)/);
        if (match) {
            nextNum = parseInt(match[1], 10) + 1;
        }
    }
    return `ORD${nextNum.toString().padStart(5, '0')}`;
};

const getOrderFilters = (query) => {
    const { search, status, type, start_date, end_date } = query;
    const where = {};

    if (status) {
        where.status = status;
    }

    if (type) {
        where.order_type = type;
    }

    if (start_date || end_date) {
        where.created_at = {};
        if (start_date) {
            where.created_at[Op.gte] = new Date(start_date);
        }
        if (end_date) {
            where.created_at[Op.lte] = new Date(new Date(end_date).setHours(23, 59, 59, 999));
        }
    }

    if (search) {
        // Fuzzy search
        // We need to join with User to search by name/phone, logic handled in findAll
        // For local fields:
        const searchConditions = [
            { order_number: { [Op.like]: `%${search}%` } },
            { id: { [Op.like]: `%${search}%` } } // Allow searching by UUID if needed, though rare
        ];

        // We will add User/Item search conditions in the main query "include" where clause or simple separate text match
        // Because associated where clause acts as an inner join usually, we need to be careful.
        // Easier approach: Get matching user IDs first if search looks like name/phone, then add user_id to where.

        return { where, search };
    }

    return { where };
};

const getAllOrders = async (queryParams) => {
    const { page = 1, limit = 10, search } = queryParams;
    const offset = (page - 1) * limit;

    // Base Where
    let { where } = getOrderFilters(queryParams);

    // Associations
    const include = [
        {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone'],
        },
        {
            model: OrderItem,
            as: 'items',
            attributes: ['menu_item_name', 'quantity', 'unit_type', 'unit_price', 'total_price'],
        }
    ];

    // Handle Fuzzy Search across associations
    if (search) {
        const searchLike = `%${search}%`;
        where[Op.or] = [
            { order_number: { [Op.like]: searchLike } },
            // Searching associations in top-level WHERE requires special handling or subqueries usually.
            // But Sequelize supports '$association.field$' syntax for joined where.
            { '$user.name$': { [Op.like]: searchLike } },
            { '$user.phone$': { [Op.like]: searchLike } },
            { '$items.menu_item_name$': { [Op.like]: searchLike } }
        ];
    }

    const { count, rows } = await Order.findAndCountAll({
        where,
        include,
        distinct: true, // Important for counts with Includes
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        subQuery: false // Needed for dollar sign queries on associations to work in WHERE
    });

    return {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        orders: rows
    };
};

const getOrdersCount = async (queryParams) => {
    let { where } = getOrderFilters(queryParams);
    // If search is present, we need strictly the same logic as getAllOrders to match counts
    // For simplicity, count endpoints often just filter by status/date.
    // If exact match needed including search:
    if (queryParams.search) {
        // Same logic as getAllOrders required, but let's stick to status/date for "Indicator" usually
        // If generic count with filters requested:
        const search = queryParams.search;
        const searchLike = `%${search}%`;
        const include = [
            { model: User, as: 'user', attributes: [] },
            { model: OrderItem, as: 'items', attributes: [] }
        ];
        where[Op.or] = [
            { order_number: { [Op.like]: searchLike } },
            { '$user.name$': { [Op.like]: searchLike } },
            { '$user.phone$': { [Op.like]: searchLike } },
            { '$items.menu_item_name$': { [Op.like]: searchLike } }
        ];
        return await Order.count({ where, include, distinct: true, subQuery: false });
    }

    return await Order.count({ where });
};

const getOrderById = async (id) => {
    const order = await Order.findByPk(id, {
        include: [
            {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'phone', 'avatar_url']
            },
            {
                model: OrderItem,
                as: 'items',
                include: [
                    {
                        model: MenuItem,
                        as: 'menu_item',
                        attributes: ['image_url', 'type_id', 'unit_type'] // Get image for display
                    }
                ]
            },
            {
                model: Payment,
                as: 'payment'
            }
        ]
    });

    if (!order) {
        throw new Error('Order not found');
    }

    // Fetch history manually to avoid modifying Order model relations if strictly forbidden
    // But ideally we should have established the relation. `OrderStatusHistory.findAll({ where: { order_id: id } })`
    const history = await OrderStatusHistory.findAll({
        where: { order_id: id },
        include: [{ model: User, as: 'changer', attributes: ['name', 'role'] }],
        order: [['created_at', 'DESC']]
    });

    // Address is stored as JSON snapshot in order.delivery_address_json
    // User might also have addresses, but the order one is the truth for this order.

    return {
        ...order.toJSON(),
        history
    };
};

const updateOrderStatus = async (id, status, userId, note) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(id, { transaction });
        if (!order) throw new Error('Order not found');

        // Validation of transitions can be done here logic wise
        // e.g. can't go from 'delivered' to 'pending'

        const oldStatus = order.status;

        await order.update({ status }, { transaction });

        // Create History
        await OrderStatusHistory.create({
            order_id: id,
            status: status,
            changed_by: userId,
            notes: note || `Status changed from ${oldStatus} to ${status}`
        }, { transaction });

        // Mock Notification - logic would go here
        // await createNotification(order.user_id, 'Order Update', `Your order ${order.order_number} is now ${status}`);

        await transaction.commit();
        return order;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateOrderDetails = async (id, updateData, userId) => {
    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(id, {
            include: [{ model: OrderItem, as: 'items' }],
            transaction
        });
        if (!order) throw new Error('Order not found');

        // Handle Item Updates
        if (updateData.items) {
            // Remove old items? Or smart update? 
            // "Editable: Items & quantities". Simplest is replace all or update specific.
            // Implementation: We will remove existing items and recreate them to ensure calculation is clean
            // OR strictly update quantities if IDs provided.

            // Let's go with: Delete all items for this order and Re-create (simplifies total calc)
            // BUT we must preserve menu_item data snapshots.

            await OrderItem.destroy({ where: { order_id: id }, transaction });

            let newSubtotal = 0;
            const newItems = updateData.items.map(item => {
                const total = parseFloat(item.quantity) * parseFloat(item.unit_price);
                newSubtotal += total;
                return {
                    id: item.id || undefined, // undefined to generate new UUID
                    order_id: id,
                    menu_item_id: item.menu_item_id,
                    menu_item_name: item.menu_item_name,
                    quantity: item.quantity,
                    unit_type: item.unit_type,
                    unit_price: item.unit_price,
                    total_price: total,
                    special_instructions: item.special_instructions
                };
            });

            await OrderItem.bulkCreate(newItems, { transaction });

            // Recalculate Order Totals
            // Update subtotal
            order.subtotal = newSubtotal;
            // Recalculate Tax/Delivery if logic exists. 
            // Promoting simple logic: Total = Subtotal + existing delivery + existing service + existing GST (maybe proportional?)
            // For now, let's keep delivery/service constant unless passed, and update total.
            order.total_amount = parseFloat(order.subtotal) + parseFloat(order.gst_amount) + parseFloat(order.delivery_charges) + parseFloat(order.service_charges);
        }

        if (updateData.special_instructions) {
            order.special_instructions = updateData.special_instructions;
        }

        // Audit Log usually goes here
        // We will add a history entry for "Edited Order"
        await OrderStatusHistory.create({
            order_id: id,
            status: order.status,
            changed_by: userId,
            notes: 'Order details updated by admin'
        }, { transaction });

        await order.save({ transaction });
        await transaction.commit();

        return await getOrderById(id); // Return full object
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const deleteOrder = async (id, userId) => {
    const order = await Order.findByPk(id);
    if (!order) throw new Error('Order not found');

    // Soft delete
    await order.destroy();

    // Log? Since it's paranoid, the record stays.
    // We can create a history entry before deleting if we want, but can't link to deleted order easily in standard queries unless paranoid=false
    // Just soft deleting is enough as per "Soft delete recommended"

    return { message: 'Order deleted successfully' };
};

module.exports = {
    getAllOrders,
    getOrdersCount,
    getOrderById,
    updateOrderStatus,
    updateOrderDetails,
    deleteOrder,
    generateOrderNumber,
    createOrder
};
