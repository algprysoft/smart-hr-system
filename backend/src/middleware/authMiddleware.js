const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. استخراج التوكن من الهيدر
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'عفواً، يجب تسجيل الدخول أولاً' });
        }

        // 2. التحقق من صحة التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. إضافة بيانات المستخدم للطلب لاستخدامها لاحقاً
        req.user = decoded;
        
        next(); // السماح بالمرور
    } catch (error) {
        res.status(401).json({ message: 'جلسة الدخول منتهية، سجل دخولك مجدداً' });
    }
};
