const Leave = require('../models/Leave');
const Advance = require('../models/Advance');

exports.getNotificationCounts = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const pendingLeaves = await Leave.count({ where: { status: 'pending', companyId } });
        const pendingAdvances = await Advance.count({ where: { status: 'pending', companyId } });
        res.json({ leaves: pendingLeaves, finance: pendingAdvances, total: pendingLeaves + pendingAdvances });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
