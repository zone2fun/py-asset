import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Filter, Phone, Calendar, ChevronRight } from 'lucide-react';
import { getLeads } from '../services/propertyService';
import { Lead, LeadStatus } from '../types';

const AdminLeadsPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<LeadStatus | 'All'>('All');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    const data = await getLeads();
    setLeads(data);
    setLoading(false);
  };

  const filteredLeads = leads.filter(l => filter === 'All' || (l.status || 'pending') === filter);

  // Helper to get status badge styling
  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'contacted':
        return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-md font-bold border border-blue-200">ติดต่อแล้ว</span>;
      case 'contract_signed':
        return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md font-bold border border-green-200">ทำสัญญาแล้ว</span>;
      default: // pending
        return <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-md font-bold border border-orange-200 animate-pulse">รอติดต่อกลับ</span>;
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    // Handle Firestore timestamp or JS Date
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-800 text-white px-4 py-4 sticky top-0 z-40 flex items-center shadow-md">
        <button onClick={() => navigate('/admin')} className="mr-3 p-1 rounded-full hover:bg-slate-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg">รายการทรัพย์ที่ลูกค้าเสนอ (Leads)</h1>
      </div>

      <div className="p-4 max-w-2xl mx-auto">
        
        {/* Filter Tabs */}
        <div className="flex overflow-x-auto no-scrollbar space-x-2 mb-6 py-2">
            {[
                { id: 'All', label: 'ทั้งหมด' },
                { id: 'pending', label: 'รอติดต่อ' },
                { id: 'contacted', label: 'ติดต่อแล้ว' },
                { id: 'contract_signed', label: 'ปิดสัญญา' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                        filter === tab.id 
                        ? 'bg-emerald-600 border-emerald-600 text-white' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="animate-spin text-emerald-600" size={32} />
           </div>
        ) : filteredLeads.length === 0 ? (
           <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
               <Filter size={48} className="mx-auto mb-3 opacity-30" />
               <p>ไม่พบรายการในหมวดนี้</p>
           </div>
        ) : (
           <div className="space-y-3">
              {filteredLeads.map(lead => (
                  <div 
                    key={lead.id} 
                    onClick={() => navigate(`/admin/leads/${lead.id}`)}
                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
                  >
                      <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0 overflow-hidden">
                          {lead.images && lead.images.length > 0 ? (
                              <img src={lead.images[0]} className="w-full h-full object-cover" alt="thumbnail" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                          )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-medium text-slate-500 flex items-center">
                                <Calendar size={12} className="mr-1" /> {formatDate(lead.createdAt)}
                              </span>
                              {getStatusBadge(lead.status || 'pending')}
                          </div>
                          
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1 group-hover:text-emerald-700">
                              {lead.title}
                          </h3>
                          
                          <div className="flex items-center justify-between mt-2">
                             <div className="flex flex-col">
                                 <span className="text-xs text-slate-500">{lead.name}</span>
                                 <span className="text-xs font-bold text-emerald-600">{lead.price} บ.</span>
                             </div>
                             <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500" />
                          </div>
                      </div>
                  </div>
              ))}
           </div>
        )}

      </div>
    </div>
  );
};

export default AdminLeadsPage;