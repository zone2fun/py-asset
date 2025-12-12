import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Ruler, Navigation, MessageCircle, Share2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { getPropertyInquiryUrl } from '../services/lineService';
import { getPropertyById } from '../services/propertyService';
import { Property } from '../types';
import SEO from '../components/SEO';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const isSold = property?.status === 'sold';

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

  const handleContact = () => {
    if (!isSold && property) {
        window.open(getPropertyInquiryUrl(property), '_blank');
    }
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
            <button onClick={() => navigate(-1)} className="text-emerald-600 font-bold">กลับ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      <SEO 
        title={`${property.title} - ${property.location}`}
        description={`ประกาศขาย ${property.title} ราคา ${property.price.toLocaleString()} บาท ทำเล ${property.location} ขนาด ${property.size || '-'} รายละเอียด: ${property.description.substring(0, 100)}...`}
        image={property.image}
        keywords={`ขาย${property.type}พะเยา, ${property.location}, อสังหาพะเยา`}
      />

      {/* Back Button (Floating on Mobile, Static on Desktop) */}
      <div className="fixed top-4 left-4 md:hidden z-50">
         <button onClick={() => navigate(-1)} className="bg-white/90 p-2 rounded-full shadow-md text-slate-700">
             <ArrowLeft size={24} />
         </button>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 md:py-8">
        
        {/* Breadcrumb / Desktop Back */}
        <div className="hidden md:flex items-center gap-2 mb-6 text-slate-500">
            <button onClick={() => navigate(-1)} className="hover:text-emerald-600 flex items-center">
                <ArrowLeft size={16} className="mr-1" /> ย้อนกลับ
            </button>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-xs">{property.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 lg:gap-12">
            
            {/* LEFT COLUMN: IMAGES */}
            <div className="md:col-span-7 lg:col-span-8">
                <div className="relative h-72 md:h-[500px] bg-slate-200 group md:rounded-2xl overflow-hidden shadow-sm">
                    <div 
                        className="w-full h-full overflow-hidden relative cursor-pointer"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img 
                            src={allImages[currentImageIndex]} 
                            alt={property.title} 
                            className={`w-full h-full object-cover transition-opacity duration-300 ${isSold ? 'grayscale' : ''}`} 
                        />
                        
                        {/* Arrows */}
                        {allImages.length > 1 && (
                            <>
                                <button 
                                    onClick={handlePrevImage}
                                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/30 md:bg-white/80 text-white md:text-slate-800 p-2 rounded-full hover:bg-black/50 md:hover:bg-white transition-all backdrop-blur-sm"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <button 
                                    onClick={handleNextImage}
                                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/30 md:bg-white/80 text-white md:text-slate-800 p-2 rounded-full hover:bg-black/50 md:hover:bg-white transition-all backdrop-blur-sm"
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Mobile Share Button overlay */}
                        <button 
                            onClick={handleShare}
                            className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-[#06C755] hover:text-white transition-all shadow-sm z-20 md:hidden"
                        >
                            <Share2 size={24} />
                        </button>
                    </div>

                    {/* Image Counter Badge */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium z-10">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>
                </div>

                {/* Thumbnails (Desktop) */}
                <div className="hidden md:flex gap-3 mt-4 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                            <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN: INFO */}
            <div className="md:col-span-5 lg:col-span-4 relative">
                 <div className="md:sticky md:top-24 bg-white md:bg-transparent -mt-4 md:mt-0 px-4 pt-6 pb-20 md:p-0 rounded-t-[1.5rem] md:rounded-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none z-20">
                    
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md">
                            {property.type}
                        </span>
                        {isSold && (
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-md">
                                ปิดการขายแล้ว
                            </span>
                        )}
                        <button 
                            onClick={handleShare} 
                            className="hidden md:flex ml-auto text-slate-400 hover:text-emerald-600 items-center text-sm font-medium transition-colors"
                        >
                            <Share2 size={16} className="mr-1" /> แชร์
                        </button>
                    </div>

                    <h1 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
                        {property.title}
                    </h1>

                    <div className="flex items-center text-slate-500 mb-6 text-sm md:text-base">
                        <MapPin size={18} className="mr-1 flex-shrink-0 text-slate-400" />
                        {property.location}
                    </div>

                    <div className="border-y border-slate-100 py-4 mb-6">
                         <div className="flex items-baseline justify-between">
                            <span className="text-slate-500 text-sm">ราคาขาย</span>
                            <div className="text-right">
                                <span className={`text-3xl font-bold ${isSold ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                                    ฿{property.price.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-start">
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
                            className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-start cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition-all group"
                        >
                            <div className="flex items-center text-slate-400 mb-2 group-hover:text-emerald-600">
                                <Navigation size={18} className="mr-2" />
                                <span className="text-xs">แผนที่</span>
                            </div>
                            <span className="font-bold text-emerald-600 text-sm underline decoration-emerald-300 underline-offset-2">
                                ดูตำแหน่งบน Google Map
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm md:text-base">รายละเอียดเพิ่มเติม</h3>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">
                            {property.description}
                        </p>
                    </div>

                    {/* Action Button (Desktop: Inline, Mobile: Floating) */}
                    <div className="fixed bottom-20 md:bottom-auto left-4 right-4 md:static z-40 md:z-auto">
                        <button 
                            onClick={handleContact}
                            disabled={isSold}
                            className={`w-full font-bold py-3.5 px-6 rounded-xl md:rounded-lg shadow-lg md:shadow-md flex items-center justify-center text-lg md:text-base transition-all active:scale-95 ${
                                isSold 
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                                : 'bg-[#06C755] hover:bg-[#05b64d] text-white'
                            }`}
                        >
                            <MessageCircle size={24} className="mr-2 md:w-5 md:h-5" />
                            {isSold ? 'ปิดการขายแล้ว' : 'ทักไลน์สอบถาม / นัดดู'}
                        </button>
                    </div>

                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;