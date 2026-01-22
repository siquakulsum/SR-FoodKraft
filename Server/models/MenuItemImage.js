const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MenuItemImage = sequelize.define('MenuItemImage', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        menu_item_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        tableName: 'menu_item_images',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    MenuItemImage.associate = (models) => {
        MenuItemImage.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
    };

    return MenuItemImage;
};
