const { body } = require('express-validator');

const cmsValidator = {
    banner: [
        body('title').notEmpty().withMessage('Title is required'),
        body('image_url').notEmpty().withMessage('Image URL is required'),
        body('display_order').optional().isInt().withMessage('Display order must be an integer'),
        body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
    ],
    page: [
        body('title').notEmpty().withMessage('Title is required'),
        body('slug').notEmpty().withMessage('Slug is required'),
        body('content').notEmpty().withMessage('Content is required'),
        body('is_published').optional().isBoolean().withMessage('is_published must be a boolean'),
    ],
    faq: [
        body('question').notEmpty().withMessage('Question is required'),
        body('answer').notEmpty().withMessage('Answer is required'),
        body('category').optional().isString(),
        body('display_order').optional().isInt(),
        body('is_active').optional().isBoolean(),
    ],
    testimonial: [
        body('client_name').notEmpty().withMessage('Client name is required'),
        body('content').notEmpty().withMessage('Content is required'),
        body('rating').optional().isInt({ min: 1, max: 5 }),
        body('display_order').optional().isInt(),
        body('is_active').optional().isBoolean(),
    ],
    setting: [
        body('key').notEmpty().withMessage('Key is required'),
        body('value').custom(val => val !== undefined && val !== null && val !== '').withMessage('Value is required'),
        body('type').optional().isIn(['text', 'image', 'boolean', 'json', 'number', 'color']),
    ]
};

module.exports = cmsValidator;
