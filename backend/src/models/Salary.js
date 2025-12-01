const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Salary = sequelize.define('Salary', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    month: {
        type: DataTypes.INTEGER, // شهر 1, 2, 3...
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER, // سنة 2025...
        allowNull: false
    },
    totalHours: {
        type: DataTypes.FLOAT, // عدد الساعات المحسوبة
        defaultValue: 0.0
    },
    amount: {
        type: DataTypes.FLOAT, // المبلغ النهائي
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid'), // معلق، مدفوع
        defaultValue: 'pending'
    }
});

module.exports = Salary;
