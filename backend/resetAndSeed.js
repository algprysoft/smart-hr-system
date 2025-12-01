const sequelize = require('./src/config/database');
const Company = require('./src/models/Company');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

// استيراد كل المودلز ليتعرف عليها النظام
require('./src/models/Attendance');
require('./src/models/Leave');
require('./src/models/Salary');
require('./src/models/Shift');
require('./src/models/Log');
require('./src/models/SystemSetting');
require('./src/models/Advance');
require('./src/models/Bonus');

const resetDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ تم الاتصال.');

        // 1. تعطيل فحص المفاتيح الأجنبية (الحيلة السحرية)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

        // 2. حذف الجداول وإعادة بنائها
        await sequelize.sync({ force: true });
        console.log('🗑️ تم تصفير قاعدة البيانات بنجاح.');

        // 3. إعادة تفعيل الفحص
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

        // 4. إنشاء الشركة الأولى
        const company = await Company.create({
            name: "الشركة الذهبية",
            subscriptionPlan: "enterprise",
            companyLat: 24.7136,
            companyLng: 46.6753,
            allowedRadius: 5000,
            emailServiceActive: false
        });

        // 5. إنشاء المدير
        const hashedPassword = await bcrypt.hash("123456", 10);
        const admin = await User.create({
            name: "المدير العام",
            email: "admin@system.com",
            password: hashedPassword,
            role: "admin",
            companyId: company.id
        });

        console.log('🎉 تم تجهيز النظام الجديد.');
        console.log('📧 admin@system.com / 123456');
        
        process.exit();

    } catch (error) {
        console.error('❌ خطأ:', error);
        process.exit(1);
    }
};

resetDB();
