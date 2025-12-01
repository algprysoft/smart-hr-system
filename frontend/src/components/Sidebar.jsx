import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') setDeferredPrompt(null);
      });
    } else {
      alert("💡 لتثبيت التطبيق:\n1. اضغط على خيارات المتصفح (⋮)\n2. اختر 'Install App' أو 'Add to Home screen'");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user) return null;

  const menuItems = [
    { path: "/dashboard", label: "🏠 الرئيسية", roles: ["admin", "employee"] },
    { path: "/employees", label: "👥 الموظفين", roles: ["admin", "hr"] },
    { path: "/leaves", label: "🏖️ الإجازات", roles: ["admin", "employee", "hr"] },
    { path: "/reports", label: "📊 التقارير", roles: ["admin", "hr"] },
    { path: "/finance", label: "💰 المالية", roles: ["admin", "employee"] }, 
    { path: "/salaries", label: "💵 الرواتب", roles: ["admin"] },
    { path: "/shifts", label: "🕰️ الورديات", roles: ["admin"] },
    { path: "/logs", label: "🕵️‍♂️ السجلات", roles: ["admin"] },
    { path: "/settings", label: "⚙️ الإعدادات", roles: ["admin"] },
    { path: "/qr-station", label: "🖥️ محطة QR", roles: ["admin"] },
    { path: "/live-map", label: "🛰️ الخريطة الحية", roles: ["admin"] },
    { path: "/profile", label: "👤 الملف الشخصي", roles: ["admin", "employee", "hr"] },
  ];

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`} onClick={toggleSidebar}></div>

      <div className={`
        fixed top-0 right-0 h-full w-72 bg-slate-900 dark:bg-gray-950 text-white z-[70] 
        transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full"} lg:translate-x-0 lg:static lg:h-screen
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Smart HR 🚀</h1>
            <p className="text-xs text-slate-400 mt-1">نظام إدارة الموارد</p>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white text-2xl p-2">✕</button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {menuItems.map((item, index) => {
            if (!item.roles.includes(user.role)) return null;
            const isActive = location.pathname === item.path;
            return (
              <div key={index} onClick={() => { navigate(item.path); if(window.innerWidth < 1024) toggleSidebar(); }} className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 font-medium ${isActive ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg translate-x-[-5px]" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                <span className="text-lg">{item.label.split(' ')[0]}</span>
                <span>{item.label.split(' ').slice(1).join(' ')}</span>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900 dark:bg-gray-950 shrink-0">
          <button onClick={handleInstallClick} className="w-full mb-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white text-sm font-bold shadow hover:scale-[1.02] transition flex justify-center items-center gap-2 border border-white/10">
            <span>📲</span> تثبيت التطبيق
          </button>
          <button onClick={() => setDarkMode(!darkMode)} className="w-full mb-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-yellow-400 text-sm font-bold transition flex justify-center items-center gap-2 border border-slate-700">
            {darkMode ? "☀️ وضع النهار" : "🌙 وضع الليل"}
          </button>
          <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold shrink-0">{user.name.charAt(0)}</div>
                <div className="truncate"><p className="text-sm font-bold truncate text-white">{user.name.split(' ')[0]}</p><p className="text-[10px] text-slate-400">{user.role}</p></div>
            </div>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 p-1 transition" title="تسجيل خروج"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
