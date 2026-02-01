const { Inquiry, User, Order } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../models').sequelize;

// Helper function to map UI field names to DB field names
const mapFieldsToDb = (data) => {
    const mapped = { ...data };

    // Map full_name to name
    if (mapped.full_name) {
        mapped.name = mapped.full_name;
        delete mapped.full_name;
    }

    // Map additional_details to message
    if (mapped.additional_details !== undefined) {
        mapped.message = mapped.additional_details;
        delete mapped.additional_details;
    }

    return mapped;
};

// Helper function to map DB field names to UI field names
const mapFieldsToUi = (inquiry) => {
    if (!inquiry) return null;

    const data = inquiry.toJSON ? inquiry.toJSON() : inquiry;

    // Robust timestamp extraction
    // Check: 1. data properties (toJSON output)
    //        2. inquiry instance properties
    //        3. inquiry.dataValues (Sequelize internals)
    const createdAt = data.createdAt ||
        data.created_at ||
        inquiry.createdAt ||
        inquiry.created_at ||
        (inquiry.dataValues && inquiry.dataValues.createdAt) ||
        (inquiry.dataValues && inquiry.dataValues.created_at);

    const updatedAt = data.updatedAt ||
        data.updated_at ||
        inquiry.updatedAt ||
        inquiry.updated_at ||
        (inquiry.dataValues && inquiry.dataValues.updatedAt) ||
        (inquiry.dataValues && inquiry.dataValues.updated_at);

    return {
        ...data,
        full_name: data.name,
        additional_details: data.message,
        // Keep original fields for backward compatibility
        name: data.name,
        message: data.message,

        // preserve timestamps for export (normalized)
        createdAt: createdAt,
        updatedAt: updatedAt,
        // Also ensure snake_case variants exist
        created_at: createdAt,
        updated_at: updatedAt
    };
};

/**
 * Get dashboard statistics
 */
const getStatistics = async () => {
    const totalInquiries = await Inquiry.count();

    const newInquiries = await Inquiry.count({
        where: { status: 'new' }
    });

    const quotedInquiries = await Inquiry.count({
        where: {
            quote_amount: { [Op.gt]: 0 }
        }
    });

    const convertedInquiries = await Inquiry.count({
        where: { status: 'converted' }
    });

    // Calculate total quote value
    const totalQuoteResult = await Inquiry.findOne({
        attributes: [[sequelize.fn('SUM', sequelize.col('quote_amount')), 'total']],
        raw: true
    });

    const totalQuoteValue = parseFloat(totalQuoteResult?.total || 0);

    return {
        totalInquiries,
        newInquiries,
        quotedInquiries,
        convertedInquiries,
        totalQuoteValue
    };
};

/**
 * Find inquiries with filters, search, sorting, and pagination
 */
const findInquiries = async (filters) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        status,
        priority,
        sortBy = 'created_at',
        sortOrder = 'desc',
        date_start,
        date_end
    } = filters;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};

    // Status filter
    if (status) {
        where.status = status;
    }

    // Priority filter
    if (priority) {
        where.priority = priority;
    }

    // Date range filter
    if (date_start || date_end) {
        where.created_at = {};
        if (date_start) {
            where.created_at[Op.gte] = new Date(date_start);
        }
        if (date_end) {
            where.created_at[Op.lte] = new Date(date_end);
        }
    }

    // Search filter (name, email, phone, event_type)
    if (search) {
        const lowerSearch = search.toLowerCase();
        where[Op.or] = [
            sequelize.where(sequelize.fn('LOWER', sequelize.col('Inquiry.name')), 'LIKE', `%${lowerSearch}%`),
            sequelize.where(sequelize.fn('LOWER', sequelize.col('Inquiry.email')), 'LIKE', `%${lowerSearch}%`),
            { phone: { [Op.like]: `%${search}%` } }, // Phone is usually numeric, keep like
            sequelize.where(sequelize.fn('LOWER', sequelize.col('Inquiry.event_type')), 'LIKE', `%${lowerSearch}%`)
        ];
    }

    // Sorting
    const order = [[sortBy, sortOrder.toUpperCase()]];

    const { count, rows } = await Inquiry.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order,
        include: [
            {
                model: User,
                as: 'assignedUser',
                attributes: ['id', 'name', 'email'],
                required: false
            }
        ]
    });

    return {
        inquiries: rows.map(mapFieldsToUi),
        pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
        }
    };
};

