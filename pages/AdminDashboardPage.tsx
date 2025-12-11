import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, LogOut, Loader2 } from 'lucide-react';
import { logout } from '../services/authService';
import { getProperties, deleteProperty } from '../services/propertyService';
import { Property } from '../types';

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-800 text-white px-6 py-4 sticky top-0 z-40 flex justify-between items-center shadow-md">
        <h1 className="font-bold text-lg">จัดการทรัพย์สิน</h1>
        <button onClick={handleLogout} className="text-slate-300 hover:text-white">
          <LogOut size={20} />
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate('/admin/add')}
          className="w-full bg-emerald-600 text-white py-3 rounded-xl shadow-sm flex items-center justify-center font-bold mb-6"
        >
          <Plus size={20} className="mr-2" />
          เพิ่มทรัพย์ใหม่
        </button>

        <h2 className="text-slate-700 font-bold mb-4">รายการทั้งหมด ({properties.length})</h2>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((p) => {
              const isSold = p.status === 'sold';
              return (
                <div key={p.id} className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4 ${isSold ? 'bg-slate-50' : ''}`}>
                  <div className="relative w-20 h-20 flex-shrink-0">
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
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded whitespace-nowrap border border-slate-200">
                          {p.type}
                        </span>
                        {isSold && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold whitespace-nowrap border border-red-200">
                            ขายแล้ว
                          </span>
                        )}
                      </div>
                      <span className={`font-bold text-sm ${isSold ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>
                        ฿{p.price.toLocaleString()}
                      </span>
                    </div>
                    
                    <h3 className={`font-bold text-sm truncate my-1 ${isSold ? 'text-slate-500' : 'text-slate-800'}`}>
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 truncate">{p.location}</p>
                    
                    <div className="flex justify-end space-x-2 mt-2">
                      <button 
                        onClick={() => navigate(`/admin/edit/${p.id}`)}
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 border border-blue-100"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-100"
                      >
                        <Trash2 size={16} />
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