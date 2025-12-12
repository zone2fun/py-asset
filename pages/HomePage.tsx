import React from 'react';
import { Home, Trees, Building, Search, Megaphone, Coins, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropertyType } from '../types';
import InstallPWA from '../components/InstallPWA';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (type: PropertyType) => {
    navigate(`/list?type=${type}`);
  };

  return (
    <div className="pb-24 md:pb-12">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white relative overflow-hidden md:mt-0">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-1/2 mb-8 md:mb-0">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                        อสังหาฯ พะเยา <br/>
                        <span className="text-emerald-200">ครบ จบ ในที่เดียว</span>
                    </h1>
                    <p className="text-emerald-100 text-lg md:text-xl mb-8 max-w-md">
                        ศูนย์รวม บ้าน ที่ดิน หอพัก คุณภาพดี คัดสรรมาเพื่อคุณโดยเฉพาะ
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                        <button 
                            onClick={() => navigate('/list')}
                            className="bg-white text-emerald-700 py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center font-bold hover:bg-emerald-50 transition-colors w-full sm:w-auto"
                        >
                            <Search size={20} className="mr-2" />
                            ค้นหาทรัพย์
                        </button>
                        <button 
                            onClick={() => navigate('/submit')}
                            className="bg-emerald-700 text-white border border-emerald-500 py-3.5 px-6 rounded-xl flex items-center justify-center font-bold hover:bg-emerald-800 transition-colors w-full sm:w-auto"
                        >
                            <Megaphone size={20} className="mr-2" />
                            ลงประกาศฟรี
                        </button>
                    </div>
                    
                     <div className="mt-4 md:hidden">
                        <InstallPWA />
                     </div>
                </div>
                
                {/* Desktop Illustration / Icon */}
                <div className="hidden md:flex md:w-1/2 justify-center items-center relative">
                    <div className="absolute w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-30"></div>
                    <Home size={320} className="text-emerald-100/20 relative z-10" />
                </div>
            </div>
        </div>
        
        {/* Decorative Background Icon for Mobile */}
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10 md:hidden">
          <Home size={200} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 md:mt-16 space-y-12">
        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-emerald-500 pl-3">
                เลือกหมวดหมู่ทรัพย์
            </h2>
            <button onClick={() => navigate('/list')} className="text-emerald-600 text-sm font-bold flex items-center hover:underline">
                ดูทั้งหมด <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <button 
              onClick={() => handleCategoryClick(PropertyType.HOUSE)}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 md:space-x-6 hover:border-emerald-500 hover:shadow-md transition-all group text-left"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                <Home size={32} className="md:w-10 md:h-10" />
              </div>
              <div>
                <h3 className="font-bold text-xl md:text-2xl text-slate-800 group-hover:text-emerald-600 transition-colors">บ้านพักอาศัย</h3>
                <p className="text-sm md:text-base text-slate-500 mt-1">บ้านเดี่ยว ทาวน์โฮม พร้อมอยู่</p>
              </div>
            </button>

            <button 
               onClick={() => handleCategoryClick(PropertyType.LAND)}
               className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 md:space-x-6 hover:border-emerald-500 hover:shadow-md transition-all group text-left"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors shrink-0">
                <Trees size={32} className="md:w-10 md:h-10" />
              </div>
               <div>
                <h3 className="font-bold text-xl md:text-2xl text-slate-800 group-hover:text-emerald-600 transition-colors">ที่ดิน</h3>
                <p className="text-sm md:text-base text-slate-500 mt-1">ที่ดินเปล่า ที่นา สวน ทำเลทอง</p>
              </div>
            </button>

            <button 
               onClick={() => handleCategoryClick(PropertyType.DORMITORY)}
               className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 md:space-x-6 hover:border-emerald-500 hover:shadow-md transition-all group text-left"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors shrink-0">
                <Building size={32} className="md:w-10 md:h-10" />
              </div>
               <div>
                <h3 className="font-bold text-xl md:text-2xl text-slate-800 group-hover:text-emerald-600 transition-colors">หอพัก</h3>
                <p className="text-sm md:text-base text-slate-500 mt-1">เพื่อการลงทุน หรือเช่าอยู่</p>
              </div>
            </button>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 border-l-4 border-amber-500 pl-3">
            บริการของเรา
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <button 
              onClick={() => navigate('/submit')}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-amber-500 hover:shadow-md transition-all group text-left"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
                <Megaphone size={32} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">ฝากขายบ้าน/ที่ดิน</h3>
                <p className="text-sm text-slate-500 mt-1">เปลี่ยนทรัพย์เป็นเงิน ลงประกาศฟรี การตลาดครบวงจร</p>
              </div>
            </button>

            <button 
              onClick={() => navigate('/mortgage')}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 hover:border-purple-500 hover:shadow-md transition-all group text-left"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
                <Coins size={32} />
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">ขายฝาก จำนอง</h3>
                <p className="text-sm text-slate-500 mt-1">ดอกเบี้ยต่ำ อนุมัติไว ถูกกฎหมาย ปลอดภัย 100%</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;