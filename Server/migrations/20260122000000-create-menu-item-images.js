'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('menu_item_images', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4
            },
            menu_item_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'menu_items',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            image_url: {
                type: Sequelize.STRING,
                allowNull: false
            },
            display_order: {
                type: Sequelize.INTEGER,
                defaultValue: 0
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            deleted_at: {
                type: Sequelize.DATE
            }
        });

        // Add index for menu_item_id for performance
        await queryInterface.addIndex('menu_item_images', ['menu_item_id']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('menu_item_images');
    }
};
