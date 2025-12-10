import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';
import { LINE_OA_ID, LINE_OA_URL } from '../constants';

const ContactPage: React.FC = () => {
  const phoneNumber = "0614544516";
  const formattedPhone = "061-454-4516";

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <div className="bg-emerald-600 text-white px-6 py-8 rounded-b-[2rem] shadow-lg mb-8 text-center">
         <h1 className="text-3xl font-bold mb-2">ติดต่อเรา</h1>
         <p className="text-emerald-100">ทีมงาน อสังหาฯ พะเยา ยินดีให้บริการ</p>
      </div>

      <div className="px-6 space-y-4">
        {/* Phone Button */}
        <a 
          href={`tel:${phoneNumber}`}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-emerald-500 transition-all group active:scale-98"
        >
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
            <Phone size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">โทรศัพท์</h3>
            <p className="text-slate-500">{formattedPhone}</p>
          </div>
        </a>

        {/* LINE Button */}
        <a 
          href={LINE_OA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-[#06C755] transition-all group active:scale-98"
        >
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-[#06C755] group-hover:bg-[#06C755] group-hover:text-white transition-colors shrink-0">
            <MessageCircle size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">แอด LINE</h3>
            <p className="text-slate-500">{LINE_OA_ID}</p>
          </div>
        </a>

        {/* Info Text */}
        <div className="mt-8 text-center text-slate-400 text-sm">
            <p>เวลาทำการ: ทุกวัน 08:00 - 18:00 น.</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;