const Shift = require('../models/Shift');
const User = require('../models/User');

exports.createShift = async (req, res) => {
    try {
        const { name, startTime, endTime } = req.body;
        await Shift.create({ name, startTime, endTime, companyId: req.user.companyId });
        res.status(201).json({ message: "تم الإنشاء" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.findAll({ where: { companyId: req.user.companyId } });
        res.json(shifts);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.assignShift = async (req, res) => {
    try {
        const { userId, shiftId } = req.body;
        const user = await User.findOne({ where: { id: userId, companyId: req.user.companyId } });
        if (!user) return res.status(404).json({ message: "الموظف غير موجود" });
        user.shiftId = shiftId;
        await user.save();
        res.json({ message: "تم التعيين" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
