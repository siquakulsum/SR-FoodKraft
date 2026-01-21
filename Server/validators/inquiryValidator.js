const Joi = require('joi');

const createInquirySchema = Joi.object({
    full_name: Joi.string().required(),
    name: Joi.string().optional(), // Allow both for compatibility
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).required(),
    event_type: Joi.string().valid('wedding', 'corporate', 'birthday', 'anniversary', 'private', 'other').optional(),
    event_date: Joi.date().optional(),
    guest_count: Joi.number().integer().min(1).optional(),
    additional_details: Joi.string().optional(),
    message: Joi.string().optional(), // Allow both for compatibility
    status: Joi.string().valid('new', 'contacted', 'quoted', 'converted', 'closed').default('new'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
    assigned_to: Joi.string().uuid().optional(),
    quote_amount: Joi.number().min(0).optional(),
    notes: Joi.string().optional()
});

const updateInquirySchema = Joi.object({
    full_name: Joi.string().optional(),
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).optional(),
    event_type: Joi.string().valid('wedding', 'corporate', 'birthday', 'anniversary', 'private', 'other').optional(),
    event_date: Joi.date().optional().allow(null),
    guest_count: Joi.number().integer().min(1).optional().allow(null),
    additional_details: Joi.string().optional().allow(null),
    message: Joi.string().optional().allow(null),
    status: Joi.string().valid('new', 'contacted', 'quoted', 'converted', 'closed').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    assigned_to: Joi.string().uuid().optional().allow(null),
    quote_amount: Joi.number().min(0).optional().allow(null),
    notes: Joi.string().optional().allow(null)
});

const updateStatusSchema = Joi.object({
    status: Joi.string().valid('new', 'contacted', 'quoted', 'converted', 'closed').required()
});

const updatePrioritySchema = Joi.object({
    priority: Joi.string().valid('low', 'medium', 'high').required()
});

const listInquiriesSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().optional().allow(''),
    status: Joi.string().valid('new', 'contacted', 'quoted', 'converted', 'closed').optional(),
    priority: Joi.string().valid('low', 'medium', 'high').optional(),
    sortBy: Joi.string().valid('created_at', 'updated_at', 'name', 'status', 'priority').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc'),
    date_start: Joi.date().optional(),
    date_end: Joi.date().optional()
});

module.exports = {
    createInquirySchema,
    updateInquirySchema,
    updateStatusSchema,
    updatePrioritySchema,
    listInquiriesSchema
};
