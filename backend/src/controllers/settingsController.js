const Company = require('../models/Company');

exports.getSettings = async (req, res) => {
    try {
        // التأكد من وجود معرف الشركة في التوكن
        if (!req.user || !req.user.companyId) {
            return res.status(400).json({ message: "بيانات الاعتماد غير صالحة" });
        }

        const settings = await Company.findByPk(req.user.companyId);
        
        if (!settings) {
            return res.status(404).json({ message: "لم يتم العثور على بيانات الشركة" });
        }
        
        res.json(settings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const settings = await Company.findByPk(companyId);
        
        if (!settings) {
            return res.status(404).json({ message: "الشركة غير موجودة" });
        }

        // تحديث البيانات
        await settings.update(req.body);
        
        res.json({ message: "تم تحديث الإعدادات بنجاح ✅", settings });
    } catch (error) {
        console.error("Settings Update Error:", error);
        res.status(500).json({ message: "فشل التحديث: " + error.message });
    }
};
