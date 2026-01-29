const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CMSSetting = sequelize.define('CMSSetting', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            defaultValue: 'text',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'cms_settings',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    return CMSSetting;
};
