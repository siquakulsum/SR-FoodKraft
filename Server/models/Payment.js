const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Payment = sequelize.define('Payment', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        transaction_id: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        payment_method: {
            type: DataTypes.ENUM('card', 'upi', 'netbanking', 'cod', 'cash'),
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
            defaultValue: 'pending',
        },
        provider: {
            type: DataTypes.STRING, // e.g., 'razorpay'
            allowNull: true,
        },
        provider_response: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        tableName: 'payments',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    Payment.associate = (models) => {
        Payment.belongsTo(models.Order, { foreignKey: 'order_id', as: 'order' });
    };

    return Payment;
};
