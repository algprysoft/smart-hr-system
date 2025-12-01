import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import axios from 'axios';

const DashboardCharts = () => {
  const [salaryData, setSalaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#10b981', '#ef4444', '#f59e0b']; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 1. جلب الرواتب (مع التعامل مع الخطأ بشكل منفصل)
        try {
            const salaryRes = await axios.get("https://smart-hr-api.onrender.com/api/salaries/stats", config);
            setSalaryData(salaryRes.data);
        } catch (e) { 
            console.warn("فشل جلب إحصائيات الرواتب", e);
            setSalaryData([]); 
        }

        // 2. جلب الحضور (مع التعامل مع الخطأ بشكل منفصل)
        try {
            const attendanceRes = await axios.get("https://smart-hr-api.onrender.com/api/attendance/stats", config);
            setAttendanceData(attendanceRes.data);
        } catch (e) { 
            console.warn("فشل جلب إحصائيات الحضور", e);
            setAttendanceData([]); 
        }

      } catch (err) {
        console.error("خطأ عام في الداشبورد", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">جاري تحميل الإحصائيات... ⏳</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* الرسم البياني 1: الرواتب */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">💰 المصروفات الشهرية (الرواتب)</h3>
        {salaryData.length > 0 ? (
            <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
                <YAxis tick={{fill: '#6b7280'}} />
                <Tooltip contentStyle={{borderRadius: '10px'}} />
                <Legend />
                <Bar dataKey="رواتب" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="الرواتب المدفوعة" />
                </BarChart>
            </ResponsiveContainer>
            </div>
        ) : (
            <div className="h-72 flex items-center justify-center text-gray-400">لا توجد رواتب مدفوعة حتى الآن</div>
        )}
      </div>

      {/* الرسم البياني 2: الحضور */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">📊 حالة الحضور اليوم</h3>
        <div className="h-72 flex justify-center items-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={attendanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {attendanceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default DashboardCharts;
