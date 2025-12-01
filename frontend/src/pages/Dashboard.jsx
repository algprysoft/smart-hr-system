import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout"; 
import DashboardCharts from "../components/DashboardCharts"; 
import EmployeeDashboard from "./EmployeeDashboard"; 

const Dashboard = () => {
  const navigate = useNavigate();
  
  const [user] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "صباح الخير ☀️";
    if (hour < 18) return "مساء الخير 🌤️";
    return "مساء النور 🌙";
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  if (!user) return null;

  return (
    <Layout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">لوحة التحكم</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{greeting}، {user.name} 👋</p>
        </div>
        <span className="text-sm bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200 py-1 px-3 rounded-full font-bold">
          {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {user.role === "admin" ? (
        <div>
          <DashboardCharts />

          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">الوصول السريع</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard title="إدارة الموظفين" icon="👥" color="bg-blue-500" onClick={() => navigate("/employees")} />
            <DashboardCard title="طلبات الإجازة" icon="🏖️" color="bg-yellow-500" onClick={() => navigate("/leaves")} />
            <DashboardCard title="التقارير والسجلات" icon="📊" color="bg-emerald-500" onClick={() => navigate("/reports")} />
            <DashboardCard title="نظام الرواتب" icon="💰" color="bg-purple-500" onClick={() => navigate("/salaries")} />
            
            {/* البطاقة الجديدة */}
            <DashboardCard title="الإدارة المالية (سلف/مكافآت)" icon="💸" color="bg-lime-500" onClick={() => navigate("/finance")} />

            <DashboardCard title="إدارة الورديات" icon="🕰️" color="bg-orange-500" onClick={() => navigate("/shifts")} />
            <DashboardCard title="شاشة الاستقبال (QR)" icon="🖥️" color="bg-slate-700" onClick={() => navigate("/qr-station")} />
            <DashboardCard title="الخريطة الحية" icon="🛰️" color="bg-red-600" onClick={() => navigate("/live-map")} />
          </div>
        </div>
      ) : (
        <EmployeeDashboard user={user} />
      )}
    </Layout>
  );
};

const DashboardCard = ({ title, icon, color, onClick }) => (
  <div onClick={onClick} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all cursor-pointer transform hover:-translate-y-1 group">
    <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-3xl text-white mb-4 shadow-md group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">اضغط للفتح ⬅️</p>
  </div>
);

export default Dashboard;
