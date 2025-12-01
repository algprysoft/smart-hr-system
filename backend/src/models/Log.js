const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Log = sequelize.define('Log', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true // قد يكون النظام هو من قام بالحركة
    },
    userName: {
        type: DataTypes.STRING, // نحفظ الاسم وقت الحركة (لأن الاسم قد يتغير لاحقاً)
        allowNull: true
    },
    action: {
        type: DataTypes.STRING, // مثال: "تسجيل دخول"، "حذف موظف"
        allowNull: false
    },
    details: {
        type: DataTypes.STRING, // تفاصيل إضافية
        allowNull: true
    },
    ipAddress: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Log;
