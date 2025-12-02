const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. تسجيل شركة جديدة (SaaS)
router.post('/register-company', authController.registerCompany);

// 2. تسجيل الدخول
router.post('/login', authController.login);

// 3. التحقق من الرمز (OTP)
router.post('/verify-otp', authController.verifyOtp);

// 🚀 4. الرابط السحري للإصلاح (Reset & Seed)
// هذا الرابط يعيد إنشاء شركة ومدير افتراضي إذا كانت القاعدة فارغة أو تالفة
router.get('/reset-system', authController.resetSystem);

module.exports = router;
