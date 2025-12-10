import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Camera, X } from 'lucide-react';
import { getPropertyById, updateProperty, addProperty, uploadImages } from '../services/propertyService';
import { Property, PropertyType, SubmissionForm } from '../types';

const AdminEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // If id exists = Edit, else = Add
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);

  // We use SubmissionForm type for state because it matches the input fields nicely
  const [form, setForm] = useState<SubmissionForm>({
    title: '',
    price: '',
    type: PropertyType.HOUSE,
    size: '',
    description: '',
    name: 'Admin',
    phone: '0614544516',
    latitude: null,
    longitude: null,
    images: [] // Used only for tracking new files
  });

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode && id) {
      loadProperty(id);
    }
  }, [id]);

  const loadProperty = async (propId: string) => {
    setLoading(true);
    const prop = await getPropertyById(propId);
    if (prop) {
      setForm({
        title: prop.title,
        price: prop.price.toString(),
        type: prop.type,
        size: prop.size || '',
        description: prop.description,
        name: 'Admin',
        phone: '0614544516',
        latitude: prop.coordinates?.lat || null,
        longitude: prop.coordinates?.lng || null,
        images: []
      });
      // Set existing images
      const existingImages = prop.images && prop.images.length > 0 ? prop.images : [prop.image];
      setPreviewUrls(existingImages);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newUrls = files.map(f => URL.createObjectURL(f));
      setNewImages(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(isEditMode ? 'บันทึกการแก้ไข?' : 'เพิ่มทรัพย์ใหม่?')) return;
    
    setSubmitting(true);
    try {
      // 1. Upload new images if any
      let uploadedUrls: string[] = [];
      if (newImages.length > 0) {
        uploadedUrls = await uploadImages(newImages);
      }

      // 2. Combine with existing URLs (if editing)
      // Note: This logic is simplified. Real apps might handle deleting old images.
      const finalImages = isEditMode 
        ? [...previewUrls.filter(url => url.startsWith('http')), ...uploadedUrls]
        : uploadedUrls;

      if (isEditMode && id) {
        // Update
        await updateProperty(id, {
          title: form.title,
          price: parseFloat(form.price.replace(/,/g, '')),
          type: form.type,
          size: form.size,
          description: form.description,
          image: finalImages[0] || '',
          images: finalImages,
          coordinates: form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : undefined
        });
        alert('แก้ไขข้อมูลสำเร็จ');
      } else {
        // Add
        await addProperty(form, finalImages);
        alert('เพิ่มทรัพย์สำเร็จ');
      }
      navigate('/admin');
    } catch (error) {
      console.error(error);
      alert('เกิดข้อผิดพลาด');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="bg-slate-800 text-white px-4 py-4 sticky top-0 z-40 flex items-center shadow-md">
        <button onClick={() => navigate('/admin')} className="mr-3">
          <ArrowLeft />
        </button>
        <h1 className="font-bold text-lg">{isEditMode ? 'แก้ไขทรัพย์' : 'เพิ่มทรัพย์ใหม่'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        
        {/* Images */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">รูปภาพ</label>
          <div className="grid grid-cols-3 gap-2">
            {previewUrls.map((url, idx) => (
               <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                 <img src={url} className="w-full h-full object-cover" />
                 {/* Remove button could go here */}
               </div>
            ))}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer"
            >
              <Camera size={24} />
              <span className="text-xs">เพิ่มรูป</span>
            </div>
            <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อ *</label>
          <input 
            type="text" name="title" value={form.title} onChange={handleInputChange} required
            className="w-full p-3 border rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ราคา *</label>
            <input 
              type="number" name="price" value={form.price} onChange={handleInputChange} required
              className="w-full p-3 border rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท</label>
            <select name="type" value={form.type} onChange={handleInputChange} className="w-full p-3 border rounded-xl">
               <option value={PropertyType.HOUSE}>House</option>
               <option value={PropertyType.LAND}>Land</option>
               <option value={PropertyType.DORMITORY}>Dormitory</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">ขนาด</label>
          <input 
            type="text" name="size" value={form.size} onChange={handleInputChange}
            className="w-full p-3 border rounded-xl" placeholder="เช่น 50 ตร.ว."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">รายละเอียด</label>
          <textarea 
             name="description" value={form.description} onChange={handleInputChange}
             className="w-full p-3 border rounded-xl h-24"
          />
        </div>

        {/* Coords (Simplified for Admin) */}
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Lat</label>
             <input 
                type="number" step="any" name="latitude" value={form.latitude || ''} 
                onChange={(e) => setForm({...form, latitude: parseFloat(e.target.value)})}
                className="w-full p-3 border rounded-xl"
             />
           </div>
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Lng</label>
             <input 
                type="number" step="any" name="longitude" value={form.longitude || ''} 
                onChange={(e) => setForm({...form, longitude: parseFloat(e.target.value)})}
                className="w-full p-3 border rounded-xl"
             />
           </div>
        </div>

        <button 
          type="submit" disabled={submitting}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg flex justify-center"
        >
          {submitting ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> บันทึกข้อมูล</>}
        </button>

      </form>
    </div>
  );
};

export default AdminEditPage;