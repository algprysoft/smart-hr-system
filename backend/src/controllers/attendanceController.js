const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Shift = require('../models/Shift');
const Company = require('../models/Company');
const excel = require('exceljs'); 
const { Op } = require('sequelize');

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) { return deg * (Math.PI / 180); }

exports.checkIn = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        const companyId = req.user.companyId;
        const image = req.file; 

        if (!image) return res.status(400).json({ message: "صورة مطلوبة" });
        if (!latitude || !longitude) return res.status(400).json({ message: "موقع مطلوب" });

        const company = await Company.findByPk(companyId);
        if (!company) return res.status(400).json({ message: "خطأ في الشركة" });

        const distance = getDistanceFromLatLonInMeters(latitude, longitude, company.companyLat, company.companyLng);
        if (distance > company.allowedRadius) {
            return res.status(400).json({ message: `خارج النطاق! (${Math.floor(distance)}م)` });
        }

        const today = new Date().toISOString().slice(0, 10);
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false }); 

        const existing = await Attendance.findOne({ where: { userId, date: today } });
        if (existing) return res.status(400).json({ message: "مسجل مسبقاً" });

        const user = await User.findByPk(userId, { include: [Shift] });
        let status = 'present';
        let delayMinutes = 0;

        if (user.Shift) {
            const shiftDate = new Date(`${today}T${user.Shift.startTime}`);
            const checkInDate = new Date(`${today}T${now}`);
            if (checkInDate > shiftDate) {
                delayMinutes = Math.floor((checkInDate - shiftDate) / 60000);
                if (delayMinutes > 15) status = 'late'; else delayMinutes = 0;
            }
        }

        await Attendance.create({ userId, companyId, date: today, checkInTime: now, status, delayMinutes, imagePath: image.path });
        res.json({ message: status === 'late' ? `تم (تأخير ${delayMinutes}د)` : "تم الحضور ✅" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.checkInQR = async (req, res) => {
    try {
        const { qrContent, latitude, longitude } = req.body;
        const userId = req.user.id;
        const companyId = req.user.companyId;

        const [secret, timestamp] = qrContent.split('_');
        if (secret !== 'SMART-HR-SECRET' || (Date.now() - parseInt(timestamp) > 30000)) {
            return res.status(400).json({ message: "كود غير صالح" });
        }

        const company = await Company.findByPk(companyId);
        const distance = getDistanceFromLatLonInMeters(latitude, longitude, company.companyLat, company.companyLng);
        if (distance > company.allowedRadius) return res.status(400).json({ message: "خارج النطاق" });

        const today = new Date().toISOString().slice(0, 10);
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        
        const existing = await Attendance.findOne({ where: { userId, date: today } });
        if (existing) return res.status(400).json({ message: "مسجل مسبقاً" });

        await Attendance.create({ userId, companyId, date: today, checkInTime: now, status: 'present', imagePath: null });
        res.json({ message: "تم عبر QR 🚀" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.checkOut = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const now = new Date().toLocaleTimeString('en-GB', { hour12: false });
        const record = await Attendance.findOne({ where: { userId: req.user.id, date: today } });
        if (!record) return res.status(400).json({ message: "لم تسجل حضور" });
        if (record.checkOutTime) return res.status(400).json({ message: "تم الانصراف مسبقاً" });
        record.checkOutTime = now;
        await record.save();
        res.json({ message: "تم الانصراف 👋" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getStatus = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const record = await Attendance.findOne({ where: { userId: req.user.id, date: today } });
        if (!record) return res.json({ status: 'not_checked_in' });
        if (record.checkOutTime) return res.json({ status: 'checked_out', checkInTime: record.checkInTime });
        return res.json({ status: 'checked_in', checkInTime: record.checkInTime });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllAttendance = async (req, res) => {
    try {
        const records = await Attendance.findAll({
            where: { companyId: req.user.companyId },
            include: [{ model: User, attributes: ['name', 'email'] }],
            order: [['date', 'DESC']]
        });
        res.json(records);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAttendanceStats = async (req, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const companyId = req.user.companyId;
        const total = await User.count({ where: { role: 'employee', companyId } });
        const present = await Attendance.count({ where: { date: today, companyId } });
        res.json([{ name: 'حضور', value: present }, { name: 'غياب', value: total - present }]);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.exportAttendanceExcel = async (req, res) => {
    try {
        const records = await Attendance.findAll({
            where: { companyId: req.user.companyId },
            include: [{ model: User, attributes: ['name'] }],
            order: [['date', 'DESC']]
        });
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('سجل الحضور');
        worksheet.columns = [{ header: 'الموظف', key: 'name' }, { header: 'التاريخ', key: 'date' }, { header: 'دخول', key: 'in' }, { header: 'خروج', key: 'out' }];
        records.forEach(r => worksheet.addRow({ name: r.User?.name, date: r.date, in: r.checkInTime, out: r.checkOutTime }));
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=Report.xlsx");
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) { res.status(500).json({ message: error.message }); }
};
