const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const uploadFields = upload.fields([{ name: 'profilePic', maxCount: 1 }, { name: 'cv', maxCount: 1 }]);

router.get('/', authMiddleware, userController.getAllEmployees);
// تعديل هنا: السماح برفع الصور عند الإنشاء
router.post('/', authMiddleware, uploadFields, userController.createEmployee);
router.put('/password', authMiddleware, userController.updatePassword);
router.put('/:id', authMiddleware, uploadFields, userController.updateUser); 
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;
