import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ 
    companyLat: "", companyLng: "", allowedRadius: 1000, qrRefreshRate: 5000,
    hourlyRate: 50, deductionPerMinute: 1,
    emailServiceActive: false, senderEmail: "", senderPassword: "", adminEmail: "",
    absenceCheckTime: "10:00"
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://smart-hr-api.onrender.com/api/settings", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSettings(prev => ({ ...prev, ...res.data }));
      } catch (err) { console.error(err); }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await axios.put("https://smart-hr-api.onrender.com/api/settings", settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg("✅ تم حفظ الإعدادات بنجاح");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) { 
        console.error(err);
        setMsg("❌ فشل الحفظ: " + (err.response?.data?.message || "تأكد من الاتصال")); 
    } finally {
        setLoading(false);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
        alert("المتصفح لا يدعم تحديد الموقع");
        return;
    }
    navigator.geolocation.getCurrentPosition((pos) => {
      setSettings({ ...settings, companyLat: pos.coords.latitude, companyLng: pos.coords.longitude });
      alert("تم التقاط موقعك الحالي بنجاح 📍");
    }, (err) => {
        console.error(err); // ✅ تم استخدام المتغير
        alert("فشل تحديد الموقع. تأكد من السماح للموقع في المتصفح.");
    });
  };

  const inputStyle = "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all";
  const labelStyle = "block text-sm font-bold text-gray-600 dark:text-gray-300 mb-2";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">⚙️ إعدادات النظام</h2>
        <button onClick={() => navigate("/dashboard")} className="bg-gray-200 dark:bg-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-bold transition">⬅️ عودة</button>
      </div>
      
      {msg && <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg text-white font-bold ${msg.includes('❌') ? 'bg-red-600' : 'bg-green-600'} transition-all duration-500`}>{msg}</div>}

      <form onSubmit={handleSave} className="space-y-8">
        
        <GlassCard className="border-l-4 border-green-500">
          <h3 className="text-xl font-bold text-green-600 mb-6 flex items-center gap-2">💰 الإعدادات المالية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>سعر ساعة العمل (ريال)</label>
              <input type="number" required value={settings.hourlyRate} onChange={e => setSettings({...settings, hourlyRate: e.target.value})} className={inputStyle} />
            </div>
            <div>
              <label className={labelStyle}>خصم دقيقة التأخير (ريال)</label>
              <input type="number" required value={settings.deductionPerMinute} onChange={e => setSettings({...settings, deductionPerMinute: e.target.value})} className={inputStyle} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-blue-600 flex items-center gap-2">📧 التنبيهات (Email)</h3>
            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-slate-700 px-3 py-1 rounded-full">
              <input type="checkbox" checked={settings.emailServiceActive || false} onChange={e => setSettings({...settings, emailServiceActive: e.target.checked})} className="w-5 h-5 accent-blue-600" />
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">تفعيل الخدمة</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>بريد الإرسال (Gmail)</label>
              <input type="email" value={settings.senderEmail || ""} onChange={e => setSettings({...settings, senderEmail: e.target.value})} className={inputStyle} placeholder="hr@company.com" />
            </div>
            <div>
              <label className={labelStyle}>كلمة مرور التطبيق (App Password)</label>
              <input type="password" value={settings.senderPassword || ""} onChange={e => setSettings({...settings, senderPassword: e.target.value})} className={inputStyle} placeholder="xxxx xxxx xxxx xxxx" />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>بريد المدير (لاستقبال التنبيهات)</label>
              <input type="email" value={settings.adminEmail || ""} onChange={e => setSettings({...settings, adminEmail: e.target.value})} className={inputStyle} />
            </div>
            <div className="md:col-span-2">
              <label className={labelStyle}>⏰ وقت فحص الغياب التلقائي</label>
              <input type="time" required value={settings.absenceCheckTime || "10:00"} onChange={e => setSettings({...settings, absenceCheckTime: e.target.value})} className={inputStyle} />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-orange-500">
          <h3 className="text-xl font-bold text-orange-600 mb-6 flex items-center gap-2">📍 الموقع الجغرافي</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="number" step="any" required value={settings.companyLat} onChange={e => setSettings({...settings, companyLat: e.target.value})} className={inputStyle} placeholder="Latitude" />
            <input type="number" step="any" required value={settings.companyLng} onChange={e => setSettings({...settings, companyLng: e.target.value})} className={inputStyle} placeholder="Longitude" />
          </div>
          <button type="button" onClick={getLocation} className="mt-4 text-orange-600 hover:text-orange-700 font-bold flex items-center gap-2 transition">📍 اضغط هنا لتحديد موقعك الحالي تلقائياً</button>
          <div className="mt-6">
            <label className={labelStyle}>نطاق السماح (بالمتر)</label>
            <input type="number" required value={settings.allowedRadius} onChange={e => setSettings({...settings, allowedRadius: e.target.value})} className={inputStyle} />
          </div>
        </GlassCard>

        <GlassCard className="border-l-4 border-purple-500">
          <h3 className="text-xl font-bold text-purple-600 mb-6 flex items-center gap-2">⚡ إعدادات QR</h3>
          <label className={labelStyle}>سرعة تحديث الكود (ملي ثانية)</label>
          <input type="number" required value={settings.qrRefreshRate} onChange={e => setSettings({...settings, qrRefreshRate: e.target.value})} className={inputStyle} />
          <p className="text-xs text-gray-400 mt-2">مثال: 5000 = 5 ثواني</p>
        </GlassCard>

        <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 text-white font-bold rounded-xl hover:shadow-xl hover:scale-[1.01] transition transform text-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? "جاري الحفظ..." : "💾 حفظ كافة التغييرات"}
        </button>
      </form>
    </div>
  );
};

export default Settings;
