import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

// إصلاح أيقونة الدبوس
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const FlyToLocation = ({ coords }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 18, { duration: 2 }); // تقريب أكثر (Zoom 18) لرؤية البيوت
        }
    }, [coords, map]);
    return null;
};

const LiveMap = () => {
  const [employees, setEmployees] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // 🔍 حالة البحث
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5005');

    socket.on('update_map', (data) => {
      setEmployees(prev => {
        const newEmps = { ...prev, [data.userId]: data };
        if (!selectedLocation && Object.keys(prev).length === 0) {
            setSelectedLocation([data.lat, data.lng]);
        }
        return newEmps;
      });
    });

    return () => socket.disconnect();
  }, [selectedLocation]);

  // 🔍 فلترة الموظفين حسب البحث
  const activeEmployees = Object.values(employees).filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-900">
      
      {/* القائمة الجانبية */}
      <div className="w-full md:w-80 bg-white shadow-2xl z-20 flex flex-col border-l">
        <div className="p-4 bg-slate-900 text-white">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-lg">📡 المتصلين ({activeEmployees.length})</h2>
                <button onClick={() => navigate('/dashboard')} className="text-xs bg-slate-700 px-2 py-1 rounded hover:bg-slate-600">خروج</button>
            </div>
            
            {/* 🔍 حقل البحث */}
            <input 
                type="text" 
                placeholder="بحث عن موظف..." 
                className="w-full p-2 rounded text-black text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
            {activeEmployees.length === 0 && <p className="text-center text-gray-400 mt-4 text-sm">لا يوجد نتائج...</p>}
            
            {activeEmployees.map(emp => (
                <div 
                    key={emp.userId}
                    onClick={() => setSelectedLocation([emp.lat, emp.lng])}
                    className="p-3 bg-white border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition flex items-center gap-3 shadow-sm"
                >
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                        <p className="text-xs text-gray-500">اضغط للمشاهدة 🛰️</p>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* الخريطة */}
      <div className="flex-1 relative">
        <MapContainer center={[24.7136, 46.6753]} zoom={5} style={{ height: "100%", width: "100%" }}>
          
          {/* 🌍 تغيير الطبقة إلى Google Hybrid (قمر صناعي + أسماء الشوارع) */}
          <TileLayer
            url="http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}"
            attribution='&copy; Google Maps'
          />

          {selectedLocation && <FlyToLocation coords={selectedLocation} />}

          {activeEmployees.map((emp) => (
            <Marker key={emp.userId} position={[emp.lat, emp.lng]}>
              <Popup>
                <div className="text-center">
                  <strong className="block text-lg text-blue-600">{emp.name}</strong>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Live 🟢</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
