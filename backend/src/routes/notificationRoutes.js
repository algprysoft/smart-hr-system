const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/counts', authMiddleware, notificationController.getNotificationCounts);

module.exports = router;
