import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import GlassCard from "../components/ui/GlassCard";
import { ElegantTable, TableHead, TableHeader, TableRow, TableCell } from "../components/ui/ElegantTable";

const Finance = () => {
  const navigate = useNavigate();
  const [advances, setAdvances] = useState([]);
  const [bonuses, setBonuses] = useState([]);
  const [users, setUsers] = useState([]); 
  const [tab, setTab] = useState("advances");
  const [refresh, setRefresh] = useState(0);
  
  const [advanceForm, setAdvanceForm] = useState({ amount: "", reason: "" });
  const [bonusForm, setBonusForm] = useState({ userId: "", amount: "", reason: "" });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const advRes = await axios.get("http://localhost:5005/api/finance/advances", { headers });
            setAdvances(advRes.data);

            if (user.role === 'admin') {
                const bonRes = await axios.get("http://localhost:5005/api/finance/bonuses", { headers });
                setBonuses(bonRes.data);
                const usersRes = await axios.get("http://localhost:5005/api/users", { headers });
                setUsers(usersRes.data);
            }
        } catch (err) { console.error(err); }
    };
    fetchData();
  }, [refresh, user.role, token]);

  const handleRequestAdvance = async (e) => {
    e.preventDefault();
    try {
        await axios.post("http://localhost:5005/api/finance/advance", advanceForm, { headers: { Authorization: `Bearer ${token}` } });
        alert("تم إرسال طلب السلفة ✅");
        setAdvanceForm({ amount: "", reason: "" });
        setRefresh(p => p+1);
    } catch (err) { console.error(err); alert("فشل الطلب"); }
  };

  const handleDeleteAdvance = async (id) => {
    if(!window.confirm("هل أنت متأكد من حذف الطلب؟")) return;
    try {
        await axios.delete(`http://localhost:5005/api/finance/advance/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setRefresh(p => p+1);
    } catch (err) { 
        console.error(err);
        alert("فشل الحذف"); 
    }
  };

  const handleAddBonus = async (e) => {
    e.preventDefault();
    try {
        await axios.post("http://localhost:5005/api/finance/bonus", bonusForm, { headers: { Authorization: `Bearer ${token}` } });
        alert("تمت الإضافة ✅");
        setBonusForm({ userId: "", amount: "", reason: "" });
        setRefresh(p => p+1);
    } catch (err) { 
        console.error(err);
        alert("فشل الإضافة"); 
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
        await axios.put(`http://localhost:5005/api/finance/advance/${id}`, { status }, { headers: { Authorization: `Bearer ${token}` } });
        setRefresh(p => p+1);
    } catch (err) { 
        console.error(err);
        alert("خطأ"); 
    }
  };

  const inputStyle = "p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-white outline-none transition-all w-full focus:ring-2 focus:ring-blue-500";

  if (!user) return <div className="p-10 text-center">جاري التحميل...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">💰 النظام المالي</h2>
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-white px-5 py-2 rounded-full font-bold transition"><span>الرئيسية</span> 🏠</button>
      </div>

      <div className="flex gap-2 mb-8 bg-white dark:bg-slate-800 p-1 rounded-xl w-fit shadow-sm border border-gray-100 dark:border-slate-700">
        <button onClick={() => setTab("advances")} className={`px-6 py-2 rounded-lg font-bold transition-all ${tab === 'advances' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>💸 السلف</button>
        {user.role === 'admin' && <button onClick={() => setTab("bonuses")} className={`px-6 py-2 rounded-lg font-bold transition-all ${tab === 'bonuses' ? 'bg-purple-600 text-white shadow' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'}`}>🎁 المكافآت</button>}
      </div>

      {tab === 'advances' && (
        <div className="space-y-8">
            <GlassCard className="border-l-4 border-blue-500">
                <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-4">طلب سلفة جديدة</h3>
                <form onSubmit={handleRequestAdvance} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-48">
                        <label className="block text-sm mb-1 text-gray-500 dark:text-gray-400">المبلغ (ريال)</label>
                        <input type="number" placeholder="0.00" required value={advanceForm.amount} onChange={e => setAdvanceForm({...advanceForm, amount: e.target.value})} className={inputStyle} />
                    </div>
                    <div className="w-full flex-1">
                        <label className="block text-sm mb-1 text-gray-500 dark:text-gray-400">السبب</label>
                        <input type="text" placeholder="سبب السلفة..." required value={advanceForm.reason} onChange={e => setAdvanceForm({...advanceForm, reason: e.target.value})} className={inputStyle} />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow transition">إرسال</button>
                </form>
            </GlassCard>

            <ElegantTable>
                <TableHead><TableHeader>الموظف</TableHeader><TableHeader>المبلغ</TableHeader><TableHeader>السبب</TableHeader><TableHeader>الحالة</TableHeader><TableHeader>إجراء</TableHeader></TableHead>
                <tbody>
                    {advances.map(adv => (
                        <TableRow key={adv.id}>
                            <TableCell className="font-bold text-gray-800 dark:text-white">{adv.User?.name || "غير معروف"}</TableCell>
                            <TableCell className="text-blue-600 font-bold">{adv.amount} ريال</TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">{adv.reason}</TableCell>
                            <TableCell>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${adv.status === 'approved' ? 'bg-green-500' : adv.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}>{adv.status === 'pending' ? 'قيد الانتظار' : adv.status === 'approved' ? 'مقبول' : 'مرفوض'}</span>
                            </TableCell>
                            <TableCell>
                                <div className="flex gap-2 items-center">
                                    {user.role === 'admin' && adv.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleUpdateStatus(adv.id, 'approved')} className="text-green-600 bg-green-100 p-2 rounded hover:bg-green-200">✓</button>
                                            <button onClick={() => handleUpdateStatus(adv.id, 'rejected')} className="text-red-600 bg-red-100 p-2 rounded hover:bg-red-200">✕</button>
                                        </>
                                    )}
                                    
                                    {adv.status === 'pending' && (user.role === 'admin' || user.id === adv.userId) && (
                                        <button onClick={() => handleDeleteAdvance(adv.id)} className="text-gray-500 hover:text-red-500 p-2" title="حذف الطلب">🗑️</button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    {advances.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-gray-400">لا توجد طلبات</td></tr>}
                </tbody>
            </ElegantTable>
        </div>
      )}

      {tab === 'bonuses' && user.role === 'admin' && (
        <div className="space-y-8">
            <GlassCard className="border-l-4 border-purple-500">
                <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-4">إضافة مكافأة</h3>
                <form onSubmit={handleAddBonus} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-64">
                        <label className="block text-sm mb-1 text-gray-500 dark:text-gray-400">الموظف</label>
                        <select className={inputStyle} required value={bonusForm.userId} onChange={e => setBonusForm({...bonusForm, userId: e.target.value})}>
                            <option value="">-- اختر --</option>
                            {users.length > 0 ? (
                                users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))
                            ) : (
                                <option disabled>لا يوجد موظفين</option>
                            )}
                        </select>
                    </div>
                    <div className="w-full md:w-40">
                        <label className="block text-sm mb-1 text-gray-500 dark:text-gray-400">المبلغ</label>
                        <input type="number" placeholder="0.00" required value={bonusForm.amount} onChange={e => setBonusForm({...bonusForm, amount: e.target.value})} className={inputStyle} />
                    </div>
                    <div className="w-full flex-1">
                        <label className="block text-sm mb-1 text-gray-500 dark:text-gray-400">السبب</label>
                        <input type="text" placeholder="سبب المكافأة..." required value={bonusForm.reason} onChange={e => setBonusForm({...bonusForm, reason: e.target.value})} className={inputStyle} />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow transition">إضافة</button>
                </form>
            </GlassCard>

            <ElegantTable>
                <TableHead><TableHeader>الموظف</TableHeader><TableHeader>المبلغ</TableHeader><TableHeader>السبب</TableHeader><TableHeader>التاريخ</TableHeader></TableHead>
                <tbody>
                    {bonuses.map(bon => (
                        <TableRow key={bon.id}>
                            <TableCell className="font-bold text-gray-800 dark:text-white">{bon.User?.name}</TableCell>
                            <TableCell className="text-green-600 font-bold">+{bon.amount} ريال</TableCell>
                            <TableCell className="text-gray-600 dark:text-gray-400">{bon.reason}</TableCell>
                            <TableCell className="text-gray-500 text-sm">{bon.date}</TableCell>
                        </TableRow>
                    ))}
                    {bonuses.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-400">لا توجد مكافآت</td></tr>}
                </tbody>
            </ElegantTable>
        </div>
      )}
    </div>
  );
};

export default Finance;
