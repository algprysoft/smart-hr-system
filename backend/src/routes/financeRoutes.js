const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/advance', authMiddleware, financeController.requestAdvance);
router.get('/advances', authMiddleware, financeController.getAllAdvances);
router.put('/advance/:id', authMiddleware, financeController.updateAdvanceStatus);
router.delete('/advance/:id', authMiddleware, financeController.deleteAdvance); // جديد

router.post('/bonus', authMiddleware, financeController.addBonus);
router.get('/bonuses', authMiddleware, financeController.getAllBonuses);

module.exports = router;
