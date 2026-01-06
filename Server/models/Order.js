const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Order = sequelize.define('Order', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        order_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'),
            defaultValue: 'pending',
        },
        order_type: {
            type: DataTypes.ENUM('pickup', 'delivery'),
            defaultValue: 'delivery',
        },
        delivery_address_json: {
            type: DataTypes.JSON, // Storing snapshot of address
            allowNull: false,
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        gst_amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        delivery_charges: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        service_charges: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        event_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        event_time: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        special_instructions: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        payment_status: {
            type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
            defaultValue: 'pending',
        },
        payment_method: {
            type: DataTypes.ENUM('card', 'upi', 'netbanking', 'cod'),
            allowNull: true,
        },
    }, {
        tableName: 'orders',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    Order.associate = (models) => {
        Order.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Order.hasMany(models.OrderItem, { foreignKey: 'order_id', as: 'items' });
        Order.hasOne(models.Payment, { foreignKey: 'order_id', as: 'payment' });
        Order.hasOne(models.Review, { foreignKey: 'order_id', as: 'review' });
    };

    return Order;
};
