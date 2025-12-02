import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const FlyToLocation = ({ coords }) => {
    const map = useMap();
    useEffect(() => { if (coords) map.flyTo(coords, 18, { duration: 2 }); }, [coords, map]);
    return null;
};

const LiveMap = () => {
  const [employees, setEmployees] = useState({});
  const [selectedLocation, setSelectedLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    // الانضمام لغرفة الشركة
    const socket = io('http://localhost:5005');
    if(user && user.companyId) {
        socket.emit('join_company', user.companyId);
    }

    socket.on('update_map', (data) => {
      setEmployees(prev => {
        const newEmps = { ...prev, [data.userId]: data };
        if (!selectedLocation && Object.keys(prev).length === 0) setSelectedLocation([data.lat, data.lng]);
        return newEmps;
      });
    });
    return () => socket.disconnect();
  }, [selectedLocation]);

  const activeEmployees = Object.values(employees);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-900">
      <div className="w-full md:w-80 bg-white shadow-2xl z-20 flex flex-col border-l">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <h2 className="font-bold">📡 المتصلين ({activeEmployees.length})</h2>
            <button onClick={() => navigate('/dashboard')} className="text-xs bg-slate-700 px-2 py-1 rounded">خروج</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
            {activeEmployees.map(emp => (
                <div key={emp.userId} onClick={() => setSelectedLocation([emp.lat, emp.lng])} className="p-3 bg-white border rounded-lg cursor-pointer hover:bg-blue-50 flex items-center gap-3 shadow-sm">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="font-bold text-gray-800 text-sm">{emp.name}</p>
                </div>
            ))}
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer center={[24.7136, 46.6753]} zoom={5} style={{ height: "100%", width: "100%" }}>
          {/* خريطة جوجل الهجينة (عربي + ساتالايت) */}
          <TileLayer url="http://mt0.google.com/vt/lyrs=y&hl=ar&x={x}&y={y}&z={z}" attribution='&copy; Google Maps' />
          {selectedLocation && <FlyToLocation coords={selectedLocation} />}
          {activeEmployees.map((emp) => (
            <Marker key={emp.userId} position={[emp.lat, emp.lng]}>
              <Popup><strong className="text-blue-600">{emp.name}</strong><br/>مباشر 🟢</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveMap;
