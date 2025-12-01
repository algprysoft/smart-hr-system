const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY, 
        allowNull: false
    },
    checkInTime: {
        type: DataTypes.TIME, 
        allowNull: true
    },
    checkOutTime: {
        type: DataTypes.TIME, 
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('present', 'absent', 'late'),
        defaultValue: 'present'
    },
    delayMinutes: {
        type: DataTypes.INTEGER,
        defaultValue: 0 
    },
    imagePath: {
        type: DataTypes.STRING, 
        allowNull: true
    }
});

module.exports = Attendance;
