import React, { useEffect, useState, useRef } from 'react';
import { Home, Trees, Building, Search, Megaphone, Coins, ArrowRight, Loader2, Sparkles, ChevronLeft, ChevronRight, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PropertyType, Property } from '../types';
import { getProperties } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import InstallPWA from '../components/InstallPWA';
import SEO from '../components/SEO';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [videoReviews, setVideoReviews] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  
  const recScrollRef = useRef<HTMLDivElement>(null);
  const videoScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProperties('All');
        
        // 1. Get Recommended (Top Priority)
        let recData = data.filter(p => p.isRecommended === true);
        if (recData.length === 0) recData = data.slice(0, 6);
        setRecommended(recData);

        // 2. Get Video Reviews
        const vidData = data.filter(p => p.contentType === 'video');
        setVideoReviews(vidData);

      } catch (error) {
        console.error("Failed to load properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCategoryClick = (type: PropertyType) => {
    navigate(`/list?type=${type}`);
  };

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
        const scrollAmount = 300;
        if (direction === 'left') {
            ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

  return (
    <div className="pb-24 md:pb-12">
      <SEO 
        title="ขายบ้านและที่ดินราคาถูก" 
        description="เว็บรวมประกาศขายบ้านและที่ดินพะเยา ราคาถูก เจ้าของขายเอง บ้านมือสอง ที่ดินเปล่า หอพัก ครบจบในที่เดียว"
        keywords="ขายบ้านพะเยา, ที่ดินพะเยา ราคาถูก, บ้านมือสองพะเยา, ขายที่ดินพะเยา, บ้านเช่าพะเยา"
      />

      {/* Hero Section */}
      <div className="relative text-white overflow-hidden md:mt-0 min-h-[500px] flex items-center">
        
        {/* Background Image: Kwan Phayao View */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop" 
                alt="Kwan Phayao View" 
                className="w-full h-full object-cover"
            />
            {/* Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-900/70 to-emerald-900/20 md:to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 relative z-10 w-full">
            <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="md:w-3/5 mb-8 md:mb-0">
                    <div className="inline-block bg-emerald-500/20 backdrop-blur-sm border border-emerald-400/30 text-emerald-100 px-4 py-1 rounded-full text-sm font-medium mb-4">
                        📍 ทรัพย์ดี ทำเลทอง จังหวัดพะเยา
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-lg">
                        ขายบ้านและที่ดิน<br/>
                        <span className="text-emerald-200">ราคาถูก พะเยา</span>
                    </h1>
                    <p className="text-emerald-50 text-lg md:text-xl mb-8 max-w-lg drop-shadow-md">
                        ศูนย์รวมอสังหาริมทรัพย์พะเยา บ้านมือสอง ที่ดินสวย หอพักน่าลงทุน คัดสรรทรัพย์คุณภาพดี ราคาโดนใจ
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                        <button 
                            onClick={() => navigate('/list')}
                            className="bg-white text-emerald-800 py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center font-bold hover:bg-emerald-50 transition-colors w-full sm:w-auto"
                        >
                            <Search size={20} className="mr-2" />
                            ค้นหาบ้าน/ที่ดิน
                        </button>
                        <button 
                            onClick={() => navigate('/submit')}
                            className="bg-emerald-600/80 backdrop-blur-md text-white border border-emerald-400/50 py-3.5 px-6 rounded-xl flex items-center justify-center font-bold hover:bg-emerald-600 transition-colors w-full sm:w-auto"
                        >
                            <Megaphone size={20} className="mr-2" />
                            ฝากขายทรัพย์กับเรา
                        </button>
                    </div>
                    
                     <div className="mt-4 md:hidden">
                        <InstallPWA />
                     </div>
                </div>
                
                {/* Desktop Illustration / Spacer */}
                <div className="hidden md:block md:w-2/5 relative">
                   {/* Empty space to show the background image */}
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 md:mt-12 space-y-12">
        
        {/* Recommended Properties Slider */}
        {recommended.length > 0 && (
          <div className="relative group">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-red-500 pl-3 flex items-center">
                   ทรัพย์น่าซื้อ <Sparkles size={20} className="ml-2 text-yellow-500 fill-yellow-500" />
               </h2>
               <div className="flex items-center gap-2">
                   <div className="hidden md:flex gap-1 mr-2">
                        <button onClick={() => scroll(recScrollRef, 'left')} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => scroll(recScrollRef, 'right')} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                   </div>
                   <button onClick={() => navigate('/list')} className="text-slate-500 text-sm font-bold flex items-center hover:text-emerald-600 transition-colors">
                       ดูทั้งหมด <ArrowRight size={16} className="ml-1" />
                   </button>
               </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-emerald-600" />
                </div>
            ) : (
                <div className="relative">
                    {/* Floating Navigation Buttons (Mobile/Desktop overlay) */}
                    <button onClick={() => scroll(recScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white/90 shadow-lg text-slate-800 p-2 rounded-full hidden md:flex hover:scale-110 transition-transform"><ChevronLeft size={24} /></button>
                    <button onClick={() => scroll(recScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white/90 shadow-lg text-slate-800 p-2 rounded-full hidden md:flex hover:scale-110 transition-transform"><ChevronRight size={24} /></button>

                    <div 
                        ref={recScrollRef}
                        className="flex overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 space-x-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                    >
                        {recommended.map(property => (
                            <div key={property.id} className="min-w-[280px] md:min-w-[300px] snap-center">
                                <PropertyCard property={property} />
                            </div>
                        ))}
                        <div className="min-w-[150px] md:min-w-[180px] snap-center flex items-center justify-center">
                            <button onClick={() => navigate('/list')} className="w-full h-full min-h-[250px] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-emerald-400 hover:text-emerald-600 transition-colors group">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                    <ArrowRight size={24} />
                                </div>
                                <span className="font-bold text-sm">ดูเพิ่มเติม</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* Video Reviews Slider (NEW SECTION) */}
        {videoReviews.length > 0 && (
          <div className="relative group">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-emerald-500 pl-3 flex items-center">
                   วิดีโอรีวิว <Video size={24} className="ml-2 text-red-500 fill-red-500" />
               </h2>
               <div className="flex items-center gap-2">
                   <div className="hidden md:flex gap-1 mr-2">
                        <button onClick={() => scroll(videoScrollRef, 'left')} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => scroll(videoScrollRef, 'right')} className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                   </div>
               </div>
            </div>
            
            <div className="relative">
                <button onClick={() => scroll(videoScrollRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 bg-white/90 shadow-lg text-slate-800 p-2 rounded-full hidden md:flex hover:scale-110 transition-transform"><ChevronLeft size={24} /></button>
                <button onClick={() => scroll(videoScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 bg-white/90 shadow-lg text-slate-800 p-2 rounded-full hidden md:flex hover:scale-110 transition-transform"><ChevronRight size={24} /></button>

                <div 
                    ref={videoScrollRef}
                    className="flex overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 space-x-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
                >
                    {videoReviews.map(property => (
                        <div key={property.id} className="min-w-[260px] md:min-w-[280px] snap-center">
                            <PropertyCard property={property} />
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 border-l-4 border-slate-500 pl-3">
                เลือกหมวดหมู่ทรัพย์
            </h2>
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
                <p className="text-sm md:text-base text-slate-500 mt-1">บ้านเดี่ยว ทาวน์โฮม บ้านมือสองพะเยา</p>
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
                <p className="text-sm md:text-base text-slate-500 mt-1">ที่ดินเปล่า ที่นา สวน ทำเลทอง ราคาถูก</p>
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
                <p className="text-sm md:text-base text-slate-500 mt-1">หอพักหน้ามอ หอพักลงทุน</p>
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
                <p className="text-sm text-slate-500 mt-1">เปลี่ยนทรัพย์เป็นเงิน ฝากขายทรัพย์กับเรา การตลาดครบวงจร</p>
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