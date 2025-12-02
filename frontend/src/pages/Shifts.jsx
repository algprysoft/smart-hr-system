import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import {
  ElegantTable,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "../components/ui/ElegantTable";

const Shifts = () => {
  const navigate = useNavigate();
  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [newShift, setNewShift] = useState({
    name: "",
    startTime: "",
    endTime: "",
  });
  const [assignData, setAssignData] = useState({ userId: "", shiftId: "" });
  const [msg, setMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [shiftsRes, empsRes] = await Promise.all([
          axios.get("http://localhost:5005/api/shifts", config),
          axios.get("http://localhost:5005/api/users", config),
        ]);
        setShifts(shiftsRes.data);
        setEmployees(empsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [refreshKey]);

  const formatTime = (time) =>
    new Date("1970-01-01T" + time).toLocaleTimeString("ar-EG", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5005/api/shifts", newShift, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ تم الإنشاء");
      setNewShift({ name: "", startTime: "", endTime: "" });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error(err); // ✅ تم الإصلاح
      setMsg("❌ فشل");
    }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5005/api/shifts/assign", assignData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsg("✅ تم التعيين");
    } catch (err) {
      console.error(err); // ✅ تم الإصلاح
      setMsg("❌ فشل");
    }
  };

  const inputStyle =
    "w-full p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-800 dark:text-white";

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          🕰️ إدارة الورديات
        </h2>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-xl font-bold dark:text-white"
        >
          الرئيسية 🏠
        </button>
      </div>
      {msg && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded mb-6 text-center font-bold">
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard>
          <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-4">
            ➕ إضافة وردية
          </h3>
          <form onSubmit={handleCreateShift} className="space-y-4">
            <input
              type="text"
              placeholder="اسم الوردية"
              required
              value={newShift.name}
              onChange={(e) =>
                setNewShift({ ...newShift, name: e.target.value })
              }
              className={inputStyle}
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="time"
                required
                value={newShift.startTime}
                onChange={(e) =>
                  setNewShift({ ...newShift, startTime: e.target.value })
                }
                className={inputStyle}
              />
              <input
                type="time"
                required
                value={newShift.endTime}
                onChange={(e) =>
                  setNewShift({ ...newShift, endTime: e.target.value })
                }
                className={inputStyle}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold hover:bg-orange-600"
            >
              حفظ
            </button>
          </form>
        </GlassCard>

        <GlassCard>
          <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-4">
            📋 القائمة
          </h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-700 rounded-xl border dark:border-gray-600"
              >
                <span className="font-bold text-gray-800 dark:text-white">
                  {shift.name}
                </span>
                <span className="text-xs bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                  {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="mt-8">
        <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-4">
          👤 تعيين لموظف
        </h3>
        <form onSubmit={handleAssignShift} className="flex gap-4 items-end">
          <select
            className={inputStyle}
            required
            onChange={(e) =>
              setAssignData({ ...assignData, userId: e.target.value })
            }
          >
            <option value="">اختر الموظف</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
          <select
            className={inputStyle}
            required
            onChange={(e) =>
              setAssignData({ ...assignData, shiftId: e.target.value })
            }
          >
            <option value="">اختر الوردية</option>
            {shifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700"
          >
            تعيين
          </button>
        </form>
      </GlassCard>
    </div>
  );
};

export default Shifts;
