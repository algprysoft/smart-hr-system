import { useState, useEffect } from 'react';
import Sidebar from "./Sidebar";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import { useLocation, useNavigate } from 'react-router-dom';

const Layout = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if(!user) return;

    const socket = io('https://smart-hr-api.onrender.com');
    socket.on('new_notification', (data) => {
      if ((data.role === 'admin' && user?.role === 'admin') || (data.userId === user?.id)) {
        toast.info(data.message);
        new Audio('/notification.mp3').play().catch(()=>{});
      }
    });

    return () => socket.disconnect();
  }, [user]);

  const mobileMenu = [
    { path: "/dashboard", icon: "🏠", label: "الرئيسية" },
    { path: "/leaves", icon: "🏖️", label: "الإجازات" },
    { path: "/profile", icon: "👤", label: "ملفي" },
  ];
  if(user?.role === 'admin') mobileMenu.splice(1, 0, { path: "/employees", icon: "👥", label: "الموظفين" });
  if (user?.role === 'employee') mobileMenu.splice(1, 0, { path: "/dashboard", icon: "📍", label: "تسجيل" });

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans overflow-hidden" dir="rtl">
      <ToastContainer theme="colored" position="top-left" />
      
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex flex-col h-full relative">
        
        <header className="lg:hidden bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700 p-4 flex justify-between items-center z-30 shrink-0">
            <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <h1 className="font-bold text-slate-800 dark:text-white text-lg">Smart HR</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-white hover:bg-slate-200 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-24 lg:pb-8 print-container scroll-smooth">
          {children}
        </main>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t dark:border-slate-700 flex justify-around items-center p-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-40 no-print">
            {mobileMenu.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                    <button 
                        key={index}
                        onClick={() => navigate(item.path)}
                        className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all duration-300
                            ${isActive ? 'text-blue-600 dark:text-blue-400 -translate-y-1' : 'text-slate-400 hover:text-slate-600'}
                        `}
                    >
                        <span className={`text-2xl mb-1 ${isActive ? 'scale-110' : ''}`}>{item.icon}</span>
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </button>
                )
            })}
        </div>

      </div>
    </div>
  );
};

export default Layout;