/**
 * Create new inquiry
 */
const createInquiry = async (data) => {
    const mappedData = mapFieldsToDb(data);

    // Set default status if not provided
    if (!mappedData.status) {
        mappedData.status = 'new';
    }

    // Set default priority if not provided
    if (!mappedData.priority) {
        mappedData.priority = 'medium';
    }

    const inquiry = await Inquiry.create(mappedData);

    // Fetch with associations
    const createdInquiry = await Inquiry.findByPk(inquiry.id, {
        include: [
            {
                model: User,
                as: 'assignedUser',
                attributes: ['id', 'name', 'email'],
                required: false
            }
        ]
    });

    return mapFieldsToUi(createdInquiry);
};

/**
 * Get inquiry details by ID
 */
const getInquiryDetails = async (id) => {
    const inquiry = await Inquiry.findByPk(id, {
        include: [
            {
                model: User,
                as: 'assignedUser',
                attributes: ['id', 'name', 'email'],
                required: false
            }
        ]
    });

    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    return mapFieldsToUi(inquiry);
};

/**
 * Update inquiry
 */
const updateInquiry = async (id, data) => {
    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    const mappedData = mapFieldsToDb(data);

    await inquiry.update(mappedData);

    // Fetch updated inquiry with associations
    const updatedInquiry = await Inquiry.findByPk(id, {
        include: [
            {
                model: User,
                as: 'assignedUser',
                attributes: ['id', 'name', 'email'],
                required: false
            }
        ]
    });

    return mapFieldsToUi(updatedInquiry);
};

/**
 * Update inquiry status
 */
const updateInquiryStatus = async (id, status) => {
    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    await inquiry.update({ status });

    // Fetch updated inquiry
    const updatedInquiry = await Inquiry.findByPk(id, {
        include: [
            {
                model: User,
                as: 'assignedUser',
                attributes: ['id', 'name', 'email'],
                required: false
            }
        ]
    });

    return mapFieldsToUi(updatedInquiry);
};

/**
 * Update inquiry priority
 */
const updateInquiryPriority = async (id, priority) => {
    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    await inquiry.update({ priority });

    // Fetch updated inquiry
    const updatedInquiry = await Inquiry.findByPk(id, {
        include: [
            {
                model: User,
                as: 'assignedUser',
                attributes: ['id', 'name', 'email'],
                required: false
            }
        ]
    });

    return mapFieldsToUi(updatedInquiry);
};

/**
 * Soft delete inquiry
 */
const softDeleteInquiry = async (id) => {
    const inquiry = await Inquiry.findByPk(id);

    if (!inquiry) {
        throw new Error('Inquiry not found');
    }

    await inquiry.destroy(); // Soft delete (paranoid mode)

    return { message: 'Inquiry deleted successfully' };
};

/**
 * Export inquiries data
 */
const exportInquiriesData = async (filters) => {
    const { inquiries } = await findInquiries({ ...filters, limit: 10000, page: 1 });

    // Format data for export
    const exportData = inquiries.map(inquiry => ({
        'Inquiry ID': inquiry.id,
        'Name': inquiry.full_name,
        'Email': inquiry.email,
        'Phone': inquiry.phone,
        'Event Type': inquiry.event_type || 'N/A',
        'Event Date': inquiry.event_date || 'N/A',
        'Guest Count': inquiry.guest_count || 'N/A',
        'Status': inquiry.status,
        'Priority': inquiry.priority,
        'Quote Amount': inquiry.quote_amount || 0,
        'Assigned To': inquiry.assignedUser?.name || 'Unassigned',
        'Created At': inquiry.createdAt,
        'Updated At': inquiry.updatedAt

    }));

    return exportData;
};

module.exports = {
    getStatistics,
    findInquiries,
    createInquiry,
    getInquiryDetails,
    updateInquiry,
    updateInquiryStatus,
    updateInquiryPriority,
    softDeleteInquiry,
    exportInquiriesData
};
