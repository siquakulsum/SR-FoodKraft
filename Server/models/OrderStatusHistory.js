const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
            allowNull: false,
        },
        changed_by: {
            type: DataTypes.UUID,
            allowNull: true, // Nullable because system updates might not have a user
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'order_status_history',
        timestamps: true, // created_at serves as the history timestamp
        underscored: true,
    });

    OrderStatusHistory.associate = (models) => {
        OrderStatusHistory.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
        OrderStatusHistory.belongsTo(models.User, { foreignKey: 'changed_by', as: 'changer' });
    };

    return OrderStatusHistory;
};
