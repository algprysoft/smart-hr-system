const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register-company', authController.registerCompany);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);

// 🔑 الرابط السري للتهيئة
router.get('/setup', authController.setupSystem);

module.exports = router;
