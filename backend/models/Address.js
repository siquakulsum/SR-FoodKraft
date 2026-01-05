const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Address = sequelize.define('Address', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('home', 'office', 'other'),
            defaultValue: 'home',
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false, // Name associated with address
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        street: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        area: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        zip_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        door_no: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'addresses',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    Address.associate = (models) => {
        Address.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return Address;
};
