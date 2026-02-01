'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            await queryInterface.addColumn('offers', 'usage_limit', {
                type: Sequelize.INTEGER,
                allowNull: true,
                comment: 'Total number of times this offer can be used globally'
            });
        } catch (e) {
            console.log('Column usage_limit might already exist');
        }

        try {
            await queryInterface.addColumn('offers', 'usage_count', {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                comment: 'Current total usage count'
            });
        } catch (e) {
            console.log('Column usage_count might already exist');
        }

        try {
            await queryInterface.addColumn('offers', 'user_usage_limit', {
                type: Sequelize.INTEGER,
                defaultValue: 1,
                comment: 'Max times a single user can use this offer'
            });
        } catch (e) {
            console.log('Column user_usage_limit might already exist');
        }
    },

    down: async (queryInterface, Sequelize) => {
        try { await queryInterface.removeColumn('offers', 'usage_limit'); } catch (e) { }
        try { await queryInterface.removeColumn('offers', 'usage_count'); } catch (e) { }
        try { await queryInterface.removeColumn('offers', 'user_usage_limit'); } catch (e) { }
    }
};
