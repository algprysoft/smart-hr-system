const cron = require('node-cron');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Company = require('../models/Company'); // <--- تعديل
const { sendEmail } = require('./emailService');

const setupCronJobs = () => {
    cron.schedule('* * * * *', async () => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        try {
            // جلب كل الشركات النشطة
            const companies = await Company.findAll({ where: { isActive: true } });

            for (const company of companies) {
                if (company.emailServiceActive && company.adminEmail && company.absenceCheckTime === currentTime) {
                    console.log(`⏰ فحص الغياب لشركة: ${company.name}`);
                    await checkAbsence(company);
                }
            }
        } catch (error) {
            console.error("Cron Job Error:", error);
        }
    });
};

const checkAbsence = async (company) => {
    const today = new Date().toISOString().slice(0, 10);
    
    // جلب موظفي هذه الشركة فقط
    const employees = await User.findAll({ where: { role: 'employee', companyId: company.id } });
    const absentees = [];

    for (const emp of employees) {
        const attendance = await Attendance.findOne({
            where: { userId: emp.id, date: today }
        });
        if (!attendance) {
            absentees.push(emp.name);
        }
    }

    if (absentees.length > 0) {
        const listHtml = absentees.map(name => `<li>${name}</li>`).join('');
        // نمرر إعدادات الشركة لخدمة الإيميل (سنحتاج تحديث emailService أيضاً)
        // *ملاحظة:* حالياً emailService يقرأ من SystemSetting، سنحدثه في الخطوة القادمة
    }
};

module.exports = setupCronJobs;
