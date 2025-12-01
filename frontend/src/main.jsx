import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import './index.css';

// استيراد مسجل التطبيق
import { registerSW } from 'virtual:pwa-register';

// إعداد التحديث التلقائي للتطبيق
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("يوجد تحديث جديد للنظام. هل تريد التحديث الآن؟")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("التطبيق جاهز للعمل بدون إنترنت (Offline Ready) 📶");
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
