import React from 'react';
import { Server, Smartphone, Cloud, Layers, CheckCircle } from 'lucide-react';

const ArchitectureInfo: React.FC = () => {
  return (
    <div className="pb-24 bg-slate-50 min-h-screen px-4 pt-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">โครงสร้างระบบและวิธี Deploy</h1>

      <div className="space-y-6">
        {/* Architecture */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-3 text-emerald-600">
            <Layers size={24} className="mr-2" />
            <h2 className="text-lg font-bold">System Architecture</h2>
          </div>
          <p className="text-slate-600 text-sm mb-4">
            โครงสร้างแบบ <strong>Serverless / Jamstack</strong> เพื่อประหยัดต้นทุนและดูแลรักษาง่าย
          </p>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start">
              <Smartphone size={16} className="mt-1 mr-2 text-slate-400" />
              <div>
                <span className="font-semibold">Frontend (PWA):</span> React + Tailwind (รันบน Browser มือถือได้ทันที ไม่ต้องลงแอป)
              </div>
            </li>
            <li className="flex items-start">
              <Cloud size={16} className="mt-1 mr-2 text-slate-400" />
              <div>
                <span className="font-semibold">Backend (Optional):</span> ใช้ Firebase Firestore เก็บข้อมูลทรัพย์จริง (ใน Demo นี้ใช้ Mock Data)
              </div>
            </li>
            <li className="flex items-start">
              <Server size={16} className="mt-1 mr-2 text-slate-400" />
              <div>
                <span className="font-semibold">Integration:</span> เชื่อมต่อ LINE OA ผ่าน URL Scheme (Client-side) และ Webhook (Server-side)
              </div>
            </li>
          </ul>
        </div>

        {/* Code Explanation */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-3 text-blue-600">
            <Smartphone size={24} className="mr-2" />
            <h2 className="text-lg font-bold">ฟีเจอร์สำคัญในโค้ด</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start">
               <CheckCircle size={16} className="mt-1 mr-2 text-green-500" />
               <div>
                 <strong>เปิดกล้อง:</strong> ใช้ <code>&lt;input type="file" capture="environment" /&gt;</code> ซึ่งเป็นมาตรฐาน HTML5 ที่เรียก Native Camera ของมือถือได้ทันที
               </div>
            </li>
             <li className="flex items-start">
               <CheckCircle size={16} className="mt-1 mr-2 text-green-500" />
               <div>
                 <strong>ดึง GPS:</strong> ใช้ <code>navigator.geolocation</code> API ของ Browser
               </div>
            </li>
             <li className="flex items-start">
               <CheckCircle size={16} className="mt-1 mr-2 text-green-500" />
               <div>
                 <strong>LINE Integration:</strong> ใช้ Deep Link <code>https://line.me/R/oaMessage</code> เพื่อเปิด LINE พร้อมข้อความที่เตรียมไว้
               </div>
            </li>
          </ul>
        </div>

        {/* Deployment */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center mb-3 text-purple-600">
            <Cloud size={24} className="mr-2" />
            <h2 className="text-lg font-bold">วิธี Deploy (แนะนำ)</h2>
          </div>
          <div className="text-sm text-slate-700 space-y-2">
            <p>1. <strong>Vercel / Netlify:</strong> เหมาะที่สุดสำหรับ React App ฟรีและเร็ว</p>
            <p className="pl-4 text-slate-500">- เชื่อมต่อกับ GitHub Repo</p>
            <p className="pl-4 text-slate-500">- กด Deploy ได้เลย (Build command: <code>npm run build</code>)</p>
            
            <p className="mt-2">2. <strong>Branding (Icon/Splash):</strong></p>
             <p className="pl-4 text-slate-500">- ใช้ <code>vite-pwa-plugin</code> เพื่อทำเป็น Progressive Web App (PWA)</p>
             <p className="pl-4 text-slate-500">- ผู้ใช้สามารถกด "Add to Home Screen" ได้ จะได้ไอคอนเหมือนแอปจริง</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ArchitectureInfo;