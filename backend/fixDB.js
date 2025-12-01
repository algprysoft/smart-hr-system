const sequelize = require('./src/config/database');
const Company = require('./src/models/Company');

const fix = async () => {
    try {
        await sequelize.authenticate();
        // إجبار القاعدة على تحديث هيكل الجدول
        await Company.sync({ alter: true });
        
        // تحديث الشركة الأولى بقيم افتراضية
        const company = await Company.findByPk(1);
        if (company) {
            company.absenceCheckTime = "10:00";
            company.qrRefreshRate = 5000;
            company.hourlyRate = 50;
            company.deductionPerMinute = 1;
            await company.save();
            console.log("✅ تم إصلاح بيانات الشركة بنجاح!");
        } else {
            console.log("❌ لم يتم العثور على الشركة رقم 1");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
};

fix();
