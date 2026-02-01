const Joi = require('joi');

const createOfferSchema = Joi.object({
    code: Joi.string().required().uppercase().trim(),
    discount_type: Joi.string().valid('percentage', 'fixed').required(),
    discount_value: Joi.number().positive().required(),
    valid_from: Joi.date().iso().required(),
    valid_to: Joi.date().iso().greater(Joi.ref('valid_from')).required(),
    min_order_amount: Joi.number().min(0).optional(),
    max_discount_amount: Joi.number().min(0).allow(null, '').optional(),
    usage_limit: Joi.number().integer().positive().optional(),
    user_usage_limit: Joi.number().integer().positive().default(1),
    is_active: Joi.boolean().optional(),
});

const updateOfferSchema = Joi.object({
    code: Joi.string().uppercase().trim().optional(),
    discount_type: Joi.string().valid('percentage', 'fixed').optional(),
    discount_value: Joi.number().positive().optional(),
    valid_from: Joi.date().iso().optional(),
    valid_to: Joi.date().iso().greater(Joi.ref('valid_from')).optional(),
    min_order_amount: Joi.number().min(0).optional(),
    max_discount_amount: Joi.number().min(0).allow(null, '').optional(),
    usage_limit: Joi.number().integer().positive().optional(),
    user_usage_limit: Joi.number().integer().positive().optional(),
    is_active: Joi.boolean().optional(),
});

const updateStatusSchema = Joi.object({
    is_active: Joi.boolean().required(),
});

module.exports = {
    createOfferSchema,
    updateOfferSchema,
    updateStatusSchema,
};
