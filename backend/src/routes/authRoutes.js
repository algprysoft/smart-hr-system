const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// تسجيل شركة جديدة (SaaS)
router.post('/register-company', authController.registerCompany);

// تسجيل الدخول والتحقق
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOtp);

module.exports = router;
