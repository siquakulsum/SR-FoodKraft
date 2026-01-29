const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const CMSTestimonial = sequelize.define('CMSTestimonial', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        client_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        client_company: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        client_image_url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        rating: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
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
        tableName: 'cms_testimonials',
        timestamps: true,
        paranoid: true,
        underscored: true,
    });

    return CMSTestimonial;
};
