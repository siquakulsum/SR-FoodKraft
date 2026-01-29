const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OfferUsage = sequelize.define('OfferUsage', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        offer_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        order_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        used_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'offer_usage',
        timestamps: true,
        updatedAt: false, // Usage record usually doesn't need update timestamp
        underscored: true,
    });

    OfferUsage.associate = (models) => {
        OfferUsage.belongsTo(models.Offer, { foreignKey: 'offer_id', as: 'offer' });
        OfferUsage.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return OfferUsage;
};
