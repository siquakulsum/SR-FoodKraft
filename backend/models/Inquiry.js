const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Inquiry = sequelize.define('Inquiry', {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: false },
        event_date: { type: DataTypes.DATEONLY, allowNull: true },
        event_type: { type: DataTypes.STRING, allowNull: true },
        guest_count: { type: DataTypes.INTEGER, allowNull: true },
        message: { type: DataTypes.TEXT, allowNull: true },
        status: {
            type: DataTypes.ENUM('new', 'contacted', 'quoted', 'converted', 'closed'),
            defaultValue: 'new'
        },
        priority: {
            type: DataTypes.ENUM('low', 'medium', 'high'),
            defaultValue: 'medium'
        },
        assigned_to: { type: DataTypes.UUID, allowNull: true },
    }, { tableName: 'inquiries', timestamps: true, paranoid: true, underscored: true });

    return Inquiry;
};
