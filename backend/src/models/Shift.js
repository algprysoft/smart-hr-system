const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shift = sequelize.define('Shift', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING, // مثال: "صباحي"، "مسائي"
        allowNull: false
    },
    startTime: {
        type: DataTypes.TIME, // مثال: "08:00:00"
        allowNull: false
    },
    endTime: {
        type: DataTypes.TIME, // مثال: "16:00:00"
        allowNull: false
    }
});

module.exports = Shift;
