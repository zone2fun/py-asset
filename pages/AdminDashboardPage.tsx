import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, Loader2, Users, LayoutDashboard, Video, Star, CheckCircle } from 'lucide-react';
import { logout } from '../services/authService';
import { getProperties, deleteProperty } from '../services/propertyService';
import { Property } from '../types';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Video' | 'Recommended' | 'Sold'>('All');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    const data = await getProperties('All');
    setProperties(data);
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบรายการนี้?')) {
      try {
        await deleteProperty(id);
        alert('ลบเรียบร้อยแล้ว');
        loadProperties(); // Reload list
      } catch (error) {
        alert('เกิดข้อผิดพลาดในการลบ');
        console.error(error);
      }
    }
  };

  const filteredProperties = properties.filter(p => {
    if (filter === 'All') return true;
    if (filter === 'Video') return p.contentType === 'video';
    if (filter === 'Recommended') return p.isRecommended;
    if (filter === 'Sold') return p.status === 'sold';
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      <div className="bg-slate-800 text-white px-6 py-4 sticky top-0 z-40 flex justify-between items-center shadow-md">
        <h1 className="font-bold text-lg flex items-center">
            <LayoutDashboard size={20} className="mr-2"/> จัดการทรัพย์สิน
        </h1>
        <button onClick={handleLogout} className="text-slate-300 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>

      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
                onClick={() => navigate('/admin/add')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white py-4 px-6 rounded-xl shadow-sm flex items-center justify-center font-bold transition-colors text-lg"
            >
                <Plus size={24} className="mr-3" />
                เพิ่มทรัพย์ใหม่ (Listing)
            </button>

            <button
                onClick={() => navigate('/admin/leads')}
                className="bg-white border-2 border-slate-200 hover:border-emerald-500 hover:text-emerald-600 text-slate-700 py-4 px-6 rounded-xl shadow-sm flex items-center justify-center font-bold transition-all text-lg"
            >
                <Users size={24} className="mr-3" />
                รายการที่ลูกค้าเสนอ (Leads)
            </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h2 className="text-slate-700 font-bold text-xl">
                {filter === 'All' ? 'ประกาศทั้งหมด' : 
                 filter === 'Video' ? 'วิดีโอรีวิว' :
                 filter === 'Recommended' ? 'ทรัพย์น่าซื้อ (แนะนำ)' : 'รายการที่ขายแล้ว'} 
                <span className="ml-2 text-sm bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{filteredProperties.length}</span>
            </h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilter('All')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border ${filter === 'All' ? 'bg-slate-800 border-slate-800 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                    ทั้งหมด
                </button>
                <button
                    onClick={() => setFilter('Video')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border flex items-center ${filter === 'Video' ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                    <Video size={14} className="mr-1" /> รีวิว
                </button>
                <button
                    onClick={() => setFilter('Recommended')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border flex items-center ${filter === 'Recommended' ? 'bg-yellow-500 border-yellow-500 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                    <Star size={14} className="mr-1" /> น่าซื้อ
                </button>
                <button
                    onClick={() => setFilter('Sold')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors border flex items-center ${filter === 'Sold' ? 'bg-slate-500 border-slate-500 text-white' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                >
                    <CheckCircle size={14} className="mr-1" /> ขายแล้ว
                </button>
            </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : filteredProperties.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
               <p>ไม่พบรายการในหมวดนี้</p>
               <button onClick={() => setFilter('All')} className="text-emerald-600 font-bold text-sm mt-2 hover:underline">ดูทั้งหมด</button>
           </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((p) => {
              const isSold = p.status === 'sold';
              const isRec = p.isRecommended;
              const isVideo = p.contentType === 'video';
              
              return (
                <div key={p.id} className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 items-center ${isSold ? 'bg-slate-50' : ''} hover:border-emerald-200 transition-colors`}>
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <img 
                      src={p.image} 
                      alt={p.title} 
                      className={`w-full h-full object-cover rounded-lg bg-slate-200 ${isSold ? 'grayscale opacity-75' : ''}`} 
                    />
                    {isSold && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                        <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded font-bold">SOLD</span>
                      </div>
                    )}
                    {/* Status Icons Overlay */}
                    <div className="absolute top-1 left-1 flex flex-col gap-1">
                        {isRec && !isSold && <div className="bg-yellow-400 text-white p-1 rounded-full shadow-sm"><Star size={10} fill="currentColor" /></div>}
                        {isVideo && <div className="bg-red-600 text-white p-1 rounded-full shadow-sm"><Video size={10} fill="currentColor" /></div>}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex gap-1 flex-wrap items-center">
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md whitespace-nowrap border border-slate-200 font-medium">
                          {p.type}
                        </span>
                        {isRec && (
                            <span className="text-[10px] flex items-center bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200 font-bold">
                                <Star size={10} className="mr-1" /> แนะนำ
                            </span>
                        )}
                        {isVideo && (
                            <span className="text-[10px] flex items-center bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200 font-bold">
                                <Video size={10} className="mr-1" /> รีวิว
                            </span>
                        )}
                      </div>
                      <span className={`font-bold text-lg ${isSold ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                        ฿{p.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className={`font-bold text-base truncate my-1 ${isSold ? 'text-slate-500' : 'text-slate-800'}`}>
                      {p.title}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">{p.location}</p>
                    
                    <div className="flex justify-end space-x-2 mt-3 md:mt-1">
                      <button 
                        onClick={() => navigate(`/admin/edit/${p.id}`)}
                        className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100 text-sm font-medium transition-colors"
                      >
                        <Edit size={14} className="mr-1.5" /> แก้ไข
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100 text-sm font-medium transition-colors"
                      >
                        <Trash2 size={14} className="mr-1.5" /> ลบ
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;