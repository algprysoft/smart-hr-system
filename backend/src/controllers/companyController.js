const Company = require('../models/Company');

// إنشاء شركة جديدة (للسوبر أدمن)
exports.createCompany = async (req, res) => {
    try {
        const { name, subscriptionPlan } = req.body;
        const company = await Company.create({ name, subscriptionPlan });
        res.status(201).json({ message: "تم إنشاء الشركة بنجاح 🏢", company });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// جلب جميع الشركات
exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.findAll();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// تحديث بيانات الشركة
exports.updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByPk(id);
        if (!company) return res.status(404).json({ message: "غير موجودة" });
        
        await company.update(req.body);
        res.json({ message: "تم التحديث" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
