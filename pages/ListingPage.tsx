import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { MOCK_PROPERTIES } from '../constants';
import { PropertyType } from '../types';

const ListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type') as PropertyType | null;

  const [selectedType, setSelectedType] = useState<PropertyType | 'All'>(typeParam || 'All');

  useEffect(() => {
      if (typeParam) {
          setSelectedType(typeParam);
      }
  }, [typeParam]);

  const filteredProperties = MOCK_PROPERTIES.filter(p => 
    selectedType === 'All' ? true : p.type === selectedType
  );

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-40 flex items-center justify-between">
        <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-base text-slate-800">
            {selectedType === 'All' ? 'รายการทรัพย์ทั้งหมด' : selectedType}
        </h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Filter Chips */}
      <div className="flex overflow-x-auto px-4 py-3 space-x-2 no-scrollbar bg-white border-b border-slate-100 mb-4 sticky top-[53px] z-30">
        {['All', PropertyType.HOUSE, PropertyType.LAND, PropertyType.DORMITORY].map((type) => (
            <button
                key={type}
                onClick={() => setSelectedType(type as PropertyType | 'All')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                    selectedType === type 
                    ? 'bg-emerald-600 border-emerald-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
                {type === 'All' ? 'ทั้งหมด' : type}
            </button>
        ))}
      </div>

      {/* List */}
      <div className="px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProperties.length > 0 ? (
            filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
            ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                <Filter size={48} className="mb-4 opacity-20" />
                <p>ไม่พบรายการทรัพย์ในหมวดหมู่นี้</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ListingPage;