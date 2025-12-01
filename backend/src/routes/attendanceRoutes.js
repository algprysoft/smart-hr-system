const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'selfie-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/check-in', authMiddleware, upload.single('image'), attendanceController.checkIn);
router.post('/qr-check-in', authMiddleware, attendanceController.checkInQR); // الرابط الجديد
router.post('/check-out', authMiddleware, attendanceController.checkOut);
router.get('/status', authMiddleware, attendanceController.getStatus);
router.get('/', authMiddleware, attendanceController.getAllAttendance);
router.get('/export', authMiddleware, attendanceController.exportAttendanceExcel);
router.get('/stats', authMiddleware, attendanceController.getAttendanceStats);

module.exports = router;
