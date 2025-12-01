const sequelize = require('./src/config/database');
const Company = require('./src/models/Company');
const User = require('./src/models/User');

const fixFinal = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ متصل بالقاعدة");
        
        // 1. تحديث الجداول
        await sequelize.sync({ alter: true });
        console.log("✅ تم تحديث الجداول");

        // 2. التأكد من وجود شركة
        let company = await Company.findByPk(1);
        if (!company) {
            company = await Company.create({
                id: 1,
                name: "الشركة الرئيسية",
                subscriptionPlan: "enterprise",
                companyLat: 24.7136, companyLng: 46.6753, allowedRadius: 1000,
                hourlyRate: 50, deductionPerMinute: 1,
                emailServiceActive: false,
                absenceCheckTime: "10:00",
                qrRefreshRate: 5000,
                themeColor: "#3b82f6"
            });
            console.log("✅ تم إنشاء الشركة");
        }

        // 3. ربط المدير بالشركة
        const admin = await User.findOne({ where: { email: 'admin@system.com' } });
        if (admin) {
            admin.companyId = company.id;
            await admin.save();
            console.log("✅ تم ربط المدير بالشركة");
        } else {
            console.log("⚠️ لم يتم العثور على حساب admin@system.com");
        }

        process.exit();
    } catch (e) {
        console.error("❌ خطأ:", e);
        process.exit(1);
    }
};

fixFinal();
