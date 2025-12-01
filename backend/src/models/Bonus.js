const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bonus = sequelize.define('Bonus', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    companyId: { type: DataTypes.INTEGER, allowNull: false }, // 🔑
    amount: { type: DataTypes.FLOAT, allowNull: false },
    reason: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW }
});

module.exports = Bonus;
