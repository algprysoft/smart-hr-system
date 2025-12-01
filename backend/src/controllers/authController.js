const User = require('../models/User');
const Company = require('../models/Company'); // <--- مودل الشركات
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createLog } = require('./logController');
const { sendEmail } = require('../utils/emailService');

// 🏢 تسجيل شركة جديدة (SaaS)
exports.registerCompany = async (req, res) => {
    try {
        const { companyName, adminName, email, password } = req.body;

        // 1. التحقق من وجود الإيميل مسبقاً
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "البريد الإلكتروني مسجل مسبقاً!" });
        }

        // 2. إنشاء الشركة
        const company = await Company.create({ name: companyName });

        // 3. إنشاء المدير وربطه بالشركة
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await User.create({
            name: adminName,
            email,
            password: hashedPassword,
            role: 'admin',
            companyId: company.id // 🔑 ربط المدير بالشركة
        });

        res.status(201).json({ message: "تم تسجيل الشركة بنجاح! 🏢", company, admin });
    } catch (error) {
        res.status(400).json({ message: "فشل التسجيل: " + error.message });
    }
};

// 🔐 تسجيل الدخول (مع حماية الجهاز)
exports.login = async (req, res) => {
    try {
        const { email, password, deviceId } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "كلمة المرور خطأ" });

        // 🛡️ فحص الجهاز (للموظفين فقط - يمكن تفعيله للكل)
        if (user.role === 'employee') {
            if (!user.trustedDeviceId) {
                user.trustedDeviceId = deviceId;
                await user.save();
            } 
            else if (user.trustedDeviceId !== deviceId) {
                // جهاز جديد -> أرسل OTP
                const otp = Math.floor(1000 + Math.random() * 9000).toString();
                user.otpCode = otp;
                user.otpExpires = new Date(Date.now() + 10 * 60000); // 10 دقائق
                await user.save();

                if (user.email) {
                    await sendEmail(
                        user.email,
                        "رمز التحقق (جهاز جديد)",
                        "⚠️ دخول من جهاز جديد",
                        `رمز التحقق: <strong>${otp}</strong>`,
                        'danger'
                    );
                }

                return res.status(403).json({ message: "جهاز جديد! تم إرسال الرمز", requireOtp: true, userId: user.id });
            }
        }

        // ✅ إنشاء التوكن (يحتوي على هوية الشركة)
        const token = jwt.sign({ 
            id: user.id, 
            role: user.role, 
            companyId: user.companyId // 🔑 هذا هو مفتاح العزل بين الشركات
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // تسجيل الحركة
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        // نمرر companyId للوج أيضاً لكي نسجل حركات الشركة
        await createLog(user.id, user.name, 'تسجيل دخول', 'دخول ناجح', ip, user.companyId);

        res.json({ message: "تم الدخول", token, user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ التحقق من OTP (واعتماد الجهاز الجديد)
exports.verifyOtp = async (req, res) => {
    try {
        const { userId, otp, deviceId } = req.body;
        const user = await User.findByPk(userId);

        if (!user || user.otpCode !== otp) {
            return res.status(400).json({ message: "الرمز غير صحيح!" });
        }

        if (new Date() > user.otpExpires) {
            return res.status(400).json({ message: "انتهت صلاحية الرمز" });
        }

        // اعتماد الجهاز
        user.trustedDeviceId = deviceId;
        user.otpCode = null;
        user.otpExpires = null;
        await user.save();

        const token = jwt.sign({ 
            id: user.id, 
            role: user.role, 
            companyId: user.companyId 
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: "تم اعتماد الجهاز!", token, user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
