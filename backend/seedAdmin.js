const sequelize = require('./src/config/database');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
    try {
        // 1. الاتصال بقاعدة البيانات
        await sequelize.authenticate();
        console.log('✅ متصل بقاعدة البيانات.');

        // 2. التحقق هل يوجد مدير مسبقاً؟
        const adminExists = await User.findOne({ where: { email: 'admin@system.com' } });
        if (adminExists) {
            console.log('⚠️ المدير موجود بالفعل!');
            process.exit();
        }

        // 3. تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash('123456', 10);

        // 4. إنشاء المدير
        await User.create({
            name: 'المدير العام',
            email: 'admin@system.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('🎉 تم إنشاء حساب المدير بنجاح!');
        console.log('Email: admin@system.com');
        console.log('Password: 123456');

    } catch (error) {
        console.error('❌ حدث خطأ:', error);
    } finally {
        // إغلاق الاتصال
        await sequelize.close();
    }
};

createAdmin();
