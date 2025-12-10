import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, AlertCircle, X, Plus } from 'lucide-react';
import { SubmissionForm } from '../types';
import { formatSubmissionMessage } from '../services/lineService';
import { LINE_OA_ID } from '../constants';

const SubmitPropertyPage: React.FC = () => {
  const [form, setForm] = useState<SubmissionForm>({
    name: '',
    phone: '',
    description: '',
    latitude: null,
    longitude: null,
    images: []
  });
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const totalImages = form.images.length + newFiles.length;

      if (totalImages > 10) {
        alert("คุณสามารถอัปโหลดได้สูงสุด 10 รูปเท่านั้น");
        return;
      }

      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));

      setForm(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const getLocation = () => {
    setLoadingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setLoadingLoc(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("ไม่สามารถดึงตำแหน่งได้ กรุณาเปิดใช้งาน GPS");
          setLoadingLoc(false);
        }
      );
    } else {
      alert("Browser ของคุณไม่รองรับ Geolocation");
      setLoadingLoc(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.images.length === 0) {
        alert("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");
        return;
    }

    // In a real app with a backend, we would upload the image and data via API here.
    // For this client-only demo, we generate a message and guide the user to LINE.
    
    const message = formatSubmissionMessage(form);
    const encodedMessage = encodeURIComponent(message);
    const lineUrl = `https://line.me/R/oaMessage/${LINE_OA_ID}/?${encodedMessage}`;

    // Confirm dialog
    if (confirm(`ระบบจะเปิดแอป LINE เพื่อส่งข้อมูล\n\nอย่าลืมส่งรูปภาพทั้ง ${form.images.length} รูป เข้าไปในแชทด้วยนะครับ`)) {
       window.open(lineUrl, '_blank');
    }
  };

  return (
    <div className="pb-24 bg-white min-h-screen">
       <div className="bg-emerald-600 px-6 py-8 rounded-b-[2rem] shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">เสนอทรัพย์</h1>
        <p className="text-emerald-100 text-sm">ส่งข้อมูลทรัพย์ที่คุณต้องการฝากขาย</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        
        {/* Image Upload / Camera */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">รูปภาพทรัพย์ *</label>
                <span className="text-xs text-slate-500">{form.images.length}/10 รูป</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                {/* Preview Images */}
                {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {/* Add Button */}
                {form.images.length < 10 && (
                    <div 
                        className="relative aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition-all active:scale-95"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera size={24} className="text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500">เพิ่มรูป</span>
                        <input 
                            type="file" 
                            accept="image/*" 
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                )}
            </div>
            {form.images.length === 0 && (
                <p className="text-xs text-red-400">* กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป</p>
            )}
        </div>

        {/* Form Fields */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ติดต่อ</label>
            <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleInputChange} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="ชื่อ-นามสกุล"
                required
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เบอร์โทรศัพท์</label>
            <input 
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={handleInputChange} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0xx-xxx-xxxx"
                required
            />
        </div>

        {/* Geolocation */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ตำแหน่งที่ตั้ง</label>
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    value={form.latitude ? `${form.latitude}, ${form.longitude}` : ''}
                    className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                    placeholder="พิกัด GPS"
                    readOnly
                />
                <button 
                    type="button" 
                    onClick={getLocation}
                    disabled={loadingLoc}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-lg flex items-center justify-center transition-colors border border-slate-200"
                >
                    <MapPin size={20} className={loadingLoc ? 'animate-bounce' : ''} />
                </button>
            </div>
            {form.latitude && (
                <p className="text-xs text-green-600 mt-1 flex items-center">
                    <AlertCircle size={12} className="mr-1" /> ดึงตำแหน่งเรียบร้อยแล้ว
                </p>
            )}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
            <textarea 
                name="description" 
                value={form.description} 
                onChange={handleInputChange} 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-32"
                placeholder="รายละเอียดทรัพย์, ราคาที่ต้องการขาย, ฯลฯ"
                required
            />
        </div>

        <button 
            type="submit" 
            className="w-full bg-[#06C755] hover:bg-[#05b64d] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center text-lg transition-transform active:scale-95"
        >
            <Send size={20} className="mr-2" />
            ส่งข้อมูลทาง LINE
        </button>

        <p className="text-xs text-center text-slate-400 mt-4">
            * ระบบจะทำการสร้างข้อความอัตโนมัติเพื่อให้คุณส่งต่อใน LINE
        </p>

      </form>
    </div>
  );
};

export default SubmitPropertyPage;