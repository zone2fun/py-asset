import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Loader2, ArrowUpDown, Video, Coins } from 'lucide-react';
import PropertyCard from '../components/PropertyCard';
import { getProperties } from '../services/propertyService';
import { PropertyType, Property } from '../types';
import SEO from '../components/SEO';

const ListingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type');

  const [selectedType, setSelectedType] = useState<PropertyType | 'All' | 'VIDEO' | 'HUNDRED_K'>('All');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<string>('newest');

  // Update selected type when URL param changes
  useEffect(() => {
    const currentType = new URLSearchParams(location.search).get('type');
    if (currentType) {
      setSelectedType(currentType as any);
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

  const handleTypeChange = (type: PropertyType | 'All' | 'VIDEO' | 'HUNDRED_K') => {
      setSelectedType(type);
      if (type === 'All') {
          navigate('/list');
      } else {
          navigate(`/list?type=${type}`);
      }
  };

  // Dynamic SEO Generator
  const getSEO = () => {
      if (selectedType === 'VIDEO') {
          return {
              title: "วิดีโอรีวิวบ้านและที่ดินพะเยา - ดูของจริงก่อนตัดสินใจ",
              desc: "รวมคลิปวิดีโอรีวิวบ้าน ที่ดิน หอพัก ในจังหวัดพะเยา พาชมทุกซอกทุกมุม เหมือนไปดูด้วยตัวเอง",
              kw: "รีวิวบ้านพะเยา, วิดีโอขายบ้าน, คลิปขายที่ดิน"
          };
      } else if (selectedType === 'HUNDRED_K') {
          return {
              title: "ขายบ้านและที่ดินราคาหลักแสน พะเยา",
              desc: "รวมทรัพย์ราคาถูก เริ่มต้น 1 แสนบาท ไม่เกินล้าน พะเยา เจ้าของขายเอง ราคาดีที่สุดในตลาด",
              kw: "บ้านราคาถูกพะเยา, ที่ดินหลักแสน, บ้านหลักแสน"
          };
      } else if (selectedType === PropertyType.HOUSE) {
          return {
              title: "ขายบ้านพะเยา บ้านมือสอง ราคาถูก",
              desc: "รวมประกาศขายบ้านพะเยา บ้านเดี่ยว ทาวน์โฮม บ้านมือสองสภาพดี ในอำเภอเมือง แม่ใจ เชียงคำ และทั่วจังหวัดพะเยา",
              kw: "ขายบ้านพะเยา, บ้านมือสองพะเยา, บ้านเดี่ยวพะเยา, ซื้อบ้านพะเยา"
          };
      } else if (selectedType === PropertyType.LAND) {
          return {
              title: "ขายที่ดินพะเยา ราคาถูก เจ้าของขายเอง",
              desc: "รวมประกาศขายที่ดินพะเยา ที่ดินเปล่า ที่นา ที่สวน ถมแล้ว ทำเลดี เหมาะสร้างบ้านหรือเก็งกำไร",
              kw: "ขายที่ดินพะเยา, ที่ดินเปล่าพะเยา, ที่ดินราคาถูก, ซื้อที่ดินพะเยา"
          };
      } else if (selectedType === PropertyType.DORMITORY) {
           return {
              title: "ขายหอพักพะเยา กิจการหอพักน่าลงทุน",
              desc: "เซ้ง/ขายกิจการหอพักพะเยา หอพักหน้ามอพะเยา อพาร์ทเม้นท์ ผลตอบแทนสูง",
              kw: "ขายหอพักพะเยา, เซ้งหอพักพะเยา, ลงทุนหอพัก"
          };
      }
      return {
          title: "รายการทรัพย์ทั้งหมด - ขายบ้านและที่ดินพะเยา",
          desc: "ดูรายการประกาศขายบ้าน ที่ดิน หอพัก ทั้งหมดในจังหวัดพะเยา อัปเดตล่าสุด",
          kw: "อสังหาพะเยา, ประกาศขายบ้าน"
      };
  };

  const seoData = getSEO();

  const filterOptions = [
      { id: 'All', label: 'ทั้งหมด', icon: null },
      { id: 'HUNDRED_K', label: 'ทรัพย์หลักแสน', icon: <Coins size={16} className="mr-1"/> },
      { id: 'VIDEO', label: 'วิดีโอรีวิว', icon: <Video size={16} className="mr-1"/> },
      { id: PropertyType.HOUSE, label: PropertyType.HOUSE, icon: null },
      { id: PropertyType.LAND, label: PropertyType.LAND, icon: null },
      { id: PropertyType.DORMITORY, label: PropertyType.DORMITORY, icon: null },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-slate-50">
      <SEO 
        title={seoData.title}
        description={seoData.desc}
        keywords={seoData.kw}
      />
      <div className="max-w-7xl mx-auto md:px-6">
        {/* Header & Controls */}
        <div className="bg-white md:bg-transparent px-4 py-3 md:pt-8 md:pb-4 shadow-sm md:shadow-none sticky md:static top-0 z-40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center">
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-600 mr-2 md:hidden"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="font-bold text-xl text-slate-800">
                        {selectedType === 'All' ? 'รายการทรัพย์ทั้งหมด' : 
                         selectedType === 'HUNDRED_K' ? 'ทรัพย์หลักแสน' :
                         selectedType === 'VIDEO' ? 'วิดีโอรีวิว' : selectedType}
                    </h1>
                    <span className="hidden md:inline-block ml-3 text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {sortedProperties.length} รายการ
                    </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                    {/* Filter Chips */}
                    <div className="flex overflow-x-auto no-scrollbar space-x-2 pb-1 md:pb-0">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleTypeChange(opt.id as any)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors border flex items-center ${
                                    selectedType === opt.id 
                                    ? (opt.id === 'VIDEO' ? 'bg-red-600 border-red-600 text-white shadow-sm' : 
                                       opt.id === 'HUNDRED_K' ? 'bg-orange-500 border-orange-500 text-white shadow-sm' :
                                       'bg-emerald-600 border-emerald-600 text-white shadow-sm')
                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                {opt.icon}
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Sorting Control */}
                    <div className="flex items-center space-x-1 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm ml-auto flex-shrink-0">
                        <ArrowUpDown size={14} className="text-slate-400" />
                        <select 
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="text-sm font-bold text-slate-700 bg-transparent border-none outline-none appearance-none pr-4 relative z-10 cursor-pointer focus:ring-0"
                            style={{ backgroundImage: 'none' }} 
                        >
                            <option value="newest">ล่าสุด</option>
                            <option value="price_asc">ราคาต่ำสุด</option>
                            <option value="price_desc">ราคาสูงสุด</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="md:hidden mt-2 text-xs text-slate-500 font-medium">
                พบ {sortedProperties.length} รายการ
            </div>
        </div>

        {/* List */}
        <div className="px-4 md:px-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6 mt-4">
            {loading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-32 text-emerald-600">
                    <Loader2 size={40} className="animate-spin mb-3" />
                    <p className="text-base font-medium">กำลังโหลดข้อมูล...</p>
                </div>
            ) : sortedProperties.length > 0 ? (
                sortedProperties.map(property => (
                    <PropertyCard key={property.id} property={property} />
                ))
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                    <Filter size={64} className="mb-4 opacity-20" />
                    <p className="text-lg font-medium">ไม่พบรายการทรัพย์ในหมวดหมู่นี้</p>
                    <button onClick={() => setSelectedType('All')} className="mt-4 text-emerald-600 font-bold hover:underline">
                        ดูรายการทั้งหมด
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ListingPage;