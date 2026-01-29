const { CMSBanner, CMSPage, CMSFAQ, CMSTestimonial, CMSSetting, MenuCategory, ProductType } = require('../models');

class CMSService {
    // Banners
    async getAllBanners(query = {}) {
        return await CMSBanner.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createBanner(data) {
        return await CMSBanner.create(data);
    }
    async updateBanner(id, data) {
        const banner = await CMSBanner.findByPk(id);
        if (!banner) throw new Error('Banner not found');
        return await banner.update(data);
    }
    async deleteBanner(id) {
        const banner = await CMSBanner.findByPk(id);
        if (!banner) throw new Error('Banner not found');
        return await banner.destroy();
    }

    // Pages
    async getAllPages(query = {}) {
        return await CMSPage.findAll({ where: query });
    }
    async getPageBySlug(slug) {
        return await CMSPage.findOne({ where: { slug } });
    }
    async createPage(data) {
        return await CMSPage.create(data);
    }
    async updatePage(id, data) {
        const page = await CMSPage.findByPk(id);
        if (!page) throw new Error('Page not found');
        return await page.update(data);
    }
    async deletePage(id) {
        const page = await CMSPage.findByPk(id);
        if (!page) throw new Error('Page not found');
        return await page.destroy();
    }

    // FAQs
    async getAllFAQs(query = {}) {
        return await CMSFAQ.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createFAQ(data) {
        return await CMSFAQ.create(data);
    }
    async updateFAQ(id, data) {
        const faq = await CMSFAQ.findByPk(id);
        if (!faq) throw new Error('FAQ not found');
        return await faq.update(data);
    }
    async deleteFAQ(id) {
        const faq = await CMSFAQ.findByPk(id);
        if (!faq) throw new Error('FAQ not found');
        return await faq.destroy();
    }

    // Testimonials
    async getAllTestimonials(query = {}) {
        return await CMSTestimonial.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createTestimonial(data) {
        return await CMSTestimonial.create(data);
    }
    async updateTestimonial(id, data) {
        const testimonial = await CMSTestimonial.findByPk(id);
        if (!testimonial) throw new Error('Testimonial not found');
        return await testimonial.update(data);
    }
    async deleteTestimonial(id) {
        const testimonial = await CMSTestimonial.findByPk(id);
        if (!testimonial) throw new Error('Testimonial not found');
        return await testimonial.destroy();
    }

    // Settings
    async getAllSettings() {
        return await CMSSetting.findAll();
    }
    async getSettingByKey(key) {
        return await CMSSetting.findOne({ where: { key } });
    }
    async updateSetting(key, value, type = 'text') {
        const [setting, created] = await CMSSetting.findOrCreate({
            where: { key },
            defaults: { value, key, type }
        });
        if (!created) {
            return await setting.update({ value, type });
        }
        return setting;
    }

    // Menu Categories
    async getAllCategories(query = {}) {
        return await MenuCategory.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createCategory(data) {
        return await MenuCategory.create(data);
    }
    async updateCategory(id, data) {
        const category = await MenuCategory.findByPk(id);
        if (!category) throw new Error('Category not found');
        return await category.update(data);
    }
    async deleteCategory(id) {
        const category = await MenuCategory.findByPk(id);
        if (!category) throw new Error('Category not found');
        return await category.destroy();
    }

    // Product Types
    async getAllProductTypes(query = {}) {
        return await ProductType.findAll({ where: query, order: [['display_order', 'ASC']] });
    }
    async createProductType(data) {
        return await ProductType.create(data);
    }
    async updateProductType(id, data) {
        const type = await ProductType.findByPk(id);
        if (!type) throw new Error('Product type not found');
        return await type.update(data);
    }
    async deleteProductType(id) {
        const type = await ProductType.findByPk(id);
        if (!type) throw new Error('Product type not found');
        return await type.destroy();
    }
}

module.exports = new CMSService();
