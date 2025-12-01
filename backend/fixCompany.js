const sequelize = require('./src/config/database');
const Company = require('./src/models/Company');
const User = require('./src/models/User');

const fix = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true }); // تحديث الجداول أولاً

        // 1. إنشاء شركة افتراضية إذا لم توجد
        let company = await Company.findByPk(1);
        if (!company) {
            company = await Company.create({
                id: 1,
                name: "الشركة الرئيسية",
                subscriptionPlan: "enterprise",
                companyLat: 24.7136, 
                companyLng: 46.6753,
                allowedRadius: 1000,
                emailServiceActive: false
            });
            console.log("✅ تم إنشاء الشركة الافتراضية.");
        }

        // 2. ربط كل المستخدمين "اليتامى" بهذه الشركة
        const users = await User.findAll({ where: { companyId: null } });
        for (const user of users) {
            user.companyId = company.id;
            await user.save();
            console.log(`👤 تم ربط الموظف ${user.name} بالشركة.`);
        }

        console.log("🎉 تم إصلاح النظام بنجاح!");
        process.exit();

    } catch (error) {
        console.error("❌ خطأ:", error);
        process.exit(1);
    }
};

fix();
