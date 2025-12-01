const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./src/config/database');
const http = require('http'); 
const { Server } = require('socket.io'); 

const User = require('./src/models/User'); 
const Attendance = require('./src/models/Attendance');
const Leave = require('./src/models/Leave');
const Salary = require('./src/models/Salary');
const Shift = require('./src/models/Shift');
const Log = require('./src/models/Log');
const SystemSetting = require('./src/models/SystemSetting');
const Advance = require('./src/models/Advance');
const Bonus = require('./src/models/Bonus');
const Company = require('./src/models/Company');

// العلاقات
User.hasMany(Attendance, { foreignKey: 'userId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Leave, { foreignKey: 'userId' });
Leave.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Salary, { foreignKey: 'userId' });
Salary.belongsTo(User, { foreignKey: 'userId' });
Shift.hasMany(User, { foreignKey: 'shiftId' });
User.belongsTo(Shift, { foreignKey: 'shiftId' });
User.hasMany(Advance, { foreignKey: 'userId' });
Advance.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Bonus, { foreignKey: 'userId' });
Bonus.belongsTo(User, { foreignKey: 'userId' });
Company.hasMany(User, { foreignKey: 'companyId' });
User.belongsTo(Company, { foreignKey: 'companyId' });

// الروابط
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const salaryRoutes = require('./src/routes/salaryRoutes');
const shiftRoutes = require('./src/routes/shiftRoutes');
const logRoutes = require('./src/routes/logRoutes');
const settingsRoutes = require('./src/routes/settingsRoutes'); // ✅ تأكد من وجود هذا الملف
const financeRoutes = require('./src/routes/financeRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5005;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });
app.set('socketio', io);

io.on('connection', (socket) => {
    socket.on('send_location', (data) => io.emit('update_map', data));
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salaries', salaryRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingsRoutes); // ✅ تفعيل رابط الإعدادات
app.use('/api/finance', financeRoutes);

// تشغيل السيرفر
sequelize.sync({ alter: true }).then(() => {
    console.log('✅ Database Synced');
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
