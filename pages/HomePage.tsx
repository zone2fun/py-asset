import React from 'react';
import { Home, Trees, Building, Search, Megaphone, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropertyType } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (type: PropertyType) => {
    navigate(`/list?type=${type}`);
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white p-6 rounded-b-[2rem] shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <Home size={200} />
        </div>
        <h1 className="text-3xl font-bold mb-2 relative z-10">อสังหาฯ พะเยา</h1>
        <p className="text-emerald-100 relative z-10">ศูนย์รวม บ้าน ที่ดิน หอพัก คุณภาพดี</p>
        
        <div className="mt-6 relative z-10">
            <button 
                onClick={() => navigate('/list')}
                className="w-full bg-white text-emerald-700 py-3 px-4 rounded-xl shadow-sm flex items-center font-medium"
            >
                <Search size={20} className="mr-2 opacity-50" />
                ค้นหาทรัพย์ทั้งหมด...
            </button>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Categories Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-emerald-500 pl-3">
            เลือกหมวดหมู่ทรัพย์
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => handleCategoryClick(PropertyType.HOUSE)}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-emerald-500 transition-all group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Home size={32} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-xl text-slate-800">บ้านพักอาศัย</h3>
                <p className="text-sm text-slate-500">บ้านเดี่ยว ทาวน์โฮม</p>
              </div>
            </button>

            <button 
               onClick={() => handleCategoryClick(PropertyType.LAND)}
               className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-emerald-500 transition-all group"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors shrink-0">
                <Trees size={32} />
              </div>
               <div className="text-left">
                <h3 className="font-bold text-xl text-slate-800">ที่ดิน</h3>
                <p className="text-sm text-slate-500">ที่ดินเปล่า ที่นา สวน</p>
              </div>
            </button>

            <button 
               onClick={() => handleCategoryClick(PropertyType.DORMITORY)}
               className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-emerald-500 transition-all group"
            >
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                <Building size={32} />
              </div>
               <div className="text-left">
                <h3 className="font-bold text-xl text-slate-800">หอพัก</h3>
                <p className="text-sm text-slate-500">เพื่อการลงทุน หรือเช่าอยู่</p>
              </div>
            </button>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-l-4 border-amber-500 pl-3">
            บริการของเรา
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={() => navigate('/submit')}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-amber-500 transition-all group"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                <Megaphone size={32} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-xl text-slate-800">ฝากขายบ้าน/ที่ดิน</h3>
                <p className="text-sm text-slate-500">เปลี่ยนทรัพย์เป็นเงิน ลงประกาศฟรี</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/mortgage')}
              className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-purple-500 transition-all group"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                <Coins size={32} />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-xl text-slate-800">ขายฝาก จำนอง</h3>
                <p className="text-sm text-slate-500">ดอกเบี้ยต่ำ อนุมัติไว ถูกกฎหมาย</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;