const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Offer = sequelize.define('Offer', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        discount_type: {
            type: DataTypes.ENUM('percentage', 'fixed'),
            allowNull: false,
        },
        discount_value: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        valid_from: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        valid_to: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        min_order_amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        max_discount_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        usage_limit: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Total number of times this offer can be used globally'
        },
        usage_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            comment: 'Current total usage count'
        },
        user_usage_limit: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            comment: 'Max times a single user can use this offer'
        },
    }, {
        tableName: 'offers',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    return Offer;
};
