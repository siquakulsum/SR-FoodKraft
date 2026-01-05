const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ProductType = sequelize.define('ProductType', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        icon: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        display_order: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    }, {
        tableName: 'product_types',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    ProductType.associate = (models) => {
        ProductType.hasMany(models.MenuItem, { foreignKey: 'type_id', as: 'items' });
    };

    return ProductType;
};
