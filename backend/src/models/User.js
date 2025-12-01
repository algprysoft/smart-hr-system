const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
    // ... (نفس الأعمدة السابقة) ...
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true }, // الإيميل فريد عالمياً
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('super_admin', 'admin', 'hr', 'employee'), defaultValue: 'employee' }, // أضفنا super_admin
    
    // ... (باقي الأعمدة الشخصية والحماية كما هي) ...
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.STRING, allowNull: true },
    age: { type: DataTypes.INTEGER, allowNull: true },
    cvPath: { type: DataTypes.STRING, allowNull: true },
    profilePic: { type: DataTypes.STRING, allowNull: true },
    trustedDeviceId: { type: DataTypes.STRING, allowNull: true },
    otpCode: { type: DataTypes.STRING, allowNull: true },
    otpExpires: { type: DataTypes.DATE, allowNull: true },
    shiftId: { type: DataTypes.INTEGER, allowNull: true },

    // ⬇️⬇️ الإضافة الجوهرية ⬇️⬇️
    companyId: { type: DataTypes.INTEGER, allowNull: true } // null فقط للـ Super Admin
});

module.exports = User;
