import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';
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

  return (
    <div 
      onClick={() => navigate(`/property/${property.id}`)}
      className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col h-full active:scale-[0.98] transition-all cursor-pointer group"
    >
      {/* Image Section with Overlays */}
      <div className="relative h-32 w-full bg-slate-200">
        <img 
          src={property.image} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-sm border border-white/10">
          {property.type}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-2 left-2 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm">
           ฿{property.price.toLocaleString()}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-3 flex flex-col justify-between flex-grow">
        <div>
           <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1 leading-tight">{property.title}</h3>
           
           <div className="flex items-center text-slate-500 text-xs mt-1">
              <MapPin size={12} className="mr-0.5 flex-shrink-0" />
              <span className="truncate">{property.location}</span>
           </div>
        </div>

        {/* Quick Action Button (Secondary) */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-end">
            <button 
                onClick={handleInquiry}
                className="text-[#06C755] text-xs font-bold flex items-center hover:bg-[#06C755]/10 px-2 py-1 rounded transition-colors"
            >
                <MessageCircle size={12} className="mr-1" />
                ทักไลน์
            </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;