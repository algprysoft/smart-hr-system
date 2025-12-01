const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/calculate', authMiddleware, salaryController.calculateSalaries);
router.post('/pay', authMiddleware, salaryController.paySalary);
router.get('/stats', authMiddleware, salaryController.getSalaryStats); // هذا الرابط هو سبب المشكلة سابقاً

module.exports = router;
