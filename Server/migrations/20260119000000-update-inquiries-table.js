'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add quote_amount field
        await queryInterface.addColumn('inquiries', 'quote_amount', {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0
        });

        // Add notes field for internal notes
        await queryInterface.addColumn('inquiries', 'notes', {
            type: Sequelize.TEXT,
            allowNull: true
        });

        // Add indexes for performance optimization
        await queryInterface.addIndex('inquiries', ['status'], {
            name: 'inquiries_status_idx'
        });

        await queryInterface.addIndex('inquiries', ['priority'], {
            name: 'inquiries_priority_idx'
        });

        await queryInterface.addIndex('inquiries', ['created_at'], {
            name: 'inquiries_created_at_idx'
        });

        await queryInterface.addIndex('inquiries', ['email'], {
            name: 'inquiries_email_idx'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove indexes
        await queryInterface.removeIndex('inquiries', 'inquiries_email_idx');
        await queryInterface.removeIndex('inquiries', 'inquiries_created_at_idx');
        await queryInterface.removeIndex('inquiries', 'inquiries_priority_idx');
        await queryInterface.removeIndex('inquiries', 'inquiries_status_idx');

        // Remove columns
        await queryInterface.removeColumn('inquiries', 'notes');
        await queryInterface.removeColumn('inquiries', 'quote_amount');
    }
};
