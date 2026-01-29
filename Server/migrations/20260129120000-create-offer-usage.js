'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('offer_usage', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            offer_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'offers',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            order_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: { // Assuming orders table exists and we want to link
                    model: 'orders',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            used_at: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            created_at: { // Sequelize usually expects this even if I turned it off in model, but I'll add it for consistency
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            }
        });

        await queryInterface.addIndex('offer_usage', ['offer_id']);
        await queryInterface.addIndex('offer_usage', ['user_id']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('offer_usage');
    },
};
