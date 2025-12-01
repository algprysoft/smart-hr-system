const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const authMiddleware = require('../middleware/authMiddleware');

// إنشاء وردية
router.post('/', authMiddleware, shiftController.createShift);

// عرض الورديات
router.get('/', authMiddleware, shiftController.getAllShifts);

// تعيين وردية لموظف
router.post('/assign', authMiddleware, shiftController.assignShift);

module.exports = router;
