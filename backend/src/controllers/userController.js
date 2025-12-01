const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await User.findAll({
            where: { 
                companyId: req.user.companyId,
                role: ['employee', 'hr'] 
            },
            attributes: { exclude: ['password'] } 
        });
        res.json(employees);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.createEmployee = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'البريد مسجل مسبقاً' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name, email, password: hashedPassword,
            role: role || 'employee',
            companyId: req.user.companyId
        });

        res.status(201).json({ message: "تم الإضافة", user: newUser });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findOne({ where: { id, companyId: req.user.companyId } });
        if (!user) return res.status(404).json({ message: "غير موجود" });

        const { name, email, role, password, phone, address, age } = req.body;
        if(name) user.name = name;
        if(email) user.email = email;
        if(role) user.role = role;
        if(phone) user.phone = phone;
        if(address) user.address = address;
        if(age) user.age = age;
        if (password && password.length > 0) user.password = await bcrypt.hash(password, 10);
        
        if (req.files) {
            if (req.files.profilePic) user.profilePic = req.files.profilePic[0].path;
            if (req.files.cv) user.cvPath = req.files.cv[0].path;
        }

        await user.save();
        res.json({ message: "تم التحديث ✅", user });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteUser = async (req, res) => {
    try {
        const deleted = await User.destroy({ where: { id: req.params.id, companyId: req.user.companyId } });
        if (!deleted) return res.status(404).json({ message: "غير موجود" });
        res.json({ message: "تم الحذف" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "كلمة المرور خطأ" });
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.json({ message: "تم التغيير" });
    } catch (error) { res.status(500).json({ message: error.message }); }
};
