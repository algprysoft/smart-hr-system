const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');

// فقط السوبر أدمن يجب أن يصل لهذه الروابط (يمكنك إضافة حماية لاحقاً)
router.post('/', companyController.createCompany);
router.get('/', companyController.getAllCompanies);
router.put('/:id', authMiddleware, companyController.updateCompany);

module.exports = router;
