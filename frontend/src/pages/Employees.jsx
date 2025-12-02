import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL, SERVER_URL } from "../config"; // ✅ استخدام الرابط الموحد

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [msg, setMsg] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmployees();
  }, [refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = new FormData(); // لدعم الصور
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    try {
      if (isEditing) {
        await axios.put(`${API_URL}/users/${currentUser.id}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMsg("تم التحديث ✅");
      } else {
        await axios.post(`${API_URL}/users`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMsg("تمت الإضافة ✅");
      }
      setFormData({ name: "", email: "", password: "", role: "employee" });
      setIsEditing(false);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      setMsg("فشل: " + (err.response?.data?.message || "خطأ"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("حذف نهائي؟")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefreshKey((k) => k + 1);
    } catch (err) {
      alert("فشل الحذف");
      console.error(err); // أضف هذا السطر لاستخدام المتغير err
    }
  };

  const startEdit = (emp) => {
    setIsEditing(true);
    setCurrentUser(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      role: emp.role,
      password: "",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        👥 إدارة الموظفين
      </h2>
      {msg && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4">{msg}</div>
      )}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm mb-8">
        <h3 className="text-xl font-bold text-gray-700 dark:text-white mb-4">
          {isEditing ? "تعديل" : "إضافة موظف"}
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="الاسم"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="p-2 border rounded dark:bg-slate-700 dark:text-white"
          />
          <input
            type="email"
            placeholder="البريد"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="p-2 border rounded dark:bg-slate-700 dark:text-white"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            required={!isEditing}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="p-2 border rounded dark:bg-slate-700 dark:text-white"
          />

          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="p-2 border rounded dark:bg-slate-700 dark:text-white"
          >
            <option value="employee">موظف</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700"
            >
              حفظ
            </button>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="w-full mt-2 bg-gray-500 text-white py-2 rounded"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-gray-100 dark:bg-slate-900 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="p-4">الصورة</th>
              <th className="p-4">الاسم</th>
              <th className="p-4">الدور</th>
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 dark:text-gray-300">
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b dark:border-slate-700">
                <td className="p-4">
                  {emp.profilePic ? (
                    <img
                      src={`${SERVER_URL}/${emp.profilePic}`}
                      className="w-10 h-10 rounded-full object-cover"
                      alt="img"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      ?
                    </div>
                  )}
                </td>
                <td className="p-4 font-bold">{emp.name}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {emp.role}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <button
                    onClick={() => startEdit(emp)}
                    className="text-blue-500 hover:underline"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-500 hover:underline"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Employees;
