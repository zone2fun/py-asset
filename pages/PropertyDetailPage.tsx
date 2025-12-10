import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Ruler, Navigation, MessageCircle } from 'lucide-react';
import { MOCK_PROPERTIES } from '../constants';
import { getPropertyInquiryUrl } from '../services/lineService';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const property = MOCK_PROPERTIES.find(p => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <p className="text-slate-500 mb-4">ไม่พบข้อมูลทรัพย์</p>
            <button onClick={() => navigate(-1)} className="text-emerald-600 font-bold">กลับ</button>
        </div>
      </div>
    );
  }

  const handleOpenMap = () => {
    if (property.coordinates) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`, '_blank');
    } else {
      // Fallback text search if no coordinates
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location + ' พะเยา')}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Image */}
      <div className="relative h-72 bg-slate-200">
        <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
        
        {/* Back Button */}
        <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white transition-all shadow-sm"
        >
            <ArrowLeft size={24} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                {property.type}
            </span>
            <h1 className="text-white text-xl font-bold leading-tight shadow-black drop-shadow-md">
                {property.title}
            </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-6 -mt-4 relative bg-slate-50 rounded-t-[1.5rem] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        
        {/* Price Section */}
        <div className="flex items-baseline justify-between mb-6 border-b border-slate-200 pb-4">
            <div>
                <span className="text-slate-500 text-sm block mb-1">ราคาขาย</span>
                <span className="text-3xl font-bold text-emerald-600">฿{property.price.toLocaleString()}</span>
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-start">
                <div className="flex items-center text-slate-400 mb-2">
                    <Ruler size={18} className="mr-2" />
                    <span className="text-xs">ขนาดพื้นที่</span>
                </div>
                <span className="font-bold text-slate-800 text-lg">
                    {property.size || '-'}
                </span>
            </div>

            <div 
                onClick={handleOpenMap}
                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col items-start cursor-pointer hover:border-emerald-300 transition-colors"
            >
                <div className="flex items-center text-slate-400 mb-2">
                    <MapPin size={18} className="mr-2" />
                    <span className="text-xs">ทำเลที่ตั้ง</span>
                </div>
                <span className="font-bold text-slate-800 text-sm line-clamp-2">
                    {property.location}
                </span>
                <div className="mt-1 flex items-center text-emerald-600 text-[10px] font-bold">
                    <Navigation size={10} className="mr-1" />
                    ดูแผนที่
                </div>
            </div>
        </div>

        {/* Map View */}
        {property.coordinates && (
          <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">แผนที่</h3>
            <div className="relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 h-48">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                title="map"
                src={`https://maps.google.com/maps?q=${property.coordinates.lat},${property.coordinates.lng}&z=15&output=embed`}
                className="w-full h-full"
              ></iframe>
              <button 
                 onClick={handleOpenMap}
                 className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-md text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 flex items-center hover:bg-emerald-50"
              >
                  <Navigation size={12} className="mr-1" />
                  นำทาง
              </button>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
            <h3 className="font-bold text-slate-800 mb-2">รายละเอียดเพิ่มเติม</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
            </p>
        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 left-4 right-4 z-40">
        <button 
            onClick={() => window.open(getPropertyInquiryUrl(property), '_blank')}
            className="w-full bg-[#06C755] hover:bg-[#05b64d] text-white font-bold py-3.5 px-6 rounded-full shadow-lg flex items-center justify-center text-lg transition-transform active:scale-95"
        >
            <MessageCircle size={24} className="mr-2" />
            ทักไลน์สอบถาม
        </button>
      </div>

    </div>
  );
};

export default PropertyDetailPage;