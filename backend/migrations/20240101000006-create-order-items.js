'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('order_items', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            order_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'orders',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            menu_item_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'menu_items',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
            },
            menu_item_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            quantity: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            unit_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            unit_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            total_price: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            special_instructions: {
                type: Sequelize.TEXT,
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

        await queryInterface.addIndex('order_items', ['order_id']);
        await queryInterface.addIndex('order_items', ['menu_item_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('order_items');
    },
};
