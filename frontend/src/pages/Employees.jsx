import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import { ElegantTable, TableHead, TableHeader, TableRow, TableCell } from "../components/ui/ElegantTable";

const Employees = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [msg, setMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // النموذج الشامل
  const [formData, setFormData] = useState({ 
    name: "", email: "", password: "", role: "employee", 
    phone: "", address: "", age: "" 
  });
  const [profilePic, setProfilePic] = useState(null); // للصورة

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
      // استخدام FormData لدعم الملفات
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      if (profilePic) data.append('profilePic', profilePic);

      if (isEditing) {
        await axios.put(`http://localhost:5005/api/users/${currentUser.id}`, data, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setMsg("تم التحديث ✅");
      } else {
        await axios.post("http://localhost:5005/api/users", data, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        setMsg("تمت الإضافة ✅");
      }
      
      // تصفير النموذج
      setFormData({ name: "", email: "", password: "", role: "employee", phone: "", address: "", age: "" });
      setProfilePic(null);
      setIsEditing(false);
      setCurrentUser(null);
      setRefreshKey(k => k + 1);
    } catch (err) { 
      console.error(err); 
      setMsg("فشل العملية: " + (err.response?.data?.message || "")); 
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("حذف نهائي؟")) return;
    try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:5005/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        setRefreshKey(k => k + 1);
    } catch (err) { alert("فشل الحذف"); }
  };

  const startEdit = (emp) => {
    setIsEditing(true);
    setCurrentUser(emp);
    setFormData({ 
        name: emp.name, email: emp.email, role: emp.role, password: "", 
        phone: emp.phone || "", address: emp.address || "", age: emp.age || "" 
    });
    setProfilePic(null);
    window.scrollTo(0,0);
  };

  const inputStyle = "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white outline-none";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">👥 إدارة الموظفين</h2>
        <button onClick={() => navigate("/dashboard")} className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-xl font-bold dark:text-white">الرئيسية 🏠</button>
      </div>

      {msg && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-6 text-center font-bold">{msg}</div>}

      <GlassCard className="mb-8">
        <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-6 border-b pb-2 dark:border-gray-600">{isEditing ? "✏️ تعديل" : "➕ إضافة موظف"}</h3>
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <input type="text" placeholder="الاسم الكامل" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputStyle} />
            <input type="email" placeholder="البريد الإلكتروني" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputStyle} />
            <input type="password" placeholder={isEditing ? "اتركه فارغاً" : "كلمة المرور"} required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputStyle} />
            
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={inputStyle}>
                <option value="employee">موظف (Employee)</option>
                <option value="hr">موارد بشرية (HR)</option>
                <option value="admin">مدير نظام (Admin)</option>
            </select>

            <input type="text" placeholder="رقم الهاتف" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputStyle} />
            <input type="text" placeholder="السكن" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className={inputStyle} />
            
            <div>
                <label className="block text-sm mb-1 text-gray-500">الصورة الشخصية</label>
                <input type="file" onChange={e => setProfilePic(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>

            <div className="md:col-span-2 flex gap-2 mt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700">{isEditing ? "حفظ التعديلات" : "إضافة"}</button>
                {isEditing && <button type="button" onClick={() => {setIsEditing(false); setCurrentUser(null); setFormData({ name: "", email: "", password: "", role: "employee", phone: "", address: "", age: "" });}} className="bg-gray-500 text-white px-8 py-3 rounded-lg">إلغاء</button>}
            </div>
        </form>
      </GlassCard>

      <ElegantTable>
        <TableHead><TableHeader>الصورة</TableHeader><TableHeader>الاسم</TableHeader><TableHeader>البريد</TableHeader><TableHeader>الدور</TableHeader><TableHeader>إجراءات</TableHeader></TableHead>
        <tbody>
            {employees.map(emp => (
                <TableRow key={emp.id}>
                    <TableCell>
                        {emp.profilePic ? <img src={`http://localhost:5005/${emp.profilePic}`} className="w-10 h-10 rounded-full object-cover border" alt="profile"/> : <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500">{emp.name.charAt(0)}</div>}
                    </TableCell>
                    <TableCell className="font-bold">{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell><span className={`px-2 py-1 rounded text-xs font-bold text-white ${emp.role === 'admin' ? 'bg-red-500' : 'bg-blue-500'}`}>{emp.role}</span></TableCell>
                    <TableCell>
                        <button onClick={() => startEdit(emp)} className="text-blue-500 hover:underline mx-2">تعديل</button>
                        <button onClick={() => handleDelete(emp.id)} className="text-red-500 hover:underline">حذف</button>
                    </TableCell>
                </TableRow>
            ))}
        </tbody>
      </ElegantTable>
    </div>
  );
};

export default Employees;
