const Joi = require('joi');

const createCustomerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).required(),
    status: Joi.string().valid('active', 'blocked').default('active'), // Assuming these are valid statuses based on User model is_blocked/is_active
    password: Joi.string().min(6).optional() // Optional for admin creation, might generate one? Or require it. Requirement said "Optional OTP flow", implying password might not be set initially or auto-generated. Let's make it optional and handle in service.
});

const updateCustomerSchema = Joi.object({
    name: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).optional(),
    is_active: Joi.boolean().optional(),
    is_blocked: Joi.boolean().optional()
});

const listCustomersSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().optional().allow(''),
    status: Joi.string().valid('active', 'blocked', 'all').optional(), // Filter by status
    sortBy: Joi.string().valid('name', 'created_at', 'last_login_at').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc')
});

const blockCustomerSchema = Joi.object({
    reason: Joi.string().required() // "Log reason" is required
});

const sendMessageSchema = Joi.object({
    customerIds: Joi.array().items(Joi.string().uuid()).required(),
    message: Joi.string().required(),
    type: Joi.string().valid('sms', 'email').required()
});

module.exports = {
    createCustomerSchema,
    updateCustomerSchema,
    listCustomersSchema,
    blockCustomerSchema,
    sendMessageSchema
};
