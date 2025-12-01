const Advance = require('../models/Advance');
const Bonus = require('../models/Bonus');
const User = require('../models/User');
const Company = require('../models/Company');

exports.requestAdvance = async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const user = await User.findByPk(req.user.id);
        await Advance.create({ userId: user.id, companyId: req.user.companyId, amount, reason });
        
        const io = req.app.get('socketio');
        io.to(`company_${req.user.companyId}`).emit('new_notification', { type: 'info', message: `طلب سلفة: ${user.name}`, role: 'admin' });
        io.to(`company_${req.user.companyId}`).emit('update_badges');
        res.status(201).json({ message: "تم الطلب" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllAdvances = async (req, res) => {
    try {
        const where = { companyId: req.user.companyId };
        if (req.user.role !== 'admin') where.userId = req.user.id;
        const advances = await Advance.findAll({ where, include: [{ model: User, attributes: ['name'] }], order: [['createdAt', 'DESC']] });
        res.json(advances);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateAdvanceStatus = async (req, res) => {
    try {
        const advance = await Advance.findOne({ where: { id: req.params.id, companyId: req.user.companyId }, include: [User] });
        if (!advance) return res.status(404).json({ message: "غير موجود" });
        advance.status = req.body.status;
        await advance.save();
        
        const io = req.app.get('socketio');
        io.to(`company_${advance.companyId}`).emit('update_badges');
        res.json({ message: "تم التحديث" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteAdvance = async (req, res) => {
    try {
        const advance = await Advance.findOne({ where: { id: req.params.id, companyId: req.user.companyId } });
        if (!advance || advance.status !== 'pending') return res.status(400).json({ message: "لا يمكن الحذف" });
        await advance.destroy();
        req.app.get('socketio').to(`company_${req.user.companyId}`).emit('update_badges');
        res.json({ message: "تم الحذف" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addBonus = async (req, res) => {
    try {
        await Bonus.create({ userId: req.body.userId, companyId: req.user.companyId, amount: req.body.amount, reason: req.body.reason });
        res.status(201).json({ message: "تمت الإضافة" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllBonuses = async (req, res) => {
    try {
        const bonuses = await Bonus.findAll({ where: { companyId: req.user.companyId }, include: [{ model: User, attributes: ['name'] }], order: [['createdAt', 'DESC']] });
        res.json(bonuses);
    } catch (error) { res.status(500).json({ message: error.message }); }
};
