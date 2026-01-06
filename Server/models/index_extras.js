const { DataTypes } = require('sequelize');

module.exports = {
    // Favorites
    UserFavorite: (sequelize) => {
        const UserFavorite = sequelize.define('UserFavorite', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            user_id: { type: DataTypes.UUID, allowNull: false },
            menu_item_id: { type: DataTypes.UUID, allowNull: false },
        }, { tableName: 'user_favorites', timestamps: true, underscored: true });

        UserFavorite.associate = (models) => {
            UserFavorite.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
            UserFavorite.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
        };
        return UserFavorite;
    },

    // Notification
    Notification: (sequelize) => {
        return sequelize.define('Notification', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            user_id: { type: DataTypes.UUID, allowNull: false },
            type: { type: DataTypes.ENUM('order_update', 'promotion', 'system', 'welcome'), allowNull: false },
            title: { type: DataTypes.STRING, allowNull: false },
            message: { type: DataTypes.TEXT, allowNull: false },
            data: { type: DataTypes.JSON, allowNull: true },
            is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
        }, { tableName: 'notifications', timestamps: true, paranoid: true, underscored: true });
    },

    // CMS Banners
    CmsBanner: (sequelize) => {
        return sequelize.define('CmsBanner', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            title: { type: DataTypes.STRING, allowNull: false },
            subtitle: { type: DataTypes.STRING, allowNull: true },
            image_url: { type: DataTypes.STRING, allowNull: false },
            link_url: { type: DataTypes.STRING, allowNull: true },
            display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
            start_date: { type: DataTypes.DATE, allowNull: true },
            end_date: { type: DataTypes.DATE, allowNull: true },
        }, { tableName: 'cms_banners', timestamps: true, underscored: true });
    },

    // CMS Pages
    CmsPage: (sequelize) => {
        return sequelize.define('CmsPage', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            slug: { type: DataTypes.STRING, allowNull: false, unique: true },
            title: { type: DataTypes.STRING, allowNull: false },
            content: { type: DataTypes.TEXT, allowNull: false },
            meta_title: { type: DataTypes.STRING, allowNull: true },
            meta_description: { type: DataTypes.STRING, allowNull: true },
            is_published: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, { tableName: 'cms_pages', timestamps: true, underscored: true });
    },

    // CMS Testimonial
    CmsTestimonial: (sequelize) => {
        return sequelize.define('CmsTestimonial', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            client_name: { type: DataTypes.STRING, allowNull: false },
            client_company: { type: DataTypes.STRING, allowNull: true },
            content: { type: DataTypes.TEXT, allowNull: false },
            rating: { type: DataTypes.INTEGER, defaultValue: 5 },
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, { tableName: 'cms_testimonials', timestamps: true, underscored: true });
    },

    // CMS FAQ
    CmsFaq: (sequelize) => {
        return sequelize.define('CmsFaq', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            question: { type: DataTypes.STRING, allowNull: false },
            answer: { type: DataTypes.TEXT, allowNull: false },
            category: { type: DataTypes.STRING, allowNull: true },
            display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
            is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
        }, { tableName: 'cms_faqs', timestamps: true, underscored: true });
    },

    // CMS Setting
    CmsSetting: (sequelize) => {
        return sequelize.define('CmsSetting', {
            id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
            key: { type: DataTypes.STRING, allowNull: false, unique: true },
            value: { type: DataTypes.TEXT, allowNull: false },
            type: { type: DataTypes.STRING, defaultValue: 'text' },
        }, { tableName: 'cms_settings', timestamps: true, underscored: true });
    }
};
