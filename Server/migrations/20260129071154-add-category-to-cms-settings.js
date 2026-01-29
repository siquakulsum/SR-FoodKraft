'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableInfo = await queryInterface.describeTable('cms_settings');

    if (!tableInfo.category) {
      await queryInterface.addColumn('cms_settings', 'category', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!tableInfo.description) {
      await queryInterface.addColumn('cms_settings', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }

    if (!tableInfo.deleted_at) {
      await queryInterface.addColumn('cms_settings', 'deleted_at', {
        type: Sequelize.DATE,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('cms_settings', 'category');
    await queryInterface.removeColumn('cms_settings', 'description');
    await queryInterface.removeColumn('cms_settings', 'deleted_at');
  }
};
