const Joi = require('joi');

const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).required(),
    role: Joi.string().valid('admin', 'customer', 'staff').default('customer')
});

const loginSchema = Joi.object({
    email: Joi.string().required(), // allowing email OR phone usually implies checking input type or just searching both
    password: Joi.string().required()
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

const resetPasswordSchema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
});

const updateProfileSchema = Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).optional(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).optional(),
    avatar_url: Joi.string().uri().optional()
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    updateProfileSchema,
    changePasswordSchema
};
