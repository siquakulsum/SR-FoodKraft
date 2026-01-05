const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Review = sequelize.define('Review', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        user_id: { type: DataTypes.UUID, allowNull: false },
        order_id: { type: DataTypes.UUID, allowNull: true },
        menu_item_id: { type: DataTypes.UUID, allowNull: true },
        rating: { type: DataTypes.INTEGER, allowNull: false },
        comment: { type: DataTypes.TEXT, allowNull: true },
        is_approved: { type: DataTypes.BOOLEAN, defaultValue: true },
    }, { tableName: 'reviews', timestamps: true, paranoid: true, underscored: true });

    Review.associate = (models) => {
        Review.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Review.belongsTo(models.MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
    };

    return Review;
};
