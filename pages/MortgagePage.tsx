import React from 'react';
import { useHistory } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Coins, MessageCircle } from 'lucide-react';
import { LINE_OA_ID } from '../constants';

const MortgagePage: React.FC = () => {
  const history = useHistory();

  const handleLineContact = () => {
    // Open LINE with a specific message
    const message = encodeURIComponent("สนใจสอบถามเรื่อง ฝากขาย/จำนอง ครับ");
    window.open(`https://line.me/R/oaMessage/${LINE_OA_ID}/?${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <div className="bg-purple-700 text-white px-4 py-4 sticky top-0 z-40 flex items-center shadow-md">
        <button 
            onClick={() => history.goBack()}
            className="p-2 rounded-full hover:bg-white/10 text-white mr-2"
        >
            <ArrowLeft size={24} />
        </button>
        <h1 className="font-bold text-lg">บริการขายฝาก / จำนอง</h1>
      </div>

      {/* Hero Banner */}
      <div className="bg-purple-600 text-white p-8 rounded-b-[2rem] shadow-lg mb-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 opacity-10 transform -translate-x-10 -translate-y-10">
            <Coins size={180} />
        </div>
        <Coins size={64} className="mx-auto mb-4 relative z-10" />
        <h2 className="text-2xl font-bold mb-2 relative z-10">เงินด่วน อนุมัติไว</h2>
        <p className="text-purple-100 relative z-10">เปลี่ยนโฉนดเป็นเงินทุน หมุนเวียนธุรกิจ</p>
      </div>

      <div className="px-6 space-y-6">
        {/* Features */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg mb-4 text-center">จุดเด่นบริการของเรา</h3>
            <div className="space-y-4">
                <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={20} />
                    <div>
                        <span className="font-bold text-slate-700 block">ดอกเบี้ยต่ำ ถูกกฎหมาย</span>
                        <span className="text-sm text-slate-500">เริ่มต้นเพียง 1.25% ต่อเดือน</span>
                    </div>
                </div>
                <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={20} />
                    <div>
                        <span className="font-bold text-slate-700 block">วงเงินสูง</span>
                        <span className="text-sm text-slate-500">ให้วงเงินสูงตามราคาประเมิน</span>
                    </div>
                </div>
                <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={20} />
                    <div>
                        <span className="font-bold text-slate-700 block">ไม่เช็คเครดิตบูโร</span>
                        <span className="text-sm text-slate-500">ติดแบล็คลิสต์ก็กู้ได้ พิจารณาจากหลักทรัพย์</span>
                    </div>
                </div>
                <div className="flex items-start">
                    <CheckCircle className="text-green-500 mr-3 mt-0.5 shrink-0" size={20} />
                    <div>
                        <span className="font-bold text-slate-700 block">ทำสัญญาที่กรมที่ดิน</span>
                        <span className="text-sm text-slate-500">ถูกต้อง โปร่งใส ปลอดภัย 100%</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 text-lg mb-4">เอกสารเบื้องต้น</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-600 text-sm">
                <li>โฉนดที่ดิน (หน้า-หลัง)</li>
                <li>บัตรประชาชนเจ้าของที่ดิน</li>
                <li>ทะเบียนบ้าน</li>
                <li>รูปถ่ายทรัพย์สิน</li>
            </ul>
        </div>
        
        {/* Contact Note */}
        <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-purple-800 font-medium">
                "ประเมินราคาฟรี ไม่มีค่าใช้จ่ายล่วงหน้า"
            </p>
        </div>

      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-20 left-4 right-4 z-40">
        <button 
            onClick={handleLineContact}
            className="w-full bg-[#06C755] hover:bg-[#05b64d] text-white font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center text-lg transition-transform active:scale-95"
        >
            <MessageCircle size={24} className="mr-2" />
            ปรึกษาฟรีทาง LINE
        </button>
      </div>

    </div>
  );
};

export default MortgagePage;