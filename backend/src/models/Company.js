const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    subscriptionPlan: { type: DataTypes.ENUM('free', 'pro', 'enterprise'), defaultValue: 'free' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    
    // الإعدادات
    companyLat: { type: DataTypes.FLOAT, defaultValue: 24.7136 },
    companyLng: { type: DataTypes.FLOAT, defaultValue: 46.6753 },
    allowedRadius: { type: DataTypes.INTEGER, defaultValue: 1000 },
    hourlyRate: { type: DataTypes.FLOAT, defaultValue: 50 },
    deductionPerMinute: { type: DataTypes.FLOAT, defaultValue: 1 },
    
    // الإيميل
    emailServiceActive: { type: DataTypes.BOOLEAN, defaultValue: false },
    senderEmail: { type: DataTypes.STRING, allowNull: true },
    senderPassword: { type: DataTypes.STRING, allowNull: true },
    adminEmail: { type: DataTypes.STRING, allowNull: true },
    absenceCheckTime: { type: DataTypes.STRING, defaultValue: "10:00" },
    qrRefreshRate: { type: DataTypes.INTEGER, defaultValue: 5000 },

    // ⬇️⬇️ الإضافة الجديدة (لون الهوية) ⬇️⬇️
    themeColor: { 
        type: DataTypes.STRING, 
        defaultValue: "#3b82f6" // اللون الأزرق الافتراضي
    }
});

module.exports = Company;
