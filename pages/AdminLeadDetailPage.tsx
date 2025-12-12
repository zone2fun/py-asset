import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Phone, MapPin, CheckCircle, Clock, FileText, User } from 'lucide-react';
import { getLeadById, updateLeadStatus } from '../services/propertyService';
import { Lead, LeadStatus } from '../types';

const AdminLeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) fetchLead(id);
  }, [id]);

  const fetchLead = async (leadId: string) => {
    setLoading(true);
    const data = await getLeadById(leadId);
    setLead(data);
    setLoading(false);
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead || !id) return;
    if (!confirm(`ยืนยันเปลี่ยนสถานะเป็น "${getStatusLabel(newStatus)}"?`)) return;
    
    setUpdating(true);
    try {
        await updateLeadStatus(id, newStatus);
        setLead({ ...lead, status: newStatus }); // Optimistic update
    } catch (error) {
        alert("อัปเดตสถานะไม่สำเร็จ");
    } finally {
        setUpdating(false);
    }
  };

  const getStatusLabel = (status: string) => {
      switch(status) {
          case 'pending': return 'ยังไม่ได้ติดต่อกลับ';
          case 'contacted': return 'ติดต่อกลับแล้ว';
          case 'contract_signed': return 'ทำสัญญาปิดเรียบร้อย';
          default: return status;
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;
  if (!lead) return <div className="p-8 text-center">ไม่พบข้อมูล</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-800 text-white px-4 py-4 sticky top-0 z-40 flex items-center shadow-md">
        <button onClick={() => navigate('/admin/leads')} className="mr-3 p-1 rounded-full hover:bg-slate-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-lg truncate">รายละเอียด: {lead.title}</h1>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        
        {/* Status Control Panel */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">จัดการสถานะ</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                    onClick={() => handleStatusChange('pending')}
                    disabled={updating}
                    className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                        (lead.status || 'pending') === 'pending' 
                        ? 'bg-orange-100 border-orange-300 text-orange-800 font-bold ring-2 ring-orange-200' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Clock size={18} className="mr-2" /> ยังไม่ได้ติดต่อ
                </button>
                <button 
                    onClick={() => handleStatusChange('contacted')}
                    disabled={updating}
                    className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                        lead.status === 'contacted' 
                        ? 'bg-blue-100 border-blue-300 text-blue-800 font-bold ring-2 ring-blue-200' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Phone size={18} className="mr-2" /> ติดต่อแล้ว
                </button>
                <button 
                    onClick={() => handleStatusChange('contract_signed')}
                    disabled={updating}
                    className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                        lead.status === 'contract_signed' 
                        ? 'bg-green-100 border-green-300 text-green-800 font-bold ring-2 ring-green-200' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <CheckCircle size={18} className="mr-2" /> ปิดสัญญาเรียบร้อย
                </button>
            </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center">
                 <User size={16} className="mr-1" /> ข้อมูลผู้ติดต่อ
             </h3>
             <div className="space-y-3">
                 <div className="flex justify-between border-b border-slate-100 pb-2">
                     <span className="text-slate-500">ชื่อ</span>
                     <span className="font-bold text-slate-800">{lead.name}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                     <span className="text-slate-500">เบอร์โทร</span>
                     <a href={`tel:${lead.phone}`} className="font-bold text-emerald-600 flex items-center bg-emerald-50 px-3 py-1 rounded-full hover:bg-emerald-100">
                         <Phone size={14} className="mr-1" /> {lead.phone}
                     </a>
                 </div>
             </div>
        </div>

        {/* Property Details */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center">
                 <FileText size={16} className="mr-1" /> ข้อมูลทรัพย์
             </h3>
             <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                     <div>
                         <span className="text-xs text-slate-500 block mb-1">ราคาที่เสนอ</span>
                         <span className="font-bold text-lg text-slate-800">{lead.price}</span>
                     </div>
                     <div>
                         <span className="text-xs text-slate-500 block mb-1">ประเภท</span>
                         <span className="font-bold text-lg text-slate-800">{lead.type}</span>
                     </div>
                     <div>
                         <span className="text-xs text-slate-500 block mb-1">ขนาด</span>
                         <span className="font-bold text-slate-800">{lead.size || '-'}</span>
                     </div>
                     <div>
                         <span className="text-xs text-slate-500 block mb-1">พิกัด</span>
                         {lead.latitude && lead.longitude ? (
                             <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${lead.latitude},${lead.longitude}`} 
                                target="_blank"
                                className="text-blue-600 underline text-sm flex items-center"
                             >
                                 <MapPin size={14} className="mr-1" /> ดูแผนที่
                             </a>
                         ) : <span className="text-slate-400 text-sm">-</span>}
                     </div>
                 </div>
                 
                 <div>
                     <span className="text-xs text-slate-500 block mb-2">รายละเอียดเพิ่มเติม</span>
                     <div className="bg-slate-50 p-3 rounded-lg text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                         {lead.description || '-'}
                     </div>
                 </div>
             </div>
        </div>

        {/* Images */}
        <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-500 px-1">รูปภาพประกอบ ({lead.images?.length || 0})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {lead.images && lead.images.map((img, idx) => (
                    <a key={idx} href={img} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden shadow-sm hover:opacity-90 transition-opacity">
                        <img src={img} alt={`lead-${idx}`} className="w-full h-full object-cover" />
                    </a>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default AdminLeadDetailPage;