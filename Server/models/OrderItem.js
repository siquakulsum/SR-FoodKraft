const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OrderItem = sequelize.define('OrderItem', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        menu_item_id: {
            type: DataTypes.UUID,
            allowNull: true, // Nullable if item is deleted later, but snapshot preserved
        },
        menu_item_name: {
            type: DataTypes.STRING,
            allowNull: false, // Snapshot
        },
        quantity: {
            type: DataTypes.DECIMAL(10, 2), // Can be 1.5 kg
            allowNull: false,
        },
        unit_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        total_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        special_instructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'order_items',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    OrderItem.associate = (models) => {
        OrderItem.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
        OrderItem.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
    };

    return OrderItem;
};
