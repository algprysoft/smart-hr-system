const Leave = require('../models/Leave');
const User = require('../models/User');
const Company = require('../models/Company');
const { sendEmail } = require('../utils/emailService');

exports.applyLeave = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        const userId = req.user.id;
        const companyId = req.user.companyId;
        const file = req.file; 
        const user = await User.findByPk(userId);

        await Leave.create({ userId, companyId, startDate, endDate, reason, attachmentPath: file ? file.path : null });

        const company = await Company.findByPk(companyId);
        if (company && company.adminEmail) {
            await sendEmail(company.adminEmail, "طلب إجازة", "طلب جديد", `من: ${user.name}`, 'info');
        }

        const io = req.app.get('socketio');
        io.to(`company_${companyId}`).emit('new_notification', { type: 'info', message: `📄 إجازة من: ${user.name}`, role: 'admin' });
        io.to(`company_${companyId}`).emit('update_badges');

        res.status(201).json({ message: "تم الإرسال" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const leave = await Leave.findOne({ where: { id, companyId: req.user.companyId }, include: [User] });
        
        if (!leave) return res.status(404).json({ message: "غير موجود" });

        leave.status = status;
        await leave.save();

        const io = req.app.get('socketio');
        io.to(`company_${leave.companyId}`).emit('new_notification', {
            type: status === 'approved' ? 'success' : 'error',
            message: `تم ${status === 'approved' ? 'الموافقة' : 'الرفض'}`,
            userId: leave.userId 
        });
        io.to(`company_${leave.companyId}`).emit('update_badges');

        if (leave.User.email) {
            await sendEmail(leave.User.email, "حالة الإجازة", `تم ${status === 'approved' ? 'الموافقة' : 'الرفض'}`, "", status === 'approved' ? 'success' : 'danger');
        }

        res.json({ message: "تم التحديث" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
        if (!leave) return res.status(404).json({ message: "غير موجود" });
        if (leave.status !== 'pending') return res.status(400).json({ message: "لا يمكن الحذف" });
        await leave.destroy();
        res.json({ message: "تم الحذف" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.findAll({
            where: { companyId: req.user.companyId },
            include: [{ model: User, attributes: ['name'] }],
            order: [['createdAt', 'DESC']] 
        });
        res.json(leaves);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getMyLeaves = async (req, res) => {
    try {
        const leaves = await Leave.findAll({ where: { userId: req.user.id }, order: [['createdAt', 'DESC']] });
        res.json(leaves);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
