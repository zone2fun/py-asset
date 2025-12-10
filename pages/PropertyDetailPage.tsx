import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { ArrowLeft, MapPin, Ruler, Navigation, MessageCircle, Share2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getPropertyInquiryUrl } from '../services/lineService';
import { getPropertyById } from '../services/propertyService';
import { Property } from '../types';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Image Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        setLoading(true);
        const data = await getPropertyById(id);
        setProperty(data);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const allImages = property ? [property.image, ...(property.images || [])] : [];

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNextImage();
    }
    if (touchStartX.current - touchEndX.current < -50) {
      handlePrevImage();
    }
  };

  const handleOpenMap = () => {
    if (!property) return;
    if (property.coordinates) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location + ' พะเยา')}`, '_blank');
    }
  };

  const handleShare = () => {
    if (!property) return;
    const shareText = `แนะนำทรัพย์นี้ครับ: ${property.title}\nราคา: ฿${property.price.toLocaleString()}\nทำเล: ${property.location}`;
    const shareUrl = window.location.href;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + shareUrl)}`;
    window.open(lineUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <p className="text-slate-500 mb-4">ไม่พบข้อมูลทรัพย์</p>
            <button onClick={() => history.goBack()} className="text-emerald-600 font-bold">กลับ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Image Slider Section */}
      <div className="relative h-72 bg-slate-200 group">
        <div 
            className="w-full h-full overflow-hidden relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <img 
                src={allImages[currentImageIndex]} 
                alt={property.title} 
                className="w-full h-full object-cover transition-opacity duration-300" 
            />
            
            {/* Arrows (Hidden on mobile by default, shown on hover/desktop or always if preferred) */}
            {allImages.length > 1 && (
                <>
                    <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white p-1 rounded-full hover:bg-black/50 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {allImages.length > 1 && (
                <div className="absolute bottom-16 left-0 right-0 flex justify-center space-x-2 z-10">
                    {allImages.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125' : 'bg-white/50'}`} 
                        />
                    ))}
                </div>
            )}
        </div>
        
        {/* Back Button */}
        <button 
            onClick={() => history.goBack()}
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-white transition-all shadow-sm z-20"
        >
            <ArrowLeft size={24} />
        </button>

        {/* Share Button */}
        <button 
            onClick={handleShare}
            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-[#06C755] hover:text-white transition-all shadow-sm z-20"
        >
            <Share2 size={24} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-12 z-10">
            <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">
                {property.type}
            </span>
            <h1 className="text-white text-xl font-bold leading-tight shadow-black drop-shadow-md">
                {property.title}
            </h1>
        </div>
      </div>

      {/* Content Container */}
      <div className="px-4 py-6 -mt-4 relative bg-slate-50 rounded-t-[1.5rem] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
        
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