const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CMSPage = sequelize.define('CMSPage', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        meta_title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        meta_description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        is_published: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'cms_pages',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    return CMSPage;
};
