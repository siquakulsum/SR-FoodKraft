const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        action: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        target_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        target_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        details: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        ip_address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        tableName: 'audit_logs',
        timestamps: true,
        underscored: true,
    });

    AuditLog.associate = (models) => {
        AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return AuditLog;
};
