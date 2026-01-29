const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CMSBanner = sequelize.define('CMSBanner', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        subtitle: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        image_url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        link_url: {
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
        start_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'cms_banners',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    return CMSBanner;
};
