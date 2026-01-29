const Joi = require('joi');

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^[0-9]+$/).min(10).max(15).optional(),
    avatar_url: Joi.string().allow(null, '').optional(),
});

const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }
    next();
};

module.exports = {
    updateProfile: validate(updateProfileSchema)
};
