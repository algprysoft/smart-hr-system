import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlassCard from '../components/ui/GlassCard';

const QrStation = () => {
  const [qrValue, setQrValue] = useState("");
  const [refreshRate, setRefreshRate] = useState(5000);
  const navigate = useNavigate();

  useEffect(() => {
    const getSettings = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://smart-hr-api.onrender.com/api/settings", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRefreshRate(res.data.qrRefreshRate || 5000);
        } catch (err) { console.error(err); }
    };
    getSettings();
  }, []);

  useEffect(() => {
    const generateCode = () => {
      const secret = "SMART-HR-SECRET";
      const time = Date.now();
      setQrValue(`${secret}_${time}`);
    };
    generateCode();
    const interval = setInterval(generateCode, refreshRate);
    return () => clearInterval(interval);
  }, [refreshRate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4" dir="rtl">
      <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Smart HR 🚀</h1>
      <p className="text-gray-400 mb-10 text-xl">امسح الكود لتسجيل الحضور فوراً</p>

      <GlassCard className="relative p-8 bg-white/10 backdrop-blur-lg border-white/20 !rounded-3xl !shadow-2xl">
        <div className="bg-white p-4 rounded-2xl">
            <QRCodeCanvas value={qrValue} size={320} />
        </div>
        {/* شريط العداد التنازلي */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 animate-progress w-full rounded-b-3xl"></div>
      </GlassCard>

      <div className="mt-12 text-center">
        <p className="text-lg font-mono text-yellow-400 mb-6 bg-yellow-400/10 px-4 py-2 rounded-full inline-block border border-yellow-400/20">
            ⚠️ يتجدد الكود تلقائياً كل {refreshRate/1000} ثواني
        </p>
        <br/>
        <button 
            onClick={() => navigate('/dashboard')} 
            className="mt-4 px-8 py-3 border border-gray-600 rounded-full text-gray-400 hover:text-white hover:border-white hover:bg-white/5 transition font-bold"
        >
          العودة للوحة التحكم
        </button>
      </div>
    </div>
  );
};

export default QrStation;
