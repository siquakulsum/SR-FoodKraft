'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('orders', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT', // Don't delete orders if user is deleted (preserve history)
            },
            order_number: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            status: {
                type: Sequelize.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
                defaultValue: 'pending',
            },
            order_type: {
                type: Sequelize.ENUM('pickup', 'delivery'),
                defaultValue: 'delivery',
            },
            delivery_address_json: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            total_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            subtotal: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
            },
            gst_amount: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            delivery_charges: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            service_charges: {
                type: Sequelize.DECIMAL(10, 2),
                defaultValue: 0,
            },
            event_date: {
                type: Sequelize.DATEONLY,
                allowNull: false,
            },
            event_time: {
                type: Sequelize.TIME,
                allowNull: false,
            },
            special_instructions: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            payment_status: {
                type: Sequelize.ENUM('pending', 'paid', 'failed', 'refunded'),
                defaultValue: 'pending',
            },
            payment_method: {
                type: Sequelize.ENUM('card', 'upi', 'netbanking', 'cod'),
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

        await queryInterface.addIndex('orders', ['user_id']);
        await queryInterface.addIndex('orders', ['order_number']);
        await queryInterface.addIndex('orders', ['status']);
        await queryInterface.addIndex('orders', ['event_date']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('orders');
    },
};
