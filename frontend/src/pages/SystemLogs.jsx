import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ElegantTable, TableHead, TableHeader, TableRow, TableCell } from "../components/ui/ElegantTable";

const SystemLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://smart-hr-api.onrender.com/api/logs", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLogs(res.data);
      } catch (err) { console.error(err); }
    };
    fetchLogs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">🕵️‍♂️ سجلات النظام (Audit Logs)</h2>
        <button onClick={() => navigate("/dashboard")} className="bg-gray-200 dark:bg-slate-700 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white font-bold transition">⬅️ عودة</button>
      </div>

      <ElegantTable>
        <TableHead>
            <TableHeader>الوقت</TableHeader>
            <TableHeader>المستخدم</TableHeader>
            <TableHeader>الحدث</TableHeader>
            <TableHeader>التفاصيل</TableHeader>
            <TableHeader>IP</TableHeader>
        </TableHead>
        <tbody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono text-xs text-blue-600 dark:text-blue-400">{new Date(log.createdAt).toLocaleString('en-GB')}</TableCell>
                <TableCell className="font-bold text-gray-800 dark:text-white">{log.userName}</TableCell>
                <TableCell>
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-600">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-gray-500 dark:text-gray-400 text-sm max-w-md truncate">{log.details}</TableCell>
                <TableCell className="font-mono text-xs text-gray-400">{log.ipAddress}</TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">لا توجد سجلات مسجلة</td></tr>}
        </tbody>
      </ElegantTable>
    </div>
  );
};

export default SystemLogs;
