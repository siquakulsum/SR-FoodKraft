const Joi = require('joi');

const orderSearchSchema = Joi.object({
    search: Joi.string().allow('').optional(),
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled').optional(),
    type: Joi.string().valid('pickup', 'delivery').optional(),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional()
});

const updateOrderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled').required(),
    note: Joi.string().optional().allow(''),
});

const updateOrderDetailsSchema = Joi.object({
    special_instructions: Joi.string().optional().allow(''),
    items: Joi.array().items(
        Joi.object({
            id: Joi.string().uuid().optional(), // If existing item
            menu_item_id: Joi.string().uuid().required(),
            menu_item_name: Joi.string().required(),
            quantity: Joi.number().min(0.01).required(),
            unit_type: Joi.string().required(),
            unit_price: Joi.number().min(0).required(),
            special_instructions: Joi.string().optional().allow(''),
        })
    ).optional(),
    delivery_date: Joi.date().iso().optional(),
    delivery_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
});

const createOrderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            menu_item_id: Joi.string().uuid().required(),
            menu_item_name: Joi.string().required(),
            quantity: Joi.number().min(0.01).required(),
            unit_type: Joi.string().required(),
            unit_price: Joi.number().min(0).required(),
            special_instructions: Joi.string().optional().allow('')
        })
    ).min(1).required(),
    offer_code: Joi.string().optional().allow(''),
    delivery_date: Joi.date().iso().optional(),
    delivery_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
    special_instructions: Joi.string().optional().allow(''),
    order_type: Joi.string().valid('pickup', 'delivery').required(),
    delivery_address_id: Joi.string().uuid().when('order_type', { is: 'delivery', then: Joi.required(), otherwise: Joi.optional() }),
    payment_method: Joi.string().valid('cash', 'card', 'upi').required() // Basic payment method validation
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.query.search ? req.query : req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors: error.details.map((detail) => detail.message),
        });
    }
    next();
};

module.exports = {
    validateOrderSearch: (req, res, next) => {
        const { error } = orderSearchSchema.validate(req.query, { abortEarly: false });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: error.details.map((detail) => detail.message),
            });
        }
        next();
    },
    validateStatusUpdate: validate(updateOrderStatusSchema),
    validateOrderUpdate: validate(updateOrderDetailsSchema),
    validateCreateOrder: validate(createOrderSchema)
};
