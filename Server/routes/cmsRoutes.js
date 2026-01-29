const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const cmsValidator = require('../validators/cmsValidator');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public routes
router.get('/banners', cmsController.getBanners);
router.get('/pages', cmsController.getPages);
router.get('/faqs', cmsController.getFAQs);
router.get('/testimonials', cmsController.getTestimonials);
router.get('/settings', cmsController.getSettings);
router.get('/categories', cmsController.getCategories);
router.get('/product-types', cmsController.getProductTypes);

// Admin only routes
router.use(protect);
router.use(authorize('admin'));

// Banners
router.post('/banners', cmsValidator.banner, cmsController.createBanner);
router.put('/banners/:id', cmsController.updateBanner);
router.delete('/banners/:id', cmsController.deleteBanner);

// Pages
router.post('/pages', cmsValidator.page, cmsController.createPage);
router.put('/pages/:id', cmsController.updatePage);
router.delete('/pages/:id', cmsController.deletePage);

// FAQs
router.post('/faqs', cmsValidator.faq, cmsController.createFAQ);
router.put('/faqs/:id', cmsController.updateFAQ);
router.delete('/faqs/:id', cmsController.deleteFAQ);

// Testimonials
router.post('/testimonials', cmsValidator.testimonial, cmsController.createTestimonial);
router.put('/testimonials/:id', cmsController.updateTestimonial);
router.delete('/testimonials/:id', cmsController.deleteTestimonial);

// Settings
router.post('/settings', cmsValidator.setting, cmsController.updateSetting);

// Categories
router.get('/categories', cmsController.getCategories);
router.post('/categories', cmsController.createCategory);
router.put('/categories/:id', cmsController.updateCategory);
router.delete('/categories/:id', cmsController.deleteCategory);

// Product Types
router.get('/product-types', cmsController.getProductTypes);
router.post('/product-types', cmsController.createProductType);
router.put('/product-types/:id', cmsController.updateProductType);
router.delete('/product-types/:id', cmsController.deleteProductType);

module.exports = router;
