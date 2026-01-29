const Joi = require('joi');

const validateAddPayment = (data) => {
    const schema = Joi.object({
        order_id: Joi.string().uuid().required(),
        amount: Joi.number().positive().precision(2).required(),
        payment_method: Joi.string().valid('cod', 'card', 'upi', 'netbanking').required(),
        transaction_id: Joi.string().optional(),
        provider: Joi.string().optional(),
        provider_response: Joi.object().optional(),
        status: Joi.string().valid('pending', 'completed', 'failed').default('completed')
    });
    return schema.validate(data);
};

const validateUpdatePayment = (data) => {
    const schema = Joi.object({
        status: Joi.string().valid('pending', 'completed', 'failed', 'refunded').required(),
        transaction_id: Joi.string().optional(),
        provider_response: Joi.object().optional()
    });
    return schema.validate(data);
};

module.exports = {
    validateAddPayment,
    validateUpdatePayment
};
