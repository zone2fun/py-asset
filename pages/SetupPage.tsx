import React from 'react';
import { ArrowLeft, Copy, Check, Terminal, AlertTriangle, Search, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  // Changed to appspot.com which is the common default
  const bucketName = "phayao-assets.appspot.com";
  
  const corsContent = `[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]`;

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
        <div className="bg-amber-500 p-6 text-white">
          <div className="flex items-center mb-2">
            <AlertTriangle size={24} className="mr-2" />
            <h1 className="text-xl font-bold">วิธีแก้ปัญหาอัปโหลดรูปไม่ได้ (CORS Error)</h1>
          </div>
          <p className="text-amber-100 text-sm">
            หากคุณเจอ Error สีแดงๆ ว่า "Access to XMLHttpRequest... blocked by CORS policy" 
            คุณต้องตั้งค่า Firebase Storage ตามขั้นตอนนี้ครับ (ทำครั้งเดียวจบ)
          </p>
        </div>

        <div className="p-6 space-y-8">

          {/* Step 0: Create Bucket */}
          <div>
            <div className="flex items-center mb-3">
               <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold mr-3">
                 1
               </div>
               <h3 className="font-bold text-slate-800">เปิดใช้งาน Storage (ถ้ายังไม่เคยทำ)</h3>
            </div>
             <p className="text-sm text-slate-600 ml-11 mb-2">
              ถ้าพิมพ์คำสั่ง <code>gsutil ls</code> แล้วไม่ขึ้นอะไรเลย ให้ทำขั้นตอนนี้ก่อน:
            </p>
            <ol className="list-decimal ml-16 text-sm text-slate-700 space-y-1 mb-3">
              <li>ไปที่ <a href="https://console.firebase.google.com/project/phayao-assets/storage" target="_blank" className="text-blue-600 underline">Firebase Console &gt; Storage</a></li>
              <li>กดปุ่ม <strong>Get Started</strong> (หรือ "เริ่มใช้งาน")</li>
              <li>กด <strong>Next</strong> (ถัดไป) และ <strong>Done</strong> (เสร็จสิ้น) โดยไม่ต้องแก้ค่าอะไร</li>
              <li>รอจนกว่าจะเห็นหน้าจออัปโหลดไฟล์ (แปลว่าสร้างถังสำเร็จแล้ว)</li>
            </ol>
          </div>
          
          {/* Step 1 */}
          <div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">2</div>
              <h3 className="font-bold text-slate-800">เปิด Cloud Shell</h3>
            </div>
            <p className="text-sm text-slate-600 ml-11 mb-2">
              คลิกที่ลิงก์นี้เพื่อเปิดหน้าต่างคำสั่ง (Terminal) ของ Google:
            </p>
            <a 
              href={`https://console.cloud.google.com/home/dashboard?project=phayao-assets`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-11 text-blue-600 underline font-medium hover:text-blue-800"
            >
              เปิด Google Cloud Console (phayao-assets)
            </a>
            <p className="text-sm text-slate-500 ml-11 mt-2">
              *เมื่อเปิดแล้ว ให้กดปุ่ม <strong>Activate Cloud Shell</strong> (ไอคอน &gt;_ ด้านขวาบน)
            </p>
          </div>

          {/* Step 2: Check Bucket Name */}
          <div>
            <div className="flex items-center mb-3">
               <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-bold mr-3">
                 3
               </div>
               <h3 className="font-bold text-slate-800">เช็คชื่อ Bucket</h3>
            </div>
             <p className="text-sm text-slate-600 ml-11 mb-2">
              พิมพ์คำสั่งนี้ใน Cloud Shell เพื่อดูชื่อถังของคุณ:
            </p>
            <div className="ml-11 bg-slate-900 text-slate-50 p-3 rounded-lg font-mono text-xs mb-2">
              gsutil ls
            </div>
            <p className="text-sm text-slate-500 ml-11">
              *คราวนี้คุณควรจะเห็นชื่อเช่น <code>gs://phayao-assets.appspot.com/</code> <br/>
              ให้ใช้ชื่อนั้นแทนคำว่า <strong>{bucketName}</strong> ในขั้นตอนสุดท้าย
            </p>
          </div>

          {/* Step 3 */}
          <div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">4</div>
              <h3 className="font-bold text-slate-800">สร้างไฟล์ cors.json</h3>
            </div>
            <p className="text-sm text-slate-600 ml-11 mb-2">
              พิมพ์คำสั่งนี้ลงใน Cloud Shell เพื่อสร้างไฟล์:
            </p>
            <div className="ml-11 bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-x-auto relative group">
              <pre>{`cat > cors.json <<EOF
${corsContent}
EOF`}</pre>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`cat > cors.json <<EOF\n${corsContent}\nEOF`);
                  alert("คัดลอกคำสั่งแล้ว! ไปวางใน Cloud Shell ได้เลย");
                }}
                className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 p-1.5 rounded text-white transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 mr-3">5</div>
              <h3 className="font-bold text-slate-800">บันทึกการตั้งค่า</h3>
            </div>
            <p className="text-sm text-slate-600 ml-11 mb-2">
              รันคำสั่งสุดท้ายเพื่อเปิดการใช้งาน (อย่าลืมเปลี่ยนชื่อ bucket ให้ตรงกับที่เช็คได้):
            </p>
            <div className="ml-11 bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-xs flex justify-between items-center">
              <code>gsutil cors set cors.json gs://{bucketName}</code>
              <button 
                onClick={() => {
                   navigator.clipboard.writeText(`gsutil cors set cors.json gs://${bucketName}`);
                   alert("คัดลอกคำสั่งแล้ว!");
                }}
                className="text-slate-400 hover:text-white"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
            <Check size={20} className="text-green-600 mr-3 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-800 text-sm">เสร็จเรียบร้อย!</h4>
              <p className="text-green-700 text-xs mt-1">
                รอประมาณ 1 นาที แล้วลองอัปโหลดรูปในแอปใหม่อีกครั้ง
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SetupPage;