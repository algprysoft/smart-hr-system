import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Leaves from "./pages/Leaves";
import Reports from "./pages/Reports";
import Salaries from "./pages/Salaries";
import Shifts from "./pages/Shifts";
import Profile from "./pages/Profile";
import QrStation from "./pages/QrStation";
import SystemLogs from "./pages/SystemLogs";
import Settings from "./pages/Settings";
import LiveMap from "./pages/LiveMap";
import DigitalId from "./pages/DigitalId";
import Finance from "./pages/Finance"; // <--- 1. استدعاء الصفحة الجديدة
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/leaves" element={<Leaves />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/salaries" element={<Salaries />} />
      <Route path="/shifts" element={<Shifts />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/qr-station" element={<QrStation />} />
      <Route path="/logs" element={<SystemLogs />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/live-map" element={<LiveMap />} />
      <Route path="/digital-id" element={<DigitalId />} />
      
      {/* 2. تفعيل الرابط */}
      <Route path="/finance" element={<Finance />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
