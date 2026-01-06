const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MenuCategory = sequelize.define('MenuCategory', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, {
        tableName: 'menu_categories',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    MenuCategory.associate = (models) => {
        MenuCategory.hasMany(models.MenuItem, { foreignKey: 'category_id', as: 'items' });
    };

    return MenuCategory;
};
