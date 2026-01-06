'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Reviews
        await queryInterface.createTable('reviews', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            order_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'orders', key: 'id' }, onDelete: 'SET NULL' },
            menu_item_id: { type: Sequelize.UUID, allowNull: true, references: { model: 'menu_items', key: 'id' }, onDelete: 'CASCADE' },
            rating: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
            comment: { type: Sequelize.TEXT, allowNull: true },
            is_approved: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // Favorites
        await queryInterface.createTable('user_favorites', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            menu_item_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'menu_items', key: 'id' }, onDelete: 'CASCADE' },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
        });
        await queryInterface.addConstraint('user_favorites', {
            fields: ['user_id', 'menu_item_id'],
            type: 'unique',
            name: 'unique_user_favorite'
        });

        // Notifications
        await queryInterface.createTable('notifications', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
            type: { type: Sequelize.ENUM('order_update', 'promotion', 'system', 'welcome'), allowNull: false },
            title: { type: Sequelize.STRING, allowNull: false },
            message: { type: Sequelize.TEXT, allowNull: false },
            data: { type: Sequelize.JSON, allowNull: true },
            is_read: { type: Sequelize.BOOLEAN, defaultValue: false },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });

        // Inquiries
        await queryInterface.createTable('inquiries', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            name: { type: Sequelize.STRING, allowNull: false },
            email: { type: Sequelize.STRING, allowNull: false },
            phone: { type: Sequelize.STRING, allowNull: false },
            event_date: { type: Sequelize.DATEONLY, allowNull: true },
            event_type: { type: Sequelize.STRING, allowNull: true },
            guest_count: { type: Sequelize.INTEGER, allowNull: true },
            message: { type: Sequelize.TEXT, allowNull: true },
            status: { type: Sequelize.ENUM('new', 'contacted', 'quoted', 'converted', 'closed'), defaultValue: 'new' },
            priority: { type: Sequelize.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
            assigned_to: { type: Sequelize.UUID, allowNull: true, references: { model: 'users', key: 'id' } },
            created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            deleted_at: { type: Sequelize.DATE, allowNull: true },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('inquiries');
        await queryInterface.dropTable('notifications');
        await queryInterface.dropTable('user_favorites');
        await queryInterface.dropTable('reviews');
    },
};
