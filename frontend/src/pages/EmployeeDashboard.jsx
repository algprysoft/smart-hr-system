import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { Html5QrcodeScanner } from "html5-qrcode"; 
import io from 'socket.io-client';

const EmployeeDashboard = ({ user }) => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  
  const [status, setStatus] = useState("loading"); 
  const [attendanceTime, setAttendanceTime] = useState(null);
  const [msg, setMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSelfie, setShowSelfie] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const [locationPermission, setLocationPermission] = useState(() => navigator.geolocation ? "pending" : "denied");

  const formatTime12 = (time24) => {
    if (!time24) return null;
    const [h, m] = time24.split(':');
    const d = new Date();
    d.setHours(h);
    d.setMinutes(m);
    return d.toLocaleTimeString('ar-EG', { hour: 'numeric', minute: 'numeric', hour12: true });
  };

  useEffect(() => {
    if (locationPermission === "denied") return;
    const socket = io('https://smart-hr-api.onrender.com');
    navigator.geolocation.getCurrentPosition(
        (pos) => { setLocationPermission("granted"); setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); },
        (err) => { console.error(err); setLocationPermission("denied"); }
    );
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationPermission("granted");
        setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        socket.emit('send_location', { userId: user.id, name: user.name, lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => { console.error(err); setLocationPermission("denied"); },
      { enableHighAccuracy: true }
    );
    return () => { navigator.geolocation.clearWatch(watchId); socket.disconnect(); };
  }, [user, locationPermission]);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://smart-hr-api.onrender.com/api/attendance/status", { headers: { Authorization: `Bearer ${token}` } });
        setStatus(res.data.status);
        if (res.data.checkInTime) setAttendanceTime(formatTime12(res.data.checkInTime));
      } catch (err) { console.error(err); }
    };
    if (locationPermission === 'granted') fetchStatus();
  }, [refreshKey, locationPermission]); 

  const handleQrSubmit = useCallback(async (qrContent) => {
    setMsg("جاري التحقق...");
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post("https://smart-hr-api.onrender.com/api/attendance/qr-check-in", { qrContent, latitude: currentLocation.lat, longitude: currentLocation.lng }, { headers: { Authorization: `Bearer ${token}` } });
        setMsg(res.data.message); setRefreshKey(p => p+1);
        new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play().catch(()=>{});
    } catch (err) { console.error(err); setMsg(err.response?.data?.message || "فشل"); }
  }, [currentLocation]);

  useEffect(() => {
    if (showScanner && currentLocation) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);
      scanner.render((decodedText) => { scanner.clear(); setShowScanner(false); handleQrSubmit(decodedText); }, (err) => console.warn(err));
      return () => scanner.clear().catch(() => {});
    }
  }, [showScanner, currentLocation, handleQrSubmit]);

  const captureSelfie = async () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    const blob = await (await fetch(imageSrc)).blob();
    const formData = new FormData();
    formData.append('image', blob, 'selfie.jpg');
    formData.append('latitude', currentLocation.lat);
    formData.append('longitude', currentLocation.lng);
    setShowSelfie(false);
    setMsg("جاري الرفع...");
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post("https://smart-hr-api.onrender.com/api/attendance/check-in", formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });
        setMsg(res.data.message); setRefreshKey(p => p+1);
        new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg").play().catch(()=>{});
    } catch (err) { console.error(err); setMsg(err.response?.data?.message || "فشل"); }
  };

  const handleCheckOut = async () => {
    try {
        const token = localStorage.getItem("token");
        const res = await axios.post("https://smart-hr-api.onrender.com/api/attendance/check-out", {}, { headers: { Authorization: `Bearer ${token}` } });
        setMsg(res.data.message); setRefreshKey(p => p+1);
    } catch (err) { console.error(err); setMsg("فشل الانصراف"); }
  };

  if (locationPermission === 'denied') return <div className="h-screen flex flex-col items-center justify-center bg-red-50 text-center p-6"><div className="text-6xl mb-4">🚫</div><h2 className="text-3xl font-bold text-red-600 mb-2">صلاحية الموقع مطلوبة!</h2><p className="text-gray-600 max-w-md">لا يمكنك استخدام النظام دون تفعيل الـ GPS.</p><button onClick={() => window.location.reload()} className="mt-6 bg-red-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-red-700">تحديث الصفحة 🔄</button></div>;
  if (locationPermission === 'pending') return <div className="h-screen flex items-center justify-center text-xl font-bold text-blue-600">جاري التحقق من الموقع... 🛰️</div>;

  return (
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">مرحباً، {user.name} 👋</h1>
      <p className="text-gray-500 mb-6">نظام الحضور الذكي</p>
      {msg && <div className="bg-blue-100 text-blue-700 p-3 rounded-lg mb-6 inline-block font-bold">{msg}</div>}

      {showSelfie && <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50"><Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="rounded-lg mb-4 w-64 h-64 object-cover" /><div className="flex gap-2"><button onClick={captureSelfie} className="bg-green-500 text-white px-6 py-2 rounded font-bold">التقاط</button><button onClick={() => setShowSelfie(false)} className="bg-red-500 text-white px-6 py-2 rounded font-bold">إلغاء</button></div></div>}
      {showScanner && <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50"><div className="bg-white p-4 rounded-xl w-80"><h3 className="mb-4 font-bold text-gray-700">امسح الكود</h3><div id="reader"></div><button onClick={() => setShowScanner(false)} className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded font-bold">إغلاق</button></div></div>}

      <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md mx-auto border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-700">حالتك اليوم</h3>
        {status === "not_checked_in" && <div className="space-y-3"><button onClick={() => setShowSelfie(true)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 flex justify-center gap-2 items-center transition">📸 تسجيل بالسيلفي</button><div className="text-gray-400 font-bold">- أو -</div><button onClick={() => setShowScanner(true)} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 flex justify-center gap-2 items-center transition">📱 مسح كود QR</button></div>}
        {status === "checked_in" && <div><p className="text-green-600 font-bold mb-4">✅ تم الدخول الساعة: {attendanceTime}</p><button onClick={handleCheckOut} className="w-full py-3 bg-red-500 text-white rounded-full font-bold hover:bg-red-600 transition">👋 تسجيل انصراف</button></div>}
        {status === "checked_out" && <p className="text-gray-500">انتهى يوم العمل. شكراً! 💙</p>}
        
        <hr className="my-6 border-gray-100"/>
        
        {/* ✅ الأزرار الجديدة (إجازة + سلفة) */}
        <div className="flex gap-3">
            <button onClick={() => navigate("/leaves")} className="flex-1 py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition shadow-sm flex justify-center items-center gap-2">
                🏖️ إجازة
            </button>
            <button onClick={() => navigate("/finance")} className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-bold hover:bg-blue-600 transition shadow-sm flex justify-center items-center gap-2">
                💸 سلفة
            </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
