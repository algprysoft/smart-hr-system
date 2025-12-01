const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SystemSetting = sequelize.define('SystemSetting', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    
    // الموقع
    companyLat: { type: DataTypes.FLOAT, defaultValue: 24.7136 },
    companyLng: { type: DataTypes.FLOAT, defaultValue: 46.6753 },
    allowedRadius: { type: DataTypes.INTEGER, defaultValue: 1000 },
    qrRefreshRate: { type: DataTypes.INTEGER, defaultValue: 5000 },
    
    // الرواتب
    hourlyRate: { type: DataTypes.FLOAT, defaultValue: 50 },
    deductionPerMinute: { type: DataTypes.FLOAT, defaultValue: 1 },

    // الإيميل
    emailServiceActive: { type: DataTypes.BOOLEAN, defaultValue: false },
    senderEmail: { type: DataTypes.STRING, allowNull: true },
    senderPassword: { type: DataTypes.STRING, allowNull: true },
    adminEmail: { type: DataTypes.STRING, allowNull: true },
    
    // ⏰ وقت فحص الغياب (الجديد)
    absenceCheckTime: { 
        type: DataTypes.STRING, 
        defaultValue: "10:00" 
    }
});

module.exports = SystemSetting;
