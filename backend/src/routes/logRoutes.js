const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/authMiddleware');

// رابط لعرض السجلات (للمدير فقط)
router.get('/', authMiddleware, logController.getAllLogs);

module.exports = router;
