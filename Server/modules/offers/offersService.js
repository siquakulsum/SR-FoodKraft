const { Offer, AuditLog, OfferUsage } = require('../../models');
const { Op } = require('sequelize');

const getOffers = async (query) => {
    const {
        search,
        status,
        date_from,
        date_to,
        discount_type,
        page = 1,
        limit = 10
    } = query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
        where[Op.or] = [
            { code: { [Op.like]: `%${search}%` } },
            { '$Offer.discount_value$': { [Op.like]: `%${search}%` } }
        ];
    }

    if (status) { // Active/Inactive
        if (status === 'Active') where.is_active = true;
        if (status === 'Inactive') where.is_active = false;
        if (status === 'true') where.is_active = true;
        if (status === 'false') where.is_active = false;
    }

    if (date_from && date_to) {
        where.valid_from = { [Op.gte]: new Date(date_from) };
        where.valid_to = { [Op.lte]: new Date(date_to) };
    } else if (date_from) {
        where.valid_from = { [Op.gte]: new Date(date_from) };
    } else if (date_to) {
        where.valid_to = { [Op.lte]: new Date(date_to) };
    }

    if (discount_type) {
        where.discount_type = discount_type;
    }

    const { count, rows } = await Offer.findAndCountAll({
        where,
        offset: parseInt(offset),
        limit: parseInt(limit),
        order: [['created_at', 'DESC']],
    });

    return {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        data: rows
    };
};

const getOffersCount = async (query) => {
    const { search, status, date_from, date_to, discount_type } = query;
    const where = {};

    if (search) {
        where.code = { [Op.like]: `%${search}%` };
    }
    if (status) {
        if (status === 'Active' || status === 'true') where.is_active = true;
        if (status === 'Inactive' || status === 'false') where.is_active = false;
    }
    if (date_from && date_to) {
        where.valid_from = { [Op.gte]: new Date(date_from) };
        where.valid_to = { [Op.lte]: new Date(date_to) };
    }
    if (discount_type) where.discount_type = discount_type;

    return await Offer.count({ where });
};

const createOffer = async (data, adminId) => {
    data.code = data.code.toUpperCase();

    const offer = await Offer.create(data);

    await AuditLog.create({
        user_id: adminId,
        action: 'CREATE_OFFER',
        target_type: 'OFFER',
        target_id: offer.id,
        details: { code: offer.code }
    });

    return offer;
};

const updateOffer = async (id, data, adminId) => {
    const offer = await Offer.findByPk(id);
    if (!offer) throw new Error('Offer not found');

    // Security Fix: Prevent editing expired offers
    if (offer.valid_to < new Date()) {
        throw new Error('Cannot edit expired offer');
    }

    if (data.code) data.code = data.code.toUpperCase();

    const oldValues = { ...offer.toJSON() };
    await offer.update(data);

    await AuditLog.create({
        user_id: adminId,
        action: 'UPDATE_OFFER',
        target_type: 'OFFER',
        target_id: offer.id,
        details: { old: oldValues, new: data }
    });

    return offer;
};

const updateOfferStatus = async (id, adminId) => {
    const offer = await Offer.findByPk(id);
    if (!offer) throw new Error('Offer not found');

    const newStatus = !offer.is_active;

    if (newStatus === true && offer.valid_to < new Date()) {
        throw new Error('Cannot activate an expired offer');
    }

    await offer.update({ is_active: newStatus });

    await AuditLog.create({
        user_id: adminId,
        action: 'UPDATE_OFFER_STATUS',
        target_type: 'OFFER',
        target_id: offer.id,
        details: { status: newStatus ? 'Active' : 'Inactive' }
    });

    return offer;
};

const deleteOffer = async (id, adminId) => {
    const offer = await Offer.findByPk(id);
    if (!offer) throw new Error('Offer not found');

    // Data Consistency Fix: Check usage before deletion
    const usageCount = await OfferUsage.count({ where: { offer_id: id } });
    if (usageCount > 0) {
        throw new Error('Cannot delete offer that has been used. Deactivate it instead.');
    }

    await offer.destroy();

    await AuditLog.create({
        user_id: adminId,
        action: 'DELETE_OFFER',
        target_type: 'OFFER',
        target_id: offer.id,
        details: { code: offer.code }
    });

    return { message: 'Offer deleted successfully' };
};

// --- New Usage Limit Logic ---

/**
 * Validates if an offer can be applied for a specific user and cart value
 * @param {string} code - Offer code
 * @param {string} userId - ID of the user applying the offer
 * @param {number} orderAmount - Total amount of the order
 * @returns {Promise<Object>} - { valid: boolean, offer: Object, discountAmount: number }
 */
const validateOffer = async (code, userId, orderAmount) => {
    const offer = await Offer.findOne({ where: { code: code.toUpperCase() } });
    if (!offer) throw new Error('Invalid offer code');

    const now = new Date();

    // 1. Check Status & Dates
    if (!offer.is_active) throw new Error('Offer is inactive');
    if (now < offer.valid_from) throw new Error('Offer is not yet valid');
    if (now > offer.valid_to) throw new Error('Offer has expired');

    // 2. Check Min Order Amount
    if (offer.min_order_amount > 0 && orderAmount < offer.min_order_amount) {
        throw new Error(`Minimum order amount of ₹${offer.min_order_amount} required`);
    }

    // 3. Check Global Usage Limit
    if (offer.usage_limit !== null && offer.usage_count >= offer.usage_limit) {
        throw new Error('Offer usage limit exceeded');
    }

    // 4. Check Per-User Limit
    const userUsage = await OfferUsage.count({
        where: {
            offer_id: offer.id,
            user_id: userId
        }
    });

    if (offer.user_usage_limit !== null && userUsage >= offer.user_usage_limit) {
        throw new Error('You have already used this offer the maximum allowed times');
    }

    // Calculate Discount
    let discount = 0;
    if (offer.discount_type === 'percentage') {
        discount = (orderAmount * offer.discount_value) / 100;
        if (offer.max_discount_amount && discount > offer.max_discount_amount) {
            discount = offer.max_discount_amount;
        }
    } else {
        discount = offer.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    if (discount > orderAmount) discount = orderAmount;

    return { valid: true, offer, discountAmount: Number(discount).toFixed(2) };
};

/**
 * Tracks offer usage after a successful order
 * @param {string} offerId 
 * @param {string} userId 
 * @param {string} orderId 
 */
const trackUsage = async (offerId, userId, orderId) => {
    const offer = await Offer.findByPk(offerId);
    if (!offer) throw new Error('Offer not found');

    // Create Usage Record
    await OfferUsage.create({
        offer_id: offerId,
        user_id: userId,
        order_id: orderId,
        used_at: new Date()
    });

    // Increment Global Count (Atomic increment)
    await offer.increment('usage_count');
};

module.exports = {
    getOffers,
    getOffersCount,
    createOffer,
    updateOffer,
    updateOfferStatus,
    deleteOffer,
    validateOffer,
    trackUsage
};
