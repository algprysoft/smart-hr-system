import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
      <h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">أوووه! الصفحة غير موجودة 🙈</h2>
      <p className="text-gray-500 mb-8">يبدو أنك ضللت الطريق. لا تقلق، يمكنك العودة للمنزل.</p>
      <button 
        onClick={() => navigate("/")}
        className="px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition shadow-lg"
      >
        العودة للرئيسية 🏠
      </button>
    </div>
  );
};

export default NotFound;
