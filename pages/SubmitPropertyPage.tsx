import React, { useState, useRef } from 'react';
import { Camera, MapPin, Send, AlertCircle, X, Loader2, Home, Trees, Building } from 'lucide-react';
import { SubmissionForm, PropertyType } from '../types';
import { LINE_OA_ID } from '../constants';
import { uploadImages, submitProperty } from '../services/propertyService';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: PropertyType) => {
    setForm(prev => ({ ...prev, type }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.images.length === 0) {
        alert("กรุณาเลือกรูปภาพอย่างน้อย 1 รูป");
        return;
    }

    if (!confirm("ยืนยันการส่งข้อมูลเข้าระบบ?")) return;

    setIsSubmitting(true);

    try {
        // 1. Upload Images to Firebase Storage
        const imageUrls = await uploadImages(form.images);

        // 2. Save Data to Firestore
        const submissionId = await submitProperty(form, imageUrls);

        // 3. Notify via LINE
        const message = `แจ้งการส่งข้อมูลทรัพย์ใหม่ (${submissionId}):\nเรื่อง: ${form.title}\nราคา: ${form.price}\nติดต่อ: ${form.name} (${form.phone})`;
        const encodedMessage = encodeURIComponent(message);
        const lineUrl = `https://line.me/R/oaMessage/${LINE_OA_ID}/?${encodedMessage}`;

        // Reset Form
        setForm({
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
        setPreviewUrls([]);
        
        // Redirect to LINE
        window.open(lineUrl, '_blank');
        alert("บันทึกข้อมูลสำเร็จ! ทรัพย์ของคุณถูกแสดงในหน้าแรกแล้ว");

    } catch (error) {
        console.error("Submission failed:", error);
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง หรือตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 bg-white min-h-screen">
       <div className="bg-emerald-600 px-6 py-8 rounded-b-[2rem] shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">เสนอทรัพย์</h1>
        <p className="text-emerald-100 text-sm">กรอกข้อมูลเพื่อลงประกาศขายฟรี</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 space-y-6">
        
        {/* Images */}
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-slate-700">รูปภาพทรัพย์ *</label>
                <span className="text-xs text-slate-500">{form.images.length}/10 รูป</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}

                {form.images.length < 10 && (
                    <div 
                        className="relative aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 bg-slate-50"
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
        </div>

        {/* Property Type Selection */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ประเภททรัพย์</label>
            <div className="grid grid-cols-3 gap-2">
                <button
                    type="button"
                    onClick={() => handleTypeSelect(PropertyType.HOUSE)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${form.type === PropertyType.HOUSE ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
                >
                    <Home size={20} className="mb-1" />
                    <span className="text-xs font-bold">บ้าน</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleTypeSelect(PropertyType.LAND)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${form.type === PropertyType.LAND ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
                >
                    <Trees size={20} className="mb-1" />
                    <span className="text-xs font-bold">ที่ดิน</span>
                </button>
                <button
                    type="button"
                    onClick={() => handleTypeSelect(PropertyType.DORMITORY)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border ${form.type === PropertyType.DORMITORY ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}
                >
                    <Building size={20} className="mb-1" />
                    <span className="text-xs font-bold">หอพัก</span>
                </button>
            </div>
        </div>

        {/* Property Details */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อประกาศ *</label>
                <input 
                    type="text" 
                    name="title" 
                    value={form.title} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                    placeholder="เช่น ขายบ้านเดี่ยว 2 ชั้น ใกล้ม.พะเยา"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท) *</label>
                    <input 
                        type="number" 
                        name="price" 
                        value={form.price} 
                        onChange={handleInputChange} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                        placeholder="ระบุราคา"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ขนาดพื้นที่ *</label>
                    <input 
                        type="text" 
                        name="size" 
                        value={form.size} 
                        onChange={handleInputChange} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors"
                        placeholder="เช่น 50 ตร.ว."
                        required
                    />
                </div>
            </div>

             <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleInputChange} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 transition-colors h-24"
                    placeholder="รายละเอียดทรัพย์..."
                />
            </div>
        </div>

        {/* Location */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ตำแหน่งที่ตั้ง</label>
            <div className="flex space-x-2">
                <input 
                    type="text" 
                    value={form.latitude ? `${form.latitude}, ${form.longitude}` : ''}
                    className="flex-grow p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 text-sm"
                    placeholder="ยังไม่ได้ระบุตำแหน่ง"
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
        </div>

        <div className="border-t border-slate-100 pt-4 mt-4">
            <h3 className="text-sm font-bold text-slate-800 mb-3">ข้อมูลผู้ติดต่อ</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <input 
                        type="text" 
                        name="name" 
                        value={form.name} 
                        onChange={handleInputChange} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 text-sm"
                        placeholder="ชื่อของคุณ"
                        required
                    />
                </div>
                 <div>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={form.phone} 
                        onChange={handleInputChange} 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 text-sm"
                        placeholder="เบอร์โทรศัพท์"
                        required
                    />
                </div>
            </div>
        </div>

        <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center text-lg transition-transform active:scale-95 ${
                isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#06C755] hover:bg-[#05b64d]'
            }`}
        >
            {isSubmitting ? (
                <>
                    <Loader2 size={24} className="mr-2 animate-spin" />
                    กำลังส่งข้อมูล...
                </>
            ) : (
                <>
                    <Send size={20} className="mr-2" />
                    ลงประกาศ
                </>
            )}
        </button>

      </form>
    </div>
  );
};

export default SubmitPropertyPage;