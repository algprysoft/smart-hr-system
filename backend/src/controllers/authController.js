const User = require('../models/User');
const Company = require('../models/Company'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createLog } = require('./logController');

// ... (دوال registerCompany, login, verifyOtp الحالية انسخها كما هي من ردودي السابقة)
// سأركز هنا على دالة الإصلاح الشامل

exports.registerCompany = async (req, res) => { /* ... الكود السابق ... */ };
exports.login = async (req, res) => { /* ... الكود السابق ... */ };
exports.verifyOtp = async (req, res) => { /* ... الكود السابق ... */ };

// 🚀 دالة الإصلاح الشامل (The Fixer)
exports.resetSystem = async (req, res) => {
    try {
        // 1. حذف البيانات القديمة (اختياري، كن حذراً)
        // await User.destroy({ where: {}, truncate: true });
        // await Company.destroy({ where: {}, truncate: true });

        // 2. التأكد من وجود شركة
        let company = await Company.findByPk(1);
        if (!company) {
            company = await Company.create({
                id: 1,
                name: "الشركة النموذجية",
                subscriptionPlan: "enterprise",
                companyLat: 24.7136, companyLng: 46.6753, allowedRadius: 5000,
                hourlyRate: 50, deductionPerMinute: 1,
                absenceCheckTime: "10:00",
                qrRefreshRate: 5000,
                themeColor: "#3b82f6"
            });
        }

        // 3. التأكد من وجود مدير
        let admin = await User.findOne({ where: { email: "admin@system.com" } });
        if (!admin) {
            const hash = await bcrypt.hash("123456", 10);
            admin = await User.create({
                name: "المدير العام",
                email: "admin@system.com",
                password: hash,
                role: "admin",
                companyId: company.id
            });
        } else {
            // إصلاح المدير الموجود
            admin.companyId = company.id;
            admin.role = 'admin';
            await admin.save();
        }

        res.send(`
            <h1>✅ تم إصلاح النظام بنجاح</h1>
            <p>الشركة: ${company.name}</p>
            <p>المدير: admin@system.com</p>
            <p>كلمة المرور: 123456</p>
            <br>
            <h3>الآن عد للتطبيق وسجل الدخول وستظهر البيانات.</h3>
        `);

    } catch (error) {
        res.status(500).send("❌ خطأ: " + error.message);
    }
};
