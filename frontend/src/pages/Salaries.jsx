import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Salaries = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1); 
  const [year, setYear] = useState(new Date().getFullYear()); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSalaries = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://smart-hr-api.onrender.com/api/salaries/calculate?month=${month}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReport(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchSalaries();
  }, [month, year]);

  const handlePay = async (emp) => {
    if(!window.confirm(`هل أنت متأكد من اعتماد راتب ${emp.name}؟`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://smart-hr-api.onrender.com/api/salaries/pay", {
        userId: emp.userId, month, year, amount: emp.totalSalary, totalHours: emp.totalHours
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("تم الاعتماد بنجاح! 💰");
    } catch (err) { alert("خطأ: " + (err.response?.data?.message || "فشلت العملية")); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 🔙 زر العودة */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">💰 كشوفات الرواتب</h2>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-xl font-bold transition"><span>الرئيسية</span> 🏠</button>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm mb-8 border border-gray-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
            <div className="flex items-center gap-2">
                <span className="dark:text-white">الشهر:</span>
                <select value={month} onChange={e => setMonth(e.target.value)} className="p-2 border rounded dark:bg-slate-700 dark:text-white">{[...Array(12).keys()].map(m => <option key={m+1} value={m+1}>{m+1}</option>)}</select>
            </div>
            <div className="flex items-center gap-2">
                <span className="dark:text-white">السنة:</span>
                <select value={year} onChange={e => setYear(e.target.value)} className="p-2 border rounded dark:bg-slate-700 dark:text-white"><option value="2024">2024</option><option value="2025">2025</option></select>
            </div>
        </div>
        <span className="text-gray-500 text-sm">يتم الحساب تلقائياً ✅</span>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-x-auto border border-gray-100 dark:border-slate-700">
        <table className="w-full text-right">
            <thead className="bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-200 border-b dark:border-slate-700">
                <tr><th>الموظف</th><th>ساعات</th><th>سعر/س</th><th>خصم تأخير</th><th>الصافي</th><th>الإجراء</th></tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300">
                {loading ? <tr><td colSpan="6" className="p-6 text-center">جاري الحساب...</td></tr> : report.map((item, index) => (
                    <tr key={index} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="p-4 font-bold">{item.name}</td>
                        <td className="p-4">{item.totalHours}</td>
                        <td className="p-4">{item.hourlyRate}</td>
                        <td className="p-4 text-red-500 font-bold">{item.totalDelayMinutes} د <span className="text-xs font-normal">(-{item.deductions} ريال)</span></td>
                        <td className="p-4 text-green-600 font-bold text-lg">{item.totalSalary}</td>
                        <td className="p-4"><button onClick={() => handlePay(item)} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow font-bold text-sm">اعتماد</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Salaries;
