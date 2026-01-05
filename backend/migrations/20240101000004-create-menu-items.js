'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('menu_items', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            category_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'menu_categories',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            type_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'product_types',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            unit_type: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: 'piece',
            },
            min_order_qty: {
                type: Sequelize.INTEGER,
                defaultValue: 1,
            },
            max_order_qty: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            image_url: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            is_vegetarian: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            is_available: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            is_featured: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            featured_priority: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            stock_quantity: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            preparation_time: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            pre_order_time: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            offer_code: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            offer_discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed'),
                allowNull: true,
            },
            offer_discount_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            discounted_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            deleted_at: {
                type: Sequelize.DATE,
                allowNull: true,
            },
        });

        await queryInterface.addIndex('menu_items', ['category_id']);
        await queryInterface.addIndex('menu_items', ['type_id']);
        await queryInterface.addIndex('menu_items', ['is_available']);
        await queryInterface.addIndex('menu_items', ['is_featured']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('menu_items');
    },
};
