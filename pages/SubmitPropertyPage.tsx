import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, Loader2, X, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { SubmissionForm, PropertyType } from '../types';
import { LINE_OA_ID } from '../constants';
import { uploadImages, submitUserLead } from '../services/propertyService';

const SubmitPropertyPage: React.FC = () => {
  const [form, setForm] = useState<SubmissionForm>({
    title: '',
    price: '',
    type: PropertyType.HOUSE,
    size: '',
    name: '',
    phone: '',
    description: '',
    latitude: null,
    longitude: null,
    images: []
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Success State
  const [isSuccess, setIsSuccess] = useState(false);
  const [lineLink, setLineLink] = useState('');
  const [leadId, setLeadId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: PropertyType) => {
    setForm(prev => ({ ...prev, type }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      if (form.images.length + newFiles.length > 10) {
        alert("อัปโหลดได้สูงสุด 10 รูป");
        return;
      }
      setForm(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
      setPreviewUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getLocation = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
          setLoadingLoc(false);
        },
        () => { alert("ไม่สามารถดึงตำแหน่งได้"); setLoadingLoc(false); }
      );
    } else {
      setLoadingLoc(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.images.length === 0) {
      alert("กรุณาใส่รูปอย่างน้อย 1 รูป");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Upload Images
      const imageUrls = await uploadImages(form.images);

      // 2. Save Lead to Firebase
      const generatedLeadId = await submitUserLead(form, imageUrls);
      setLeadId(generatedLeadId);

      // 3. Generate LINE Message
      const mapLink = form.latitude ? `https://maps.google.com/?q=${form.latitude},${form.longitude}` : 'ไม่ระบุ';
      
      // Create a neat list of images for the admin to see (optional, mostly use first one)
      const galleryLink = imageUrls[0]; 

      const message = `
🟢 ฝากขายทรัพย์ใหม่ (ID: ${generatedLeadId.substring(0,6)})
------------------
📌 เรื่อง: ${form.title}
🏠 ประเภท: ${form.type}
💰 ราคา: ${form.price}
📐 ขนาด: ${form.size}
📍 พิกัด: ${mapLink}

👤 ผู้ติดต่อ: ${form.name}
📞 เบอร์โทร: ${form.phone}

📝 รายละเอียด:
${form.description}

🖼️ รูปภาพแนบ:
${galleryLink}
(และอีก ${imageUrls.length - 1} รูป)
------------------
(ลูกค้า: กรุณากดส่งข้อความนี้ แล้วส่งรูปจากอัลบั้มเพิ่มได้เลยครับ)
`.trim();

      const encodedMessage = encodeURIComponent(message);
      // Use standard line.me/R/oaMessage/ which is universal for Official Accounts
      const finalLineUrl = `https://line.me/R/oaMessage/${LINE_OA_ID}/?${encodedMessage}`;
      
      setLineLink(finalLineUrl);
      setIsSuccess(true);

    } catch (error: any) {
      console.error(error);
      if (error.message === "CORS_ERROR") {
        alert("ไม่สามารถอัปโหลดรูปภาพได้ (ติดสิทธิ์การเข้าถึง CORS) กรุณาแจ้งแอดมิน");
      } else {
        alert("เกิดข้อผิดพลาด: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ title: '', price: '', type: PropertyType.HOUSE, size: '', name: '', phone: '', description: '', latitude: null, longitude: null, images: [] });
    setPreviewUrls([]);
    setIsSuccess(false);
    setLineLink('');
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">บันทึกข้อมูลสำเร็จ!</h2>
        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
          ข้อมูลของคุณถูกบันทึกในระบบแล้ว ขั้นตอนสุดท้ายคือกดปุ่มด้านล่างเพื่อแจ้ง Admin ทาง LINE
        </p>

        <a 
          href={lineLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full max-w-sm bg-[#06C755] hover:bg-[#05b64d] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center text-lg transform transition-transform active:scale-95 mb-4"
        >
          <Send size={24} className="mr-2" />
          ส่งข้อมูลเข้า LINE เดี๋ยวนี้
        </a>

        <p className="text-xs text-slate-400 mb-8">
          (หากกดปุ่มแล้วไม่ไป ให้ลองกดซ้ำอีกครั้ง)
        </p>

        <button 
          onClick={handleReset}
          className="text-slate-500 hover:text-emerald-600 font-medium flex items-center text-sm"
        >
          <RefreshCw size={14} className="mr-1" />
          ส่งรายการอื่นเพิ่ม
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-slate-50 min-h-screen md:py-10">
      <div className="max-w-2xl mx-auto bg-white md:rounded-2xl md:shadow-lg md:border border-slate-100 overflow-hidden">
        
       <div className="bg-emerald-600 px-6 py-8 md:py-6 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">ฝากขายทรัพย์</h1>
        <p className="text-emerald-100 text-sm">กรอกข้อมูลเพื่อให้เราช่วยทำการตลาดฟรี</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-6">
        
        {/* Images */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">รูปภาพทรัพย์ *</label>
            <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border">
                        <img src={url} className="w-full h-full object-cover" alt="preview" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={12}/></button>
                    </div>
                ))}
                {form.images.length < 10 && (
                    <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 text-slate-400 hover:bg-slate-100 transition-colors">
                        <Camera size={24} />
                        <span className="text-[10px] mt-1">เพิ่มรูป</span>
                        <input type="file" ref={fileInputRef} accept="image/*" multiple hidden onChange={handleFileChange} />
                    </div>
                )}
            </div>
            <p className="text-xs text-slate-400 text-right">สูงสุด 10 รูป</p>
        </div>

        {/* Type */}
        <div className="grid grid-cols-3 gap-2">
            {[PropertyType.HOUSE, PropertyType.LAND, PropertyType.DORMITORY].map(t => (
                <button key={t} type="button" onClick={() => handleTypeSelect(t)} 
                    className={`p-3 rounded-xl border flex flex-col items-center transition-all ${form.type === t ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-slate-200 text-slate-600'}`}>
                    <span className="text-xs font-bold">{t}</span>
                </button>
            ))}
        </div>

        <div className="space-y-4">
            <input type="text" name="title" value={form.title} onChange={handleInputChange} placeholder="หัวข้อประกาศ (เช่น ขายบ้านเดี่ยว 2 ชั้น) *" required className="w-full p-3 border rounded-xl focus:border-emerald-500 outline-none" />
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="price" value={form.price} onChange={handleInputChange} placeholder="ราคา (บาท) *" required className="w-full p-3 border rounded-xl focus:border-emerald-500 outline-none" />
                <input type="text" name="size" value={form.size} onChange={handleInputChange} placeholder="ขนาด (เช่น 50 ตร.ว.)" className="w-full p-3 border rounded-xl focus:border-emerald-500 outline-none" />
            </div>
            <textarea name="description" value={form.description} onChange={handleInputChange} placeholder="รายละเอียดเพิ่มเติม..." className="w-full p-3 border rounded-xl h-24 focus:border-emerald-500 outline-none" />
        </div>

        {/* Location */}
        <div className="flex space-x-2">
            <input type="text" value={form.latitude ? `${form.latitude.toFixed(6)}, ${form.longitude?.toFixed(6)}` : ''} placeholder="พิกัด (ไม่บังคับ)" readOnly className="flex-grow p-3 bg-slate-50 border rounded-xl text-sm text-slate-500" />
            <button type="button" onClick={getLocation} className="bg-slate-100 p-3 rounded-xl border hover:bg-slate-200 transition-colors"><MapPin size={20} className={`text-slate-600 ${loadingLoc ? 'animate-bounce' : ''}`} /></button>
        </div>

        <div className="border-t pt-4">
            <h3 className="text-sm font-bold mb-3 text-slate-800">ข้อมูลติดต่อของคุณ</h3>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="ชื่อผู้ติดต่อ *" required className="w-full p-3 border rounded-xl focus:border-emerald-500 outline-none" />
                <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} placeholder="เบอร์โทร *" required className="w-full p-3 border rounded-xl focus:border-emerald-500 outline-none" />
            </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed hover:bg-slate-900 transition-colors">
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <ArrowRight size={20} className="mr-2" />}
            บันทึกและไปต่อ
        </button>
      </form>
     </div>
    </div>
  );
};

export default SubmitPropertyPage;