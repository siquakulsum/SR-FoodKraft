const { Offer, AuditLog, User } = require('../../models');
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
            // For numeric search, we might need casting, but simple LIKE is often enough for strings
            // If discount_value is needed in search, we can add it but requirement says "Search offers by code, discount value"
            { '$Offer.discount_value$': { [Op.like]: `%${search}%` } }
        ];
        // Note: searching decimal with LIKE might vary by DB dialect, usually works or cast needed. 
        // Safer to separate or just use code if numeric search is tricky, but let's try basic LIKE first.
    }

    if (status) { // Active/Inactive
        // Status checks might need mapping if frontend sends 'Active' string vs boolean
        if (status === 'Active') where.is_active = true;
        if (status === 'Inactive') where.is_active = false;
        // If query param is boolean string 'true'/'false'
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
    // Reusing logic for filter but only count
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
    // Validation is done in validator, but double check business logic if needed
    // Normalize code
    data.code = data.code.toUpperCase();

    const offer = await Offer.create(data);

    // Audit Log
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

    if (data.code) data.code = data.code.toUpperCase();

    const oldValues = { ...offer.toJSON() };
    await offer.update(data);

    // Audit Log
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

    // Auto-inactive if expired is handled by cron, but here we just toggle.
    // However, if user tries to activate an expired offer, we should probably prevent it?
    // User requirements: "Auto-inactive if expired" (Cron). "Update Status Rules: Toggle Active/Inactive".
    // Does not explicitly say "prevent activation if expired", but it implies logical consistency.
    // Let's add that check for safety.
    if (newStatus === true && offer.valid_to < new Date()) {
        throw new Error('Cannot activate an expired offer');
    }

    await offer.update({ is_active: newStatus });

    // Audit Log
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

    await offer.destroy(); // Soft delete because paranoid: true in model

    // Audit Log
    await AuditLog.create({
        user_id: adminId,
        action: 'DELETE_OFFER',
        target_type: 'OFFER',
        target_id: offer.id,
        details: { code: offer.code }
    });

    return { message: 'Offer deleted successfully' };
};

module.exports = {
    getOffers,
    getOffersCount,
    createOffer,
    updateOffer,
    updateOfferStatus,
    deleteOffer
};
