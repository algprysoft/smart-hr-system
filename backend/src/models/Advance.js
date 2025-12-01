const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Advance = sequelize.define('Advance', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: false }, // 🔑
    amount: { type: DataTypes.FLOAT, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'paid'), defaultValue: 'pending' },
    requestDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
});

module.exports = Advance;
