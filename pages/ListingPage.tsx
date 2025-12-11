import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Loader2, ArrowUpDown } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { getProperties } from '../services/propertyService';
import { PropertyType, Property } from '../types';

const ListingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type') as PropertyType | null;

  const [selectedType, setSelectedType] = useState<PropertyType | 'All'>(typeParam || 'All');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Update selected type when URL param changes
  useEffect(() => {
    const currentType = new URLSearchParams(location.search).get('type') as PropertyType | null;
    if (currentType) {
      setSelectedType(currentType);
    } else {
        setSelectedType('All');
    }
  }, [location.search]);

  // Fetch data when selectedType changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProperties(selectedType);
        setProperties(data);
      } catch (error) {
        console.error("Failed to load properties", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedType]);

  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => {
      if (sortOrder === 'price_asc') {
        return a.price - b.price;
      }
      if (sortOrder === 'price_desc') {
        return b.price - a.price;
      }
      // Newest (Default)
      const getTimestamp = (p: any) => {
        if (!p.createdAt) return 0;
        // Firestore Timestamp
        if (p.createdAt.seconds) return p.createdAt.seconds;
        // JS Date
        if (p.createdAt instanceof Date) return p.createdAt.getTime();
        return 0;
      };
      
      const timeA = getTimestamp(a);
      const timeB = getTimestamp(b);
      return timeB - timeA;
    });
  }, [properties, sortOrder]);

  const handleTypeChange = (type: PropertyType | 'All') => {
      setSelectedType(type);
      if (type === 'All') {
          navigate('/list');
      } else {
          navigate(`/list?type=${type}`);
      }
  };

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
      <div className="flex overflow-x-auto px-4 py-3 space-x-2 no-scrollbar bg-white border-b border-slate-100 sticky top-[53px] z-30">
        {['All', PropertyType.HOUSE, PropertyType.LAND, PropertyType.DORMITORY].map((type) => (
            <button
                key={type}
                onClick={() => handleTypeChange(type as PropertyType | 'All')}
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

      {/* Sorting Control */}
      <div className="px-4 py-2 flex justify-between items-center bg-slate-50">
        <span className="text-xs text-slate-500 font-medium">พบ {sortedProperties.length} รายการ</span>
        <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
            <ArrowUpDown size={12} className="text-slate-400" />
            <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none appearance-none pr-4 relative z-10 cursor-pointer"
                style={{ backgroundImage: 'none' }} 
            >
                <option value="newest">ล่าสุด (ใหม่ ➜ เก่า)</option>
                <option value="price_asc">ราคา (ต่ำ ➜ สูง)</option>
                <option value="price_desc">ราคา (สูง ➜ ต่ำ)</option>
            </select>
        </div>
      </div>

      {/* List */}
      <div className="px-4 grid grid-cols-2 gap-3 mt-2">
        {loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-emerald-600">
                <Loader2 size={32} className="animate-spin mb-2" />
                <p className="text-sm">กำลังโหลดข้อมูล...</p>
            </div>
        ) : sortedProperties.length > 0 ? (
            sortedProperties.map(property => (
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