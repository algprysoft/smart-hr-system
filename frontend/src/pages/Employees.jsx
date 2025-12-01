import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // إضافة الحقول الجديدة للنموذج
  const [formData, setFormData] = useState({ 
    name: "", email: "", password: "", role: "employee", 
    phone: "", address: "", age: "" 
  });
  const [msg, setMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5005/api/users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployees(res.data);
      } catch (err) { console.error(err); }
    };
    fetchEmployees();
  }, [refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5005/api/users/${currentUser.id}`, formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMsg("تم تحديث بيانات الموظف ✅");
      } else {
        await axios.post("http://localhost:5005/api/users", formData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setMsg("تمت إضافة الموظف بنجاح ✅");
      }
      setFormData({ name: "", email: "", password: "", role: "employee", phone: "", address: "", age: "" });
      setIsEditing(false);
      setCurrentUser(null);
      setRefreshKey(k => k + 1);
    } catch (err) { 
      console.error(err); 
      setMsg("فشل العملية"); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("هل أنت متأكد من حذف هذا الموظف وجميع بياناته؟")) return;
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5005/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRefreshKey(k => k + 1);
    } catch (err) { console.error(err); alert("فشل الحذف"); }
  };

  const startEdit = (emp) => {
    setIsEditing(true);
    setCurrentUser(emp);
    setFormData({ 
        name: emp.name, email: emp.email, role: emp.role, password: "", 
        phone: emp.phone || "", address: emp.address || "", age: emp.age || "" 
    });
    window.scrollTo(0,0);
  };

  const inputStyle = "p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white w-full focus:ring-2 focus:ring-blue-500 outline-none transition";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 🔙 زر العودة */}
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">👥 سجلات الموظفين</h2>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-xl font-bold transition"><span>الرئيسية</span> 🏠</button>
      </div>

      {msg && <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-6 font-bold text-center">{msg}</div>}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm mb-8 border border-gray-100 dark:border-slate-700">
        <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-6 border-b pb-2 dark:border-gray-600">
            {isEditing ? "✏️ تعديل بيانات الموظف" : "➕ إضافة موظف جديد"}
        </h3>
        
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            {/* البيانات الأساسية */}
            <input type="text" placeholder="الاسم الكامل" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} />
            <input type="email" placeholder="البريد الإلكتروني" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputStyle} />
            <input type="password" placeholder={isEditing ? "اتركه فارغاً إذا لا تريد تغيير كلمة المرور" : "كلمة المرور"} required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputStyle} />
            
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={inputStyle}>
                <option value="employee">موظف (Employee)</option>
                <option value="hr">موارد بشرية (HR)</option>
                <option value="admin">مدير نظام (Admin)</option>
            </select>

            {/* البيانات الإضافية */}
            <input type="text" placeholder="رقم الهاتف (اختياري)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputStyle} />
            <input type="number" placeholder="العمر (اختياري)" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} className={inputStyle} />
            <input type="text" placeholder="العنوان / السكن (اختياري)" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={`${inputStyle} md:col-span-2`} />

            <div className="md:col-span-2 flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">حفظ البيانات</button>
                {isEditing && <button onClick={() => {setIsEditing(false); setFormData({ name: "", email: "", password: "", role: "employee", phone: "", address: "", age: "" });}} className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition">إلغاء</button>}
            </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-x-auto border border-gray-100 dark:border-slate-700">
        <table className="w-full text-right">
            <thead className="bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-200 border-b dark:border-slate-700">
                <tr><th className="p-4">الاسم</th><th className="p-4">البريد</th><th className="p-4">الهاتف</th><th className="p-4">الدور</th><th className="p-4">إجراءات</th></tr>
            </thead>
            <tbody className="text-gray-600 dark:text-gray-300">
                {employees.map(emp => (
                    <tr key={emp.id} className="border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                        <td className="p-4 font-bold text-gray-800 dark:text-white">{emp.name}</td>
                        <td className="p-4">{emp.email}</td>
                        <td className="p-4 text-sm font-mono">{emp.phone || "-"}</td>
                        <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white 
                                ${emp.role === 'admin' ? 'bg-red-500' : emp.role === 'hr' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                {emp.role.toUpperCase()}
                            </span>
                        </td>
                        <td className="p-4 flex gap-2">
                            <button onClick={() => startEdit(emp)} className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded text-sm font-bold transition">تعديل</button>
                            <button onClick={() => handleDelete(emp.id)} className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded text-sm font-bold transition">حذف</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
