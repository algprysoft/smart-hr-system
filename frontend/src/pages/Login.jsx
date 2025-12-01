import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import GlassCard from "../components/ui/GlassCard"; // التصميم الجديد

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [loading, setLoading] = useState(false);
  
  // OTP states
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempUserId, setTempUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    getFingerprint();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("https://smart-hr-api.onrender.com/api/auth/login", {
        email,
        password,
        deviceId
      });

      if (response.data.token) {
        finalizeLogin(response.data);
      }

    } catch (err) {
      // إذا طلب السيرفر OTP
      if (err.response && err.response.status === 403 && err.response.data.requireOtp) {
        setShowOtp(true);
        setTempUserId(err.response.data.userId);
        setError("⚠️ جهاز جديد! أدخل الرمز المرسل لبريدك");
      } else {
        setError(err.response?.data?.message || "خطأ في الاتصال");
      }
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const response = await axios.post("https://smart-hr-api.onrender.com/api/auth/verify-otp", {
            userId: tempUserId,
            otp,
            deviceId
        });
        finalizeLogin(response.data);
    } catch (err) {
        setError(err.response?.data?.message || "رمز خاطئ");
    } finally {
        setLoading(false);
    }
  };

  const finalizeLogin = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden" dir="rtl">
      
      {/* خلفية متحركة بسيطة */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <GlassCard className="w-full max-w-md p-8 z-10 border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                Smart HR 🚀
            </h1>
            <p className="text-gray-400 text-sm">نظام إدارة الموارد البشرية الذكي</p>
        </div>
        
        {error && <div className={`p-3 rounded-lg mb-6 text-center text-sm font-bold ${showOtp ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}>{error}</div>}
        
        {!showOtp ? (
            <form onSubmit={handleLogin} className="space-y-5">
                <div>
                    <label className="block text-gray-300 mb-2 text-sm">البريد الإلكتروني</label>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        placeholder="name@company.com"
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-2 text-sm">كلمة المرور</label>
                    <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full p-3 bg-white/5 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        placeholder="••••••••"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3.5 rounded-xl font-bold transition shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
                >
                    {loading ? "جاري التحقق..." : "تسجيل الدخول"}
                </button>
            </form>
        ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center">
                    <p className="text-gray-300 mb-4">⚠️ جهاز جديد! أدخل الرمز المرسل لبريدك:</p>
                    <input 
                        type="text" 
                        placeholder="XXXX" 
                        required 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        className="w-full p-4 bg-white/5 border border-yellow-500/50 rounded-lg text-white text-center text-3xl tracking-[10px] font-mono focus:outline-none focus:border-yellow-500 transition"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white py-3.5 rounded-xl font-bold transition shadow-lg transform hover:scale-[1.02] disabled:opacity-50"
                >
                    {loading ? "جاري التفعيل..." : "تفعيل الجهاز ودخول"}
                </button>
            </form>
        )}
      </GlassCard>
    </div>
  );
};

export default Login;
