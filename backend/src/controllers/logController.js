const Log = require('../models/Log');

// 1. دالة مساعدة لتسجيل أي حركة (سنستدعيها من الملفات الأخرى)
exports.createLog = async (userId, userName, action, details, ip = '-') => {
    try {
        await Log.create({ userId, userName, action, details, ipAddress: ip });
    } catch (error) {
        console.error("فشل تسجيل اللوج:", error);
    }
};

// 2. جلب جميع السجلات (لصفحة المدير)
exports.getAllLogs = async (req, res) => {
    try {
        const logs = await Log.findAll({
            order: [['createdAt', 'DESC']], // الأحدث أولاً
            limit: 100 // جلب آخر 100 حركة فقط لتخفيف الحمل
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
