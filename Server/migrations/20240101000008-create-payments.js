'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('payments', {
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
                onDelete: 'RESTRICT',
            },
            transaction_id: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            payment_method: {
                type: Sequelize.ENUM('card', 'upi', 'netbanking', 'cod'),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('pending', 'completed', 'failed', 'refunded'),
                defaultValue: 'pending',
            },
            provider: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            provider_response: {
                type: Sequelize.JSON,
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

        await queryInterface.addIndex('payments', ['order_id']);
        await queryInterface.addIndex('payments', ['transaction_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('payments');
    },
};
