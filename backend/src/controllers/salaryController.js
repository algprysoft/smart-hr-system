const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Company = require('../models/Company');
const Advance = require('../models/Advance');
const Bonus = require('../models/Bonus');
const sequelize = require('../config/database'); 
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/emailService');

exports.calculateSalaries = async (req, res) => {
    try {
        const { month, year } = req.query; 
        const companyId = req.user.companyId;
        
        // تحويل المدخلات لأرقام
        const m = parseInt(month);
        const y = parseInt(year);

        const employees = await User.findAll({ where: { role: 'employee', companyId } });
        const company = await Company.findByPk(companyId);
        
        const HOURLY_RATE = company.hourlyRate || 50;
        const DEDUCTION_PER_MINUTE = company.deductionPerMinute || 1;

        const report = [];

        for (const emp of employees) {
            // 1. حساب ساعات العمل والتأخير
            const records = await Attendance.findAll({
                where: {
                    userId: emp.id,
                    [Op.and]: [
                        sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), m),
                        sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), y)
                    ]
                }
            });

            let totalHours = 0;
            let totalDelayMinutes = 0;

            records.forEach(r => {
                if (r.checkInTime && r.checkOutTime) {
                    const start = new Date(`1970-01-01T${r.checkInTime}Z`);
                    const end = new Date(`1970-01-01T${r.checkOutTime}Z`);
                    // حساب الفرق بالساعات
                    const h = (end - start) / 3600000; 
                    if (h > 0) totalHours += h;
                }
                if (r.delayMinutes > 0) totalDelayMinutes += r.delayMinutes;
            });

            // 2. حساب السلف (الموافق عليها فقط وفي نفس الشهر)
            const advancesData = await Advance.findAll({
                where: { 
                    userId: emp.id, 
                    status: 'approved',
                    [Op.and]: [
                        sequelize.where(sequelize.fn('MONTH', sequelize.col('updatedAt')), m),
                        sequelize.where(sequelize.fn('YEAR', sequelize.col('updatedAt')), y)
                    ]
                }
            });
            const advances = advancesData.reduce((sum, item) => sum + item.amount, 0);

            // 3. حساب المكافآت (في نفس الشهر)
            const bonusesData = await Bonus.findAll({
                where: { 
                    userId: emp.id,
                    [Op.and]: [
                        sequelize.where(sequelize.fn('MONTH', sequelize.col('date')), m),
                        sequelize.where(sequelize.fn('YEAR', sequelize.col('date')), y)
                    ]
                }
            });
            const bonuses = bonusesData.reduce((sum, item) => sum + item.amount, 0);

            // 4. المعادلة النهائية
            const baseSalary = totalHours * HOURLY_RATE;
            const delayDeduction = totalDelayMinutes * DEDUCTION_PER_MINUTE;
            
            // (الأساسي + المكافآت) - (خصم التأخير + السلف)
            let finalSalary = (baseSalary + bonuses) - (delayDeduction + advances);
            if (finalSalary < 0) finalSalary = 0;

            report.push({
                userId: emp.id,
                name: emp.name,
                totalHours: totalHours.toFixed(2),
                hourlyRate: HOURLY_RATE,
                totalDelayMinutes,
                delayDeduction: delayDeduction.toFixed(2),
                advances, 
                bonuses,
                totalSalary: finalSalary.toFixed(2)
            });
        }

        res.json(report);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.paySalary = async (req, res) => {
    try {
        const { userId, month, year, amount, totalHours } = req.body;
        
        // التحقق من الدفع المسبق
        const existing = await Salary.findOne({ 
            where: { userId, month, year } 
        });
        
        if (existing) return res.status(400).json({ message: "تم دفع راتب هذا الشهر مسبقاً" });

        await Salary.create({ 
            userId, 
            companyId: req.user.companyId, 
            month, 
            year, 
            amount, 
            totalHours, 
            status: 'paid' 
        });
        
        const user = await User.findByPk(userId);
        if (user.email) {
            try {
                await sendEmail(
                    user.email, 
                    "تم إيداع الراتب 💵", 
                    "إشعار راتب", 
                    `تم اعتماد راتب شهر ${month}/${year} بمبلغ: ${amount} ريال`, 
                    'success'
                );
            } catch(e) { console.log("Email error", e); }
        }
        
        res.json({ message: "تم الاعتماد بنجاح" });
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};

exports.getSalaryStats = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const companyId = req.user.companyId;

        const stats = await Salary.findAll({
            attributes: [
                'month', 
                [sequelize.fn('sum', sequelize.col('amount')), 'totalAmount']
            ],
            where: { year: currentYear, status: 'paid', companyId },
            group: ['month'], 
            order: [['month', 'ASC']]
        });

        const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const data = stats.map(s => ({ 
            name: months[s.month - 1], 
            رواتب: s.dataValues.totalAmount 
        }));
        
        res.json(data);
    } catch (error) { 
        res.status(500).json({ message: error.message }); 
    }
};
