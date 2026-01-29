'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('audit_logs', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            target_type: {
                type: Sequelize.STRING,
                allowNull: false
            },
            target_id: {
                type: Sequelize.UUID,
                allowNull: true
            },
            details: {
                type: Sequelize.JSON,
                allowNull: true
            },
            ip_address: {
                type: Sequelize.STRING,
                allowNull: true
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('audit_logs');
    }
};
