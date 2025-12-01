import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Reports = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || user.role !== 'admin') { navigate("/dashboard"); return; }
        const res = await axios.get("http://localhost:5005/api/attendance", { headers: { Authorization: `Bearer ${token}` } });
        setLogs(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchReports();
  }, [navigate]);

  const formatTime = (time24) => {
    if (!time24) return "-";
    const [h, m] = time24.split(':');
    const d = new Date(); d.setHours(h); d.setMinutes(m);
    return d.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  const downloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5005/api/attendance/export", {
        headers: { Authorization: `Bearer ${token}` }, responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', 'Attendance_Report.xlsx');
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err) { console.error(err); alert("فشل التحميل"); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 🔙 زر العودة */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 no-print">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">📊 سجلات الحضور</h2>
        <div className="flex gap-3">
            <button onClick={() => navigate("/dashboard")} className="bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-xl font-bold transition">الرئيسية 🏠</button>
            <button onClick={() => window.print()} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold transition">🖨️ طباعة</button>
            <button onClick={downloadExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold transition">📥 Excel</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-x-auto border border-gray-100 dark:border-slate-700">
        <table className="w-full text-right">
            <thead className="bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-200 border-b dark:border-slate-700">
                <tr><th>الصورة</th><th>الموظف</th><th>التاريخ</th><th>دخول</th><th>خروج</th><th>تأخير</th><th>الحالة</th></tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300">
                {loading ? <tr><td colSpan="7" className="p-6 text-center">جاري التحميل...</td></tr> : logs.map(log => (
                    <tr key={log.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="p-4">
                            {log.imagePath ? <img src={`http://localhost:5005/${log.imagePath}`} alt="user" className="w-10 h-10 rounded-full object-cover border" /> : '-'}
                        </td>
                        <td className="p-4 font-bold">{log.User?.name}</td>
                        <td className="p-4 font-mono">{log.date}</td>
                        <td className="p-4 text-green-600 font-bold font-mono">{formatTime(log.checkInTime)}</td>
                        <td className="p-4 text-red-500 font-bold font-mono">{formatTime(log.checkOutTime)}</td>
                        <td className="p-4">{log.delayMinutes > 0 ? <span className="text-red-600 font-bold">{log.delayMinutes} د</span> : <span className="text-green-600">✓</span>}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold text-white ${log.status === 'late' ? 'bg-red-500' : log.checkOutTime ? 'bg-blue-500' : 'bg-green-500'}`}>
                                {log.status === 'late' ? 'متأخر' : log.checkOutTime ? 'مكتمل' : 'حاضر'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
