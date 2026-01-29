const cmsService = require('../services/cmsService');
const { validationResult } = require('express-validator');

class CMSController {
    // Banners
    async getBanners(req, res) {
        try {
            const banners = await cmsService.getAllBanners(req.query);
            res.json({ success: true, data: banners });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createBanner(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        try {
            const banner = await cmsService.createBanner(req.body);
            res.status(201).json({ success: true, data: banner });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateBanner(req, res) {
        try {
            const banner = await cmsService.updateBanner(req.params.id, req.body);
            res.json({ success: true, data: banner });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteBanner(req, res) {
        try {
            await cmsService.deleteBanner(req.params.id);
            res.json({ success: true, message: 'Banner deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Pages
    async getPages(req, res) {
        try {
            const pages = await cmsService.getAllPages(req.query);
            res.json({ success: true, data: pages });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createPage(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        try {
            const page = await cmsService.createPage(req.body);
            res.status(201).json({ success: true, data: page });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updatePage(req, res) {
        try {
            const page = await cmsService.updatePage(req.params.id, req.body);
            res.json({ success: true, data: page });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deletePage(req, res) {
        try {
            await cmsService.deletePage(req.params.id);
            res.json({ success: true, message: 'Page deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // FAQs
    async getFAQs(req, res) {
        try {
            const faqs = await cmsService.getAllFAQs(req.query);
            res.json({ success: true, data: faqs });
        } catch (error) {
            console.error('Error fetching FAQs:', error);
            res.status(500).json({ success: false, message: error.message, error: error.stack });
        }
    }

    async createFAQ(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        try {
            const faq = await cmsService.createFAQ(req.body);
            res.status(201).json({ success: true, data: faq });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateFAQ(req, res) {
        try {
            const faq = await cmsService.updateFAQ(req.params.id, req.body);
            res.json({ success: true, data: faq });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteFAQ(req, res) {
        try {
            await cmsService.deleteFAQ(req.params.id);
            res.json({ success: true, message: 'FAQ deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Testimonials
    async getTestimonials(req, res) {
        try {
            const testimonials = await cmsService.getAllTestimonials(req.query);
            res.json({ success: true, data: testimonials });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createTestimonial(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        try {
            const testimonial = await cmsService.createTestimonial(req.body);
            res.status(201).json({ success: true, data: testimonial });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateTestimonial(req, res) {
        try {
            const testimonial = await cmsService.updateTestimonial(req.params.id, req.body);
            res.json({ success: true, data: testimonial });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteTestimonial(req, res) {
        try {
            await cmsService.deleteTestimonial(req.params.id);
            res.json({ success: true, message: 'Testimonial deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Settings
    async getSettings(req, res) {
        try {
            const settings = await cmsService.getAllSettings();
            res.json({ success: true, data: settings });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateSetting(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
        try {
            const { key, value, type } = req.body;
            const setting = await cmsService.updateSetting(key, value, type);
            res.json({ success: true, data: setting });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Menu Categories
    async getCategories(req, res) {
        try {
            const categories = await cmsService.getAllCategories(req.query);
            res.json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createCategory(req, res) {
        try {
            const category = await cmsService.createCategory(req.body);
            res.status(201).json({ success: true, data: category });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateCategory(req, res) {
        try {
            const category = await cmsService.updateCategory(req.params.id, req.body);
            res.json({ success: true, data: category });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteCategory(req, res) {
        try {
            await cmsService.deleteCategory(req.params.id);
            res.json({ success: true, message: 'Category deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    // Product Types
    async getProductTypes(req, res) {
        try {
            const types = await cmsService.getAllProductTypes(req.query);
            res.json({ success: true, data: types });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createProductType(req, res) {
        try {
            const type = await cmsService.createProductType(req.body);
            res.status(201).json({ success: true, data: type });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async updateProductType(req, res) {
        try {
            const type = await cmsService.updateProductType(req.params.id, req.body);
            res.json({ success: true, data: type });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async deleteProductType(req, res) {
        try {
            await cmsService.deleteProductType(req.params.id);
            res.json({ success: true, message: 'Product type deleted successfully' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new CMSController();
