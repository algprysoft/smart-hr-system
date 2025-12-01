const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leave = sequelize.define('Leave', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    startDate: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    reason: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'), 
        defaultValue: 'pending'
    },
    // ⬇️⬇️ الإضافة الجديدة ⬇️⬇️
    attachmentPath: {
        type: DataTypes.STRING, 
        allowNull: true
    }
});

module.exports = Leave;
