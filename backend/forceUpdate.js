const sequelize = require('./src/config/database');

const forceUpdate = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ متصل بقاعدة البيانات.');

        // محاولة إضافة الأعمدة يدوياً (SQL مباشر)
        try {
            await sequelize.query("ALTER TABLE Companies ADD COLUMN absenceCheckTime VARCHAR(255) DEFAULT '10:00';");
            console.log("✅ تم إضافة عمود absenceCheckTime");
        } catch (e) { console.log("ℹ️ عمود absenceCheckTime موجود مسبقاً."); }

        try {
            await sequelize.query("ALTER TABLE Companies ADD COLUMN themeColor VARCHAR(255) DEFAULT '#3b82f6';");
            console.log("✅ تم إضافة عمود themeColor");
        } catch (e) { console.log("ℹ️ عمود themeColor موجود مسبقاً."); }

        try {
            await sequelize.query("ALTER TABLE Companies ADD COLUMN qrRefreshRate INTEGER DEFAULT 5000;");
            console.log("✅ تم إضافة عمود qrRefreshRate");
        } catch (e) { console.log("ℹ️ عمود qrRefreshRate موجود مسبقاً."); }

        console.log("🎉 تم تحديث هيكل قاعدة البيانات بنجاح!");
        process.exit();

    } catch (error) {
        console.error('❌ خطأ في الاتصال:', error);
        process.exit(1);
    }
};

forceUpdate();
