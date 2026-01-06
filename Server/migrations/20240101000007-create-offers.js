'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('offers', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            code: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            discount_type: {
                type: Sequelize.ENUM('percentage', 'fixed'),
                allowNull: false,
            },
            discount_value: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            valid_from: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            valid_to: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            is_active: {
                type: Sequelize.BOOLEAN,
                defaultValue: true,
            },
            min_order_amount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            max_discount_amount: {
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

        await queryInterface.addIndex('offers', ['code']);
        await queryInterface.addIndex('offers', ['is_active']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('offers');
    },
};
