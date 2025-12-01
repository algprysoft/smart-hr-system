import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";

const Profile = () => {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState({ current: "", new: "" });
  const [msg, setMsg] = useState("");
  
  // قراءة محدثة للمستخدم
  const user = JSON.parse(localStorage.getItem("user"));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5005/api/users/password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg("✅ تم تغيير كلمة المرور بنجاح");
      setPasswords({ current: "", new: "" });
    } catch (err) { 
        console.error(err);
        setMsg("❌ فشل التغيير: كلمة المرور الحالية خطأ"); 
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 🔙 زر العودة */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">👤 الملف الشخصي</h2>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-4 py-2 rounded-xl font-bold transition"><span>الرئيسية</span> 🏠</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* بطاقة المعلومات (للقراءة فقط) */}
        <GlassCard className="md:col-span-1 flex flex-col items-center text-center p-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-5xl font-bold text-white mb-4 shadow-lg border-4 border-white dark:border-slate-700">
                {user.name.charAt(0)}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{user.name}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
            <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-bold mt-3 shadow-sm">{user.role.toUpperCase()}</span>
            
            <div className="mt-6 text-right w-full space-y-3 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                <p className="text-sm"><span className="font-bold text-gray-600 dark:text-gray-300">📱 الهاتف:</span> {user.phone || "غير مسجل"}</p>
                <p className="text-sm"><span className="font-bold text-gray-600 dark:text-gray-300">📍 السكن:</span> {user.address || "غير مسجل"}</p>
                <p className="text-sm"><span className="font-bold text-gray-600 dark:text-gray-300">🎂 العمر:</span> {user.age || "-"}</p>
            </div>

            <button onClick={() => navigate('/digital-id')} className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow transition">
                🪪 بطاقتي الرقمية
            </button>
        </GlassCard>

        {/* تغيير كلمة المرور */}
        <GlassCard className="md:col-span-2 p-8">
            <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-6 border-b pb-2 dark:border-slate-700">🔐 الأمان وتغيير كلمة المرور</h3>
            
            {msg && <div className={`p-3 rounded-lg mb-6 font-bold text-center ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

            <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">كلمة المرور الحالية</label>
                    <input type="password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2">كلمة المرور الجديدة</label>
                    <input type="password" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full p-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition">تحديث كلمة المرور</button>
            </form>
        </GlassCard>

      </div>
    </div>
  );
};

export default Profile;
