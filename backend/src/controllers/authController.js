const User = require('../models/User');
const Company = require('../models/Company'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createLog } = require('./logController');
const { sendEmail } = require('../utils/emailService');

exports.registerCompany = async (req, res) => {
    try {
        const { companyName, adminName, email, password } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: "البريد الإلكتروني مسجل مسبقاً!" });

        const company = await Company.create({ name: companyName });
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            name: adminName, email, password: hashedPassword, role: 'admin', companyId: company.id 
        });

        res.status(201).json({ message: "تم تسجيل الشركة بنجاح! 🏢", company, admin });
    } catch (error) { res.status(400).json({ message: "فشل التسجيل: " + error.message }); }
};

exports.login = async (req, res) => {
    try {
        const { email, password, deviceId } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "كلمة المرور خطأ" });

        if (user.role === 'employee') {
            if (!user.trustedDeviceId) {
                user.trustedDeviceId = deviceId;
                await user.save();
            } 
            else if (user.trustedDeviceId !== deviceId) {
                const otp = Math.floor(1000 + Math.random() * 9000).toString();
                user.otpCode = otp;
                user.otpExpires = new Date(Date.now() + 10 * 60000); 
                await user.save();

                if (user.email) {
                    await sendEmail(user.email, "رمز التحقق (جهاز جديد)", "⚠️ دخول من جهاز جديد", `رمز التحقق: <strong>${otp}</strong>`, 'danger');
                }
                return res.status(403).json({ message: "جهاز جديد! تم إرسال الرمز", requireOtp: true, userId: user.id });
            }
        }

        const token = jwt.sign({ id: user.id, role: user.role, companyId: user.companyId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        await createLog(user.id, user.name, 'تسجيل دخول', 'دخول ناجح', ip, user.companyId);

        res.json({ message: "تم الدخول", token, user });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp, deviceId } = req.body;
        const user = await User.findByPk(userId);
        if (!user || user.otpCode !== otp) return res.status(400).json({ message: "الرمز غير صحيح!" });
        if (new Date() > user.otpExpires) return res.status(400).json({ message: "انتهت صلاحية الرمز" });

        user.trustedDeviceId = deviceId;
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign({ id: user.id, role: user.role, companyId: user.companyId }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ message: "تم اعتماد الجهاز!", token, user });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// 🚀 دالة الطوارئ لإنشاء المدير في السيرفر الجديد
exports.setupSystem = async (req, res) => {
    try {
        // 1. إنشاء الشركة إذا لم توجد
        let company = await Company.findByPk(1);
        if (!company) {
            company = await Company.create({
                id: 1,
                name: "الشركة الرئيسية",
                subscriptionPlan: "enterprise",
                companyLat: 24.7136, companyLng: 46.6753, allowedRadius: 5000,
                hourlyRate: 50, deductionPerMinute: 1,
                emailServiceActive: false,
                absenceCheckTime: "10:00",
                qrRefreshRate: 5000,
                themeColor: "#3b82f6"
            });
        }

        // 2. إنشاء المدير إذا لم يوجد
        const adminEmail = "admin@system.com";
        let admin = await User.findOne({ where: { email: adminEmail } });
        
        if (!admin) {
            const hashedPassword = await bcrypt.hash("123456", 10);
            admin = await User.create({
                name: "المدير العام",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                companyId: company.id
            });
            res.send("<h1>✅ تم إنشاء حساب المدير والشركة بنجاح!</h1><p>Email: admin@system.com<br>Pass: 123456</p>");
        } else {
            res.send("<h1>ℹ️ الحساب موجود مسبقاً!</h1>");
        }

    } catch (error) {
        res.status(500).send("❌ حدث خطأ: " + error.message);
    }
};
