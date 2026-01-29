'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // CMS Banners
        await queryInterface.createTable('cms_banners', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            title: { type: Sequelize.STRING, allowNull: false },
            subtitle: { type: Sequelize.STRING, allowNull: true },
            image_url: { type: Sequelize.STRING, allowNull: false },
            link_url: { type: Sequelize.STRING, allowNull: true },
            display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            start_date: { type: Sequelize.DATE, allowNull: true },
            end_date: { type: Sequelize.DATE, allowNull: true },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // CMS Pages
        await queryInterface.createTable('cms_pages', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            title: { type: Sequelize.STRING, allowNull: false },
            slug: { type: Sequelize.STRING, allowNull: false, unique: true },
            content: { type: Sequelize.TEXT('long'), allowNull: false },
            meta_title: { type: Sequelize.STRING, allowNull: true },
            meta_description: { type: Sequelize.STRING, allowNull: true },
            is_published: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // CMS FAQs
        await queryInterface.createTable('cms_faqs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            question: { type: Sequelize.STRING, allowNull: false },
            answer: { type: Sequelize.TEXT, allowNull: false },
            category: { type: Sequelize.STRING, allowNull: true },
            display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // CMS Testimonials
        await queryInterface.createTable('cms_testimonials', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            client_name: { type: Sequelize.STRING, allowNull: false },
            client_company: { type: Sequelize.STRING, allowNull: true },
            client_image_url: { type: Sequelize.STRING, allowNull: true },
            content: { type: Sequelize.TEXT, allowNull: false },
            rating: { type: Sequelize.INTEGER, defaultValue: 5 },
            display_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // CMS Settings
        await queryInterface.createTable('cms_settings', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            key: { type: Sequelize.STRING, allowNull: false, unique: true },
            value: { type: Sequelize.TEXT, allowNull: false },
            type: { type: Sequelize.STRING, defaultValue: 'text' }, // text, image, boolean, json
            description: { type: Sequelize.TEXT, allowNull: true },
            category: { type: Sequelize.STRING, allowNull: true },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('cms_settings');
        await queryInterface.dropTable('cms_testimonials');
        await queryInterface.dropTable('cms_faqs');
        await queryInterface.dropTable('cms_pages');
        await queryInterface.dropTable('cms_banners');
    },
};
