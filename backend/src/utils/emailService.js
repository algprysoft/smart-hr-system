const nodemailer = require('nodemailer');
const SystemSetting = require('../models/SystemSetting');

const getHtmlTemplate = (title, message, color) => `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; direction: rtl; text-align: right; background-color: #ffffff;">
    <div style="background: ${color}; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Smart HR 🚀</h1>
    </div>
    <div style="padding: 30px;">
        <h2 style="color: #1e293b; margin-top: 0;">${title}</h2>
        <div style="color: #64748b; font-size: 16px; line-height: 1.6;">${message}</div>
    </div>
    <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">هذا إيميل تلقائي تم إرساله بواسطة نظام Smart HR</p>
    </div>
</div>
`;

exports.sendEmail = async (to, subject, title, message, type = 'info') => {
    try {
        const settings = await SystemSetting.findOne();
        
        // التحقق من تفعيل الخدمة ووجود البيانات
        if (!settings || !settings.emailServiceActive || !settings.senderEmail || !settings.senderPassword) {
            console.log("⚠️ خدمة البريد غير مفعلة أو البيانات ناقصة.");
            return;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: settings.senderEmail,
                pass: settings.senderPassword
            }
        });

        let color = '#3b82f6'; // أزرق
        if (type === 'danger') color = '#ef4444'; // أحمر
        if (type === 'success') color = '#10b981'; // أخضر

        await transporter.sendMail({
            from: `"Smart HR System" <${settings.senderEmail}>`,
            to: to,
            subject: `🔔 ${subject}`,
            html: getHtmlTemplate(title, message, color)
        });

        console.log(`📧 تم إرسال إيميل إلى ${to}`);

    } catch (error) {
        console.error("❌ فشل إرسال الإيميل:", error.message);
    }
};
