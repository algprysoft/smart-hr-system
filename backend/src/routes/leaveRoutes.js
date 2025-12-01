const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.post('/', authMiddleware, upload.single('attachment'), leaveController.applyLeave);
router.get('/my-leaves', authMiddleware, leaveController.getMyLeaves);
router.get('/', authMiddleware, leaveController.getAllLeaves);
router.put('/:id', authMiddleware, leaveController.updateLeaveStatus);
router.delete('/:id', authMiddleware, leaveController.deleteLeave); // جديد

module.exports = router;
