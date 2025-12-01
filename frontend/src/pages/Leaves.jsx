import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import { ElegantTable, TableHead, TableHeader, TableRow, TableCell } from "../components/ui/ElegantTable";

const Leaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  
  const [user] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [formData, setFormData] = useState({ startDate: "", endDate: "", reason: "" });
  const [file, setFile] = useState(null); 
  const [msg, setMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const getLeavesData = async () => {
        const token = localStorage.getItem("token");
        if (!token || !user) { navigate("/"); return; }
        try {
            const endpoint = user.role === "admin"
                ? "https://smart-hr-api.onrender.com/api/leaves"
                : "https://smart-hr-api.onrender.com/api/leaves/my-leaves";
            
            const res = await axios.get(endpoint, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setLeaves(res.data);
        } catch (err) { console.error(err); }
    };
    getLeavesData();
  }, [user, navigate, refreshKey]);

  const handleApply = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('reason', formData.reason);
      if (file) data.append('attachment', file);

      await axios.post("https://smart-hr-api.onrender.com/api/leaves", data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });

      setMsg("تم الإرسال بنجاح ✅");
      setFormData({ startDate: "", endDate: "", reason: "" });
      setFile(null);
      setRefreshKey(k => k + 1);
    } catch (err) { 
        console.error(err);
        setMsg("فشل الإرسال"); 
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://smart-hr-api.onrender.com/api/leaves/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefreshKey(k => k + 1);
    } catch (err) { console.error(err); alert("خطأ"); }
  };

  // دالة الحذف الجديدة
  const handleDeleteLeave = async (id) => {
    if(!window.confirm("هل أنت متأكد من حذف طلب الإجازة؟")) return;
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`https://smart-hr-api.onrender.com/api/leaves/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRefreshKey(k => k + 1);
    } catch (err) {
        console.error(err);
        alert("فشل الحذف (ربما تم الرد على الطلب)");
    }
  };

  const inputStyle = "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-yellow-500 outline-none transition-all";

  if (!user) return <div className="p-10 text-center text-gray-500">جاري التحميل...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">🏖️ الإجازات</h2>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-xl font-bold transition"><span>الرئيسية</span> 🏠</button>
      </div>

      {user.role === "employee" && (
        <GlassCard className="mb-8 border-l-4 border-l-yellow-400">
          <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-6">📝 طلب إجازة جديد</h3>
          {msg && <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-4 font-bold text-center">{msg}</div>}
          
          <form onSubmit={handleApply} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ البدء</label>
                <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className={inputStyle} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">تاريخ العودة</label>
                <input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className={inputStyle} />
              </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">سبب الإجازة</label>
                <input type="text" placeholder="اكتب السبب بوضوح..." required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} className={inputStyle} />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">مرفق (تقرير طبي / مستند) - اختياري</label>
                <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full p-2 border rounded-lg bg-white dark:bg-slate-800 dark:border-gray-600 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100" />
            </div>

            <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl font-bold transition shadow-md">إرسال الطلب 📤</button>
          </form>
        </GlassCard>
      )}

      <ElegantTable>
        <TableHead>
            <TableHeader>الموظف</TableHeader>
            <TableHeader>التاريخ</TableHeader>
            <TableHeader>السبب</TableHeader>
            <TableHeader>المرفقات</TableHeader>
            <TableHeader>الحالة</TableHeader>
            <TableHeader>إجراءات</TableHeader>
        </TableHead>
        <tbody>
            {leaves.map(leave => (
              <TableRow key={leave.id}>
                <TableCell className="font-bold">{leave.User?.name}</TableCell>
                <TableCell className="font-mono text-xs">{leave.startDate} ➝ {leave.endDate}</TableCell>
                <TableCell>{leave.reason}</TableCell>
                <TableCell>
                    {leave.attachmentPath ? (
                        <a href={`https://smart-hr-api.onrender.com/${leave.attachmentPath}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1">
                            📎 <span>فتح</span>
                        </a>
                    ) : <span className="text-gray-400">-</span>}
                </TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white
                    ${leave.status === 'approved' ? 'bg-green-500' : leave.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                    {leave.status === 'pending' ? 'قيد الانتظار ⏳' : leave.status === 'approved' ? 'مقبول ✅' : 'مرفوض ❌'}
                  </span>
                </TableCell>
                
                <TableCell>
                    {/* منطق الأزرار الذكي */}
                    {user.role === 'admin' && leave.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleStatusUpdate(leave.id, 'approved')} className="text-green-600 bg-green-100 px-3 py-1 rounded hover:bg-green-200 transition font-bold">✓</button>
                        <button onClick={() => handleStatusUpdate(leave.id, 'rejected')} className="text-red-600 bg-red-100 px-3 py-1 rounded hover:bg-red-200 transition font-bold">✕</button>
                      </div>
                    ) : (
                        // زر الحذف يظهر للموظف والمدير ما دام الطلب معلقاً
                        leave.status === 'pending' && (user.role === 'admin' || user.id === leave.userId) ? (
                            <button onClick={() => handleDeleteLeave(leave.id)} className="text-red-500 hover:bg-red-50 p-2 rounded transition" title="حذف الطلب">
                                🗑️ حذف
                            </button>
                        ) : "-"
                    )}
                </TableCell>

              </TableRow>
            ))}
            {leaves.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">لا توجد طلبات إجازة حالياً</td></tr>}
        </tbody>
      </ElegantTable>
    </div>
  );
};

export default Leaves;
