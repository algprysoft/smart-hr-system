import { QRCodeCanvas } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

const DigitalId = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      
      {/* زر العودة */}
      <button onClick={() => navigate('/profile')} className="absolute top-6 left-6 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 no-print">
        ❌ إغلاق
      </button>

      {/* البطاقة */}
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition duration-500 relative print-card">
        
        {/* الجزء العلوي الملون */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                {user.profilePic ? (
                    <img src={`http://localhost:5005/${user.profilePic}`} alt="User" className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover bg-white" />
                ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center text-3xl font-bold">
                        {user.name.charAt(0)}
                    </div>
                )}
            </div>
        </div>

        {/* المحتوى */}
        <div className="pt-16 pb-8 px-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-blue-600 font-medium">{user.role.toUpperCase()}</p>
            
            <div className="mt-6 space-y-2 text-sm text-gray-500">
                <p>📧 {user.email}</p>
                <p>📱 {user.phone || "غير مسجل"}</p>
                <p>📍 {user.address || "غير مسجل"}</p>
            </div>

            <hr className="my-6 border-gray-100" />

            {/* الباركود */}
            <div className="flex justify-center">
                <div className="p-2 border-2 border-dashed border-gray-300 rounded-lg">
                    <QRCodeCanvas value={`ID:${user.id}-${user.email}`} size={100} />
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">امسح للكود للتحقق</p>
        </div>
      </div>

      {/* زر الطباعة */}
      <button onClick={() => window.print()} className="mt-8 bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition no-print">
        🖨️ طباعة / تحميل البطاقة
      </button>

      <style>{`
        @media print {
            body * { visibility: hidden; }
            .print-card, .print-card * { visibility: visible; }
            .print-card { position: absolute; top: 0; left: 0; width: 100%; margin: 0; box-shadow: none; }
            .no-print { display: none; }
        }
      `}</style>
    </div>
  );
};

export default DigitalId;
