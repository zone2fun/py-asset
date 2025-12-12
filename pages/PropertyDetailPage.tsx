import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Ruler, Navigation, MessageCircle, Share2, ChevronLeft, ChevronRight, Loader2, Facebook, Link as LinkIcon, Check, X, Eye, Play } from 'lucide-react';
import { getPropertyInquiryUrl } from '../services/lineService';
import { getPropertyById, incrementViewCount } from '../services/propertyService';
import { Property } from '../types';
import SEO from '../components/SEO';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  
  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Image Slider State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = React.useRef(0);
  const touchEndX = React.useRef(0);

  useEffect(() => {
    const fetchProperty = async () => {
      if (id) {
        setLoading(true);
        incrementViewCount(id);
        const data = await getPropertyById(id);
        setProperty(data);
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const allImages = property ? [property.image, ...(property.images || [])] : [];
  const isSold = property?.status === 'sold';
  const isVideoReview = property?.contentType === 'video';

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

  const getRichShareUrl = () => {
    if (!property) return window.location.href;
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('og_title', property.title);
    params.set('og_desc', property.description.substring(0, 150));
    params.set('og_image', property.image);
    params.set('og_price', property.price.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const handleShare = () => {
    const richUrl = getRichShareUrl();
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: `แนะนำทรัพย์: ${property?.title} ราคา ${property?.price.toLocaleString()}`,
        url: richUrl,
      }).catch(() => {});
    } else {
      setShowShareModal(true);
    }
  };

  const handleShareFacebook = () => {
    const richUrl = getRichShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(richUrl)}`, '_blank');
    setShowShareModal(false);
  };

  const handleShareLine = () => {
    if (!property) return;
    const richUrl = getRichShareUrl();
    const shareText = `แนะนำทรัพย์นี้ครับ: ${property.title}\nราคา: ฿${property.price.toLocaleString()}\nทำเล: ${property.location}`;
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText + '\n' + richUrl)}`;
    window.open(lineUrl, '_blank');
    setShowShareModal(false);
  };

  const handleCopyLink = async () => {
    if (!property) return;
    const richUrl = getRichShareUrl();
    const copyText = `${property.title}\nราคา: ฿${property.price.toLocaleString()}\n${richUrl}`;
    
    try {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
            setShowShareModal(false);
        }, 1500);
    } catch (err) {
        console.error('Failed to copy', err);
    }
  };

  const handleContact = () => {
    if (!isSold && property) {
        window.open(getPropertyInquiryUrl(property), '_blank');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 size={32} className="animate-spin text-emerald-600" /></div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="text-center"><p className="text-slate-500 mb-4">ไม่พบข้อมูลทรัพย์</p><button onClick={() => navigate(-1)} className="text-emerald-600 font-bold">กลับ</button></div></div>;

  // ==========================================
  // RENDER: VIDEO REVIEW MODE (TikTok Style)
  // ==========================================
  if (isVideoReview) {
      return (
        <div className="bg-black min-h-screen pb-28 md:pb-0">
          <SEO 
            title={`VIDEO: ${property.title}`} 
            description={property.description} 
            image={property.image}
            price={property.price}
          />
          
          {/* Mobile Full Screen Video Container */}
          <div className="relative w-full h-[85vh] md:h-[600px] md:max-w-4xl md:mx-auto md:mt-8 md:rounded-2xl overflow-hidden bg-slate-900 shadow-2xl">
              {/* Back Button */}
              <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-40 bg-black/40 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/60">
                  <ArrowLeft size={24} />
              </button>

              {/* Share Button */}
              <button onClick={handleShare} className="absolute top-4 right-4 z-40 bg-black/40 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/60">
                  <Share2 size={24} />
              </button>
              
              {/* Video Player */}
              <video 
                src={property.videoUrl} 
                className="w-full h-full object-cover" 
                controls 
                playsInline 
                autoPlay 
                muted={false}
                poster={property.image}
              />
              
              {/* Overlay Content (Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/60 to-transparent pt-20 pb-6 px-6 pointer-events-none">
                  <div className="flex items-end justify-between pointer-events-auto">
                      <div className="text-white">
                          <div className="flex items-center gap-2 mb-2">
                             <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                VIDEO REVIEW
                             </span>
                             <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                {property.type}
                             </span>
                          </div>
                          <h1 className="text-xl md:text-3xl font-bold leading-tight mb-1 text-shadow-sm">
                              {property.title}
                          </h1>
                          <p className="text-emerald-400 font-bold text-2xl md:text-3xl mb-1">
                              ฿{property.price.toLocaleString()}
                          </p>
                          <div className="flex items-center text-slate-300 text-sm">
                              <MapPin size={14} className="mr-1" />
                              {property.location}
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Details Section (Below Video) */}
          <div className="bg-white rounded-t-3xl -mt-4 relative z-10 px-6 py-8 md:max-w-4xl md:mx-auto md:mt-4 md:rounded-2xl md:shadow-lg min-h-[300px]">
              <div className="flex items-center justify-center mb-6">
                 <div className="w-12 h-1 bg-slate-200 rounded-full md:hidden"></div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center text-slate-400 mb-2">
                        <Ruler size={18} className="mr-2" />
                        <span className="text-xs">ขนาด</span>
                    </div>
                    <span className="font-bold text-slate-800 text-lg">{property.size || '-'}</span>
                </div>
                <div onClick={handleOpenMap} className="bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-emerald-50 hover:border-emerald-200 transition-colors">
                    <div className="flex items-center text-slate-400 mb-2">
                        <Navigation size={18} className="mr-2" />
                        <span className="text-xs">แผนที่</span>
                    </div>
                    <span className="font-bold text-emerald-600 text-sm underline">เปิด Google Maps</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 mb-3">รายละเอียด</h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line mb-8">
                  {property.description}
              </p>

              {/* Fixed Bottom Action for Video Page */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 md:relative md:border-none md:p-0 z-[60] md:z-auto">
                   <button 
                        onClick={handleContact}
                        disabled={isSold}
                        className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center text-lg transition-all active:scale-95 ${
                            isSold 
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-[#06C755] hover:bg-[#05b64d] text-white'
                        }`}
                    >
                        <MessageCircle size={24} className="mr-2" />
                        {isSold ? 'ปิดการขายแล้ว' : 'ทักไลน์สอบถาม / นัดดู'}
                    </button>
              </div>
          </div>
        </div>
      );
  }

  // ==========================================
  // RENDER: STANDARD PHOTO MODE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      <SEO 
        title={`${property.title} - ${property.location}`}
        description={`ประกาศขาย ${property.title} ราคา ${property.price.toLocaleString()} บาท ทำเล ${property.location} ขนาด ${property.size || '-'} ${property.description.substring(0, 150)}...`}
        image={property.image}
        price={property.price}
      />

      {/* Back Button (Floating on Mobile) */}
      <div className="fixed top-4 left-4 md:hidden z-50">
         <button onClick={() => navigate(-1)} className="bg-white/90 p-2 rounded-full shadow-md text-slate-700 backdrop-blur-sm">
             <ArrowLeft size={24} />
         </button>
      </div>

      <div className="max-w-7xl mx-auto md:px-6 md:py-8">
        
        {/* Desktop Back */}
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
                                <button onClick={handlePrevImage} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/30 md:bg-white/80 text-white md:text-slate-800 p-2 rounded-full hover:bg-black/50 md:hover:bg-white transition-all backdrop-blur-sm"><ChevronLeft size={24} /></button>
                                <button onClick={handleNextImage} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/30 md:bg-white/80 text-white md:text-slate-800 p-2 rounded-full hover:bg-black/50 md:hover:bg-white transition-all backdrop-blur-sm"><ChevronRight size={24} /></button>
                            </>
                        )}

                        <button onClick={handleShare} className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full text-slate-700 hover:bg-[#06C755] hover:text-white transition-all shadow-sm z-20 md:hidden"><Share2 size={24} /></button>
                    </div>

                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium z-10">
                        {currentImageIndex + 1} / {allImages.length}
                    </div>
                </div>

                {/* Thumbnails */}
                <div className="hidden md:flex gap-3 mt-4 overflow-x-auto pb-2">
                    {allImages.map((img, idx) => (
                        <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                            <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            </div>

            {/* RIGHT COLUMN: INFO */}
            <div className="md:col-span-5 lg:col-span-4 relative">
                 <div className="md:sticky md:top-24 bg-white md:bg-transparent -mt-4 md:mt-0 px-4 pt-6 pb-20 md:p-0 rounded-t-[1.5rem] md:rounded-none shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-none z-20">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-md">{property.type}</span>
                        {isSold && <span className="bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-md">ปิดการขายแล้ว</span>}
                        <div className="flex items-center text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-md ml-auto md:ml-2">
                           <Eye size={12} className="mr-1" />
                           {property.viewCount ? (property.viewCount + 1).toLocaleString() : 1}
                        </div>
                        <button onClick={handleShare} className="hidden md:flex ml-auto md:ml-2 text-slate-400 hover:text-emerald-600 items-center text-sm font-medium transition-colors"><Share2 size={16} className="mr-1" /> แชร์</button>
                    </div>

                    <h1 className="text-xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">{property.title}</h1>
                    <div className="flex items-center text-slate-500 mb-6 text-sm md:text-base"><MapPin size={18} className="mr-1 flex-shrink-0 text-slate-400" />{property.location}</div>
                    <div className="border-y border-slate-100 py-4 mb-6">
                         <div className="flex items-baseline justify-between">
                            <span className="text-slate-500 text-sm">ราคาขาย</span>
                            <div className="text-right"><span className={`text-3xl font-bold ${isSold ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>฿{property.price.toLocaleString()}</span></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-start">
                            <div className="flex items-center text-slate-400 mb-2"><Ruler size={18} className="mr-2" /><span className="text-xs">ขนาดพื้นที่</span></div>
                            <span className="font-bold text-slate-800 text-lg">{property.size || '-'}</span>
                        </div>
                        <div onClick={handleOpenMap} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-start cursor-pointer hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
                            <div className="flex items-center text-slate-400 mb-2 group-hover:text-emerald-600"><Navigation size={18} className="mr-2" /><span className="text-xs">แผนที่</span></div>
                            <span className="font-bold text-emerald-600 text-sm underline decoration-emerald-300 underline-offset-2">ดูตำแหน่งบน Google Map</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="font-bold text-slate-800 mb-3 text-sm md:text-base">รายละเอียดเพิ่มเติม</h3>
                        <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line">{property.description}</p>
                    </div>

                    <div className="fixed bottom-20 md:bottom-auto left-4 right-4 md:static z-40 md:z-auto">
                        <button onClick={handleContact} disabled={isSold} className={`w-full font-bold py-3.5 px-6 rounded-xl md:rounded-lg shadow-lg md:shadow-md flex items-center justify-center text-lg md:text-base transition-all active:scale-95 ${isSold ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#06C755] hover:bg-[#05b64d] text-white'}`}>
                            <MessageCircle size={24} className="mr-2 md:w-5 md:h-5" />
                            {isSold ? 'ปิดการขายแล้ว' : 'ทักไลน์สอบถาม / นัดดู'}
                        </button>
                    </div>
                 </div>
            </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
                    <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"><X size={24} /></button>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">แชร์ทรัพย์นี้</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <button onClick={handleShareFacebook} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors"><Facebook size={28} /></div>
                            <span className="text-xs font-medium text-slate-600">Facebook</span>
                        </button>
                        <button onClick={handleShareLine} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-green-100 text-[#06C755] rounded-full flex items-center justify-center group-hover:bg-[#06C755] group-hover:text-white transition-colors"><MessageCircle size={28} /></div>
                            <span className="text-xs font-medium text-slate-600">LINE</span>
                        </button>
                        <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white'}`}>
                                {copied ? <Check size={28} /> : <LinkIcon size={28} />}
                            </div>
                            <span className={`text-xs font-medium ${copied ? 'text-emerald-600' : 'text-slate-600'}`}>{copied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}</span>
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailPage;