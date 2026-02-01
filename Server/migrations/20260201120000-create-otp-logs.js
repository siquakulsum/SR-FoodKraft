'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('otp_logs', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
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
            otp_code: {
                type: Sequelize.STRING,
                allowNull: false
            },
            contact_type: {
                type: Sequelize.ENUM('email', 'phone'),
                allowNull: false
            },
            contact_value: {
                type: Sequelize.STRING,
                allowNull: false
            },
            expires_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            is_verified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });

        // Add index for faster lookups
        await queryInterface.addIndex('otp_logs', ['user_id', 'contact_value', 'is_verified']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('otp_logs');
    }
};
