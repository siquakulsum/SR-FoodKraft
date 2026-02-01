const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const OtpLog = sequelize.define('OtpLog', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        otp_code: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact_type: {
            type: DataTypes.ENUM('email', 'phone'),
            allowNull: false,
        },
        contact_value: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expires_at: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'otp_logs',
        timestamps: true,
        underscored: true,
    });

    return OtpLog;
};
