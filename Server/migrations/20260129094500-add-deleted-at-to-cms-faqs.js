'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Add deleted_at column to cms_faqs table for soft deletes
        await queryInterface.addColumn('cms_faqs', 'deleted_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('cms_faqs', 'deleted_at');
    },
};
