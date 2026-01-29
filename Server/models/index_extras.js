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
    }
};
