import React from 'react';
import { MapPin, MessageCircle, Eye, Video, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../types';
import { getPropertyInquiryUrl } from '../services/lineService';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getPropertyInquiryUrl(property), '_blank');
  };

  const isSold = property.status === 'sold';
  const isVideo = property.contentType === 'video';

  return (
    <div 
      onClick={() => navigate(`/property/${property.id}`)}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col h-full active:scale-[0.98] transition-all cursor-pointer group relative hover:shadow-md hover:border-emerald-200"
    >
      {/* Image Section with Overlays */}
      <div className="relative h-40 w-full bg-slate-200 overflow-hidden">
        <img 
          src={property.image} 
          alt={property.title} 
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isSold ? 'grayscale opacity-90' : ''}`}
        />
        
        {/* SOLD RIBBON */}
        {isSold && (
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg shadow-md z-20">
                ปิดการขาย
            </div>
        )}

        {/* VIDEO INDICATOR (Top Left) */}
        {isVideo && (
            <div className="absolute top-2 left-2 z-20 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-lg shadow-sm flex items-center animate-pulse">
                <Video size={12} className="mr-1" fill="currentColor" />
                <span className="text-[10px] font-bold">รีวิว</span>
            </div>
        )}
        
        {/* Type Badge (If not video, or positioned differently) */}
        {!isVideo && (
            <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded shadow-sm border border-white/10">
            {property.type}
            </div>
        )}
        
        {/* Play Button Overlay (Only for Video) */}
        {isVideo && (
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
                 <div className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 shadow-lg">
                     <Play size={16} className="text-white fill-white ml-1" />
                 </div>
             </div>
        )}

        {/* Price Tag Overlay */}
        <div className={`absolute bottom-2 left-2 text-white text-xs font-bold px-2 py-1 rounded shadow-sm ${isSold ? 'bg-slate-500' : 'bg-emerald-600'}`}>
           ฿{property.price.toLocaleString()}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-3 flex flex-col justify-between flex-grow">
        <div>
           <h3 className={`font-bold text-sm mb-1 line-clamp-2 leading-tight h-9 ${isSold ? 'text-slate-500' : 'text-slate-800 group-hover:text-emerald-700 transition-colors'}`}>
             {property.title}
           </h3>
           
           <div className="flex items-center text-slate-500 text-xs mt-1">
              <MapPin size={12} className="mr-0.5 flex-shrink-0 text-slate-400" />
              <span className="truncate">{property.location}</span>
           </div>
        </div>

        {/* Quick Action Button (Secondary) */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
             {/* View Count (Bottom Left) */}
            <div className="flex items-center text-slate-400 text-[10px] font-medium" title="จำนวนคนดู">
               <Eye size={12} className="mr-1" />
               {property.viewCount ? property.viewCount.toLocaleString() : 0}
            </div>

            <button 
                onClick={isSold ? undefined : handleInquiry}
                disabled={isSold}
                className={`text-xs font-bold flex items-center px-2 py-1 rounded-md transition-colors ${isSold ? 'text-slate-400 cursor-not-allowed bg-slate-50' : 'text-[#06C755] hover:bg-[#06C755]/10 bg-[#06C755]/5'}`}
            >
                <MessageCircle size={12} className="mr-1" />
                {isSold ? 'ขายแล้ว' : 'ทักไลน์'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;