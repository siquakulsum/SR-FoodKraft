const Joi = require('joi');

const createMenuItemSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null).optional(),
    price: Joi.number().min(0).required(),
    category_id: Joi.string().uuid().required(),
    type_id: Joi.string().uuid().allow(null).optional(), // ProductType ID, optional?
    unit_type: Joi.string().default('piece'),
    min_order_qty: Joi.number().integer().min(1).default(1),
    max_order_qty: Joi.number().integer().min(1).allow(null).optional(),
    is_vegetarian: Joi.boolean().default(true), // Derived from "type" in req? Or passed explicitly
    is_available: Joi.boolean().default(true),
    preparation_time: Joi.number().integer().min(0).allow(null).optional(), // in minutes
    // image is handled by multer, validated as file existence
    stock_quantity: Joi.number().integer().min(0).allow(null).optional(),
    pre_order_time: Joi.number().integer().min(0).allow(null).optional(),
});

const updateMenuItemSchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().allow('', null).optional(),
    price: Joi.number().min(0).optional(),
    category_id: Joi.string().uuid().optional(),
    type_id: Joi.string().uuid().allow(null).optional(),
    unit_type: Joi.string().optional(),
    min_order_qty: Joi.number().integer().min(1).optional(),
    max_order_qty: Joi.number().integer().min(1).allow(null).optional(),
    is_vegetarian: Joi.boolean().optional(),
    is_available: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional(),
    stock_quantity: Joi.number().integer().min(0).allow(null).optional(),
    preparation_time: Joi.number().integer().min(0).allow(null).optional(),
    pre_order_time: Joi.number().integer().min(0).allow(null).optional(),
});

const listMenuItemsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('').optional(),
    category: Joi.string().uuid().optional(), // Category ID
    type: Joi.string().valid('veg', 'non-veg', 'egg').optional(), // Mapped to is_vegetarian maybe? Or string type? User says "type (Veg / Non-Veg / Egg)"
    available: Joi.boolean().optional(),
    sortBy: Joi.string().valid('name', 'price', 'created_at').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('desc')
});

module.exports = {
    createMenuItemSchema,
    updateMenuItemSchema,
    listMenuItemsSchema
};
