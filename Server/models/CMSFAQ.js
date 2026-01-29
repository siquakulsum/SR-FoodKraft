const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CMSFAQ = sequelize.define('CMSFAQ', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        question: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
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
    }, {
        tableName: 'cms_faqs',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    return CMSFAQ;
};
