import React from 'react';
import { ArrowLeft, Cloud, Check, ExternalLink, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SetupPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <button 
        onClick={() => navigate('/login')} 
        className="flex items-center text-slate-500 mb-6 hover:text-emerald-600"
      >
        <ArrowLeft size={20} className="mr-1" />
        กลับไปหน้า Login
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto">
        <div className="bg-blue-600 p-6 text-white">
          <div className="flex items-center mb-2">
            <Cloud size={24} className="mr-2" />
            <h1 className="text-xl font-bold">ตั้งค่า Cloudinary (สำหรับรูปภาพ)</h1>
          </div>
          <p className="text-blue-100 text-sm">
            เราเปลี่ยนมาใช้ Cloudinary แทน Firebase Storage เพื่อให้อัปโหลดง่าย ไม่ติดปัญหา CORS
          </p>
        </div>

        <div className="p-6 space-y-8">

          {/* Step 1 */}
          <div>
            <div className="flex items-center mb-3">
               <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold mr-3">
                 1
               </div>
               <h3 className="font-bold text-slate-800">สมัครและสร้าง Preset</h3>
            </div>
            <ol className="list-decimal ml-16 text-sm text-slate-700 space-y-2 mb-3">
              <li>ไปที่ <a href="https://cloudinary.com/" target="_blank" className="text-blue-600 underline">Cloudinary.com</a> และสมัครสมาชิกฟรี</li>
              <li>ไปที่เมนู <strong>Settings</strong> (รูปเฟือง) &gt; <strong>Upload</strong></li>
              <li>เลื่อนลงมาหาหัวข้อ "Upload presets" กด <strong>Add upload preset</strong></li>
              <li>
                  ตั้งค่าดังนี้:
                  <ul className="list-disc ml-6 mt-1 text-slate-600">
                      <li><strong>Signing Mode:</strong> เลือกเป็น <span className="text-red-600 font-bold">Unsigned</span> (สำคัญมาก!)</li>
                      <li><strong>Upload preset name:</strong> ตั้งชื่อภาษาอังกฤษง่ายๆ (เช่น <code>phayao_upload</code>)</li>
                  </ul>
              </li>
              <li>กด <strong>Save</strong></li>
            </ol>
          </div>
          
          {/* Step 2 */}
          <div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">2</div>
              <h3 className="font-bold text-slate-800">นำค่ามาใส่ในโค้ด</h3>
            </div>
            <p className="text-sm text-slate-600 ml-11 mb-2">
              เปิดไฟล์ <code>src/services/propertyService.ts</code> และแก้ไขค่า 2 ตัวแปรด้านบนสุด:
            </p>
            
            <div className="ml-11 bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto">
<pre>{`// เปลี่ยนค่าตรงนี้ในไฟล์ src/services/propertyService.ts

const CLOUD_NAME = "ชื่อ Cloud Name ของคุณ"; 
// ดูได้ที่หน้า Dashboard (เช่น dxy123abc)

const UPLOAD_PRESET = "ชื่อ Preset ที่เพิ่งสร้าง"; 
// เช่น phayao_upload`}</pre>
            </div>
            <p className="text-sm text-slate-500 ml-11 mt-2">
              *เมื่อแก้ไฟล์เสร็จแล้ว ให้ลองอัปโหลดรูปอีกครั้ง
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
            <Check size={20} className="text-green-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-800 text-sm">ข้อดีของ Cloudinary</h4>
              <p className="text-green-700 text-xs mt-1">
                - ไม่ต้องตั้งค่า CORS ให้ยุ่งยาก<br/>
                - ปรับขนาดรูปอัตโนมัติได้<br/>
                - ฟรี 25 GB (เหลือเฟือสำหรับแอปเริ่มต้น)
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SetupPage;