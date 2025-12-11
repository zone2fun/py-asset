import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, Loader2, Home, Trees, Building, X } from 'lucide-react';
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
      // Fix: Explicitly cast to File[] to prevent 'unknown' type error in map callback
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
    if (!confirm("ยืนยันการส่งข้อมูล?")) return;

    setIsSubmitting(true);
    try {
      // 1. Upload Images
      const imageUrls = await uploadImages(form.images);

      // 2. Save Lead to Firebase (Optional, but good for record)
      const leadId = await submitUserLead(form, imageUrls);

      // 3. Generate LINE Message
      const mapLink = form.latitude ? `https://maps.google.com/?q=${form.latitude},${form.longitude}` : 'ไม่ระบุ';
      
      // Create a list of all image links
      const imageLinksText = imageUrls.map((url, index) => `${index + 1}. ${url}`).join('\n');

      const message = `
ฝากขายทรัพย์ (Lead #${leadId})
เรื่อง: ${form.title}
ประเภท: ${form.type}
ราคา: ${form.price}
ขนาด: ${form.size}
พิกัด: ${mapLink}
ผู้ติดต่อ: ${form.name} (${form.phone})
รายละเอียด: ${form.description}

📂 ลิงก์รูปภาพทั้งหมด (${imageUrls.length} รูป):
${imageLinksText}

(กรุณากดส่งข้อความนี้ แล้วส่งรูปภาพจากอัลบั้มตามเข้ามาในแชทอีกครั้งเพื่อความสะดวกครับ)
`.trim();

      const encodedMessage = encodeURIComponent(message);
      const lineUrl = `https://line.me/R/oaMessage/${LINE_OA_ID}/?${encodedMessage}`;

      // 4. Redirect
      window.open(lineUrl, '_blank');
      
      // Reset
      setForm({ title: '', price: '', type: PropertyType.HOUSE, size: '', name: '', phone: '', description: '', latitude: null, longitude: null, images: [] });
      setPreviewUrls([]);

    } catch (error: any) {
      console.error(error);
      if (error.message === "CORS_ERROR") {
        alert("ไม่สามารถอัปโหลดรูปภาพได้เนื่องจากปัญหาความปลอดภัย (CORS)\nกรุณาแจ้ง Admin ให้แก้ไขการตั้งค่า Firebase Storage");
      } else {
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 bg-white min-h-screen">
       <div className="bg-emerald-600 px-6 py-8 rounded-b-[2rem] shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">ฝากขายทรัพย์</h1>
        <p className="text-emerald-100 text-sm">ส่งข้อมูลให้เราช่วยขาย (ฟรี)</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        
        {/* Images */}
        <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">รูปภาพทรัพย์ *</label>
            <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border">
                        <img src={url} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={12}/></button>
                    </div>
                ))}
                {form.images.length < 10 && (
                    <div onClick={() => fileInputRef.current?.click()} className="aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 text-slate-400">
                        <Camera size={24} />
                        <span className="text-[10px]">เพิ่มรูป</span>
                        <input type="file" ref={fileInputRef} accept="image/*" multiple hidden onChange={handleFileChange} />
                    </div>
                )}
            </div>
        </div>

        {/* Type */}
        <div className="grid grid-cols-3 gap-2">
            {[PropertyType.HOUSE, PropertyType.LAND, PropertyType.DORMITORY].map(t => (
                <button key={t} type="button" onClick={() => handleTypeSelect(t)} 
                    className={`p-3 rounded-xl border flex flex-col items-center ${form.type === t ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200'}`}>
                    <span className="text-xs font-bold">{t}</span>
                </button>
            ))}
        </div>

        <div className="space-y-4">
            <input type="text" name="title" value={form.title} onChange={handleInputChange} placeholder="หัวข้อประกาศ *" required className="w-full p-3 border rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="price" value={form.price} onChange={handleInputChange} placeholder="ราคา *" required className="w-full p-3 border rounded-xl" />
                <input type="text" name="size" value={form.size} onChange={handleInputChange} placeholder="ขนาดพื้นที่" className="w-full p-3 border rounded-xl" />
            </div>
            <textarea name="description" value={form.description} onChange={handleInputChange} placeholder="รายละเอียดเพิ่มเติม..." className="w-full p-3 border rounded-xl h-24" />
        </div>

        {/* Location */}
        <div className="flex space-x-2">
            <input type="text" value={form.latitude ? `${form.latitude.toFixed(4)}, ${form.longitude?.toFixed(4)}` : ''} placeholder="พิกัด (ไม่บังคับ)" readOnly className="flex-grow p-3 bg-slate-50 border rounded-xl text-sm" />
            <button type="button" onClick={getLocation} className="bg-slate-100 p-3 rounded-xl border"><MapPin size={20} className={loadingLoc ? 'animate-bounce' : ''} /></button>
        </div>

        <div className="border-t pt-4">
            <h3 className="text-sm font-bold mb-3">ข้อมูลติดต่อของคุณ</h3>
            <div className="grid grid-cols-2 gap-4">
                <input type="text" name="name" value={form.name} onChange={handleInputChange} placeholder="ชื่อ" required className="w-full p-3 border rounded-xl" />
                <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} placeholder="เบอร์โทร" required className="w-full p-3 border rounded-xl" />
            </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-[#06C755] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center">
            {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send size={20} className="mr-2" />}
            ส่งข้อมูลทาง LINE
        </button>
      </form>
    </div>
  );
};

export default SubmitPropertyPage;