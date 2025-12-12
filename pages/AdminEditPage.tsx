import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Camera, Navigation, Search, Star, Trash2, Crown, MapPin, Sparkles, Layout } from 'lucide-react';
import { getPropertyById, updateProperty, addProperty, uploadImages } from '../services/propertyService';
import { PropertyType, SubmissionForm } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenAI } from "@google/genai";

// Fix for default marker icon in Leaflet with React
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks, drags, and update coordinates
const LocationMarker = ({ position, onLocationSelect }: { position: { lat: number; lng: number } | null, onLocationSelect: (lat: number, lng: number) => void }) => {
  const map = useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onLocationSelect(lat, lng);
        }
      },
    }),
    [onLocationSelect],
  );

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker 
      draggable={true}
      eventHandlers={eventHandlers}
      position={position} 
      icon={icon} 
      ref={markerRef}
    />
  );
};

// Interface for Image Management
interface ImageItem {
  id: string;     // Unique ID for React Key
  url: string;    // Display URL (Blob or Remote)
  file?: File;    // File object if it's a new upload
  isNew: boolean; // Flag to identify new uploads
}

const PHAYAO_DISTRICTS = [
  'เมืองพะเยา',
  'แม่ใจ',
  'เชียงคำ',
  'ดอกคำใต้',
  'ปง',
  'จุน',
  'เชียงม่วน',
  'ภูซาง',
  'ภูกามยาว'
];

const AdminEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // AI State
  const [generatingAI, setGeneratingAI] = useState(false);
  
  // Unified Image State
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  
  const [gettingLoc, setGettingLoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Selected District
  const [selectedDistrict, setSelectedDistrict] = useState<string>('เมืองพะเยา');

  const PHAYAO_CENTER = { lat: 19.166, lng: 99.902 };

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
    images: [],
    status: 'active'
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
        images: [],
        status: prop.status || 'active'
      });
      
      // Load existing images into state
      const existingImages = prop.images && prop.images.length > 0 ? prop.images : [prop.image];
      const items: ImageItem[] = existingImages.map((url, index) => ({
        id: `existing-${index}-${Date.now()}`,
        url: url,
        isNew: false
      }));
      setImageItems(items);

      // Extract District from Location string (e.g. "เมืองพะเยา, พะเยา")
      if (prop.location) {
        const parts = prop.location.split(',');
        const district = parts[0].trim();
        // Check if extracted district is in our list
        if (PHAYAO_DISTRICTS.includes(district)) {
          setSelectedDistrict(district);
        } else if (PHAYAO_DISTRICTS.some(d => district.includes(d))) {
          // Fuzzy match
          const match = PHAYAO_DISTRICTS.find(d => district.includes(d));
          if (match) setSelectedDistrict(match);
        }
      }
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      const newItems: ImageItem[] = files.map(file => ({
        id: `new-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        file: file,
        isNew: true
      }));
      setImageItems(prev => [...prev, ...newItems]);
    }
    // Reset input to allow selecting same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImageItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return; // Already cover
    const newItems = [...imageItems];
    const [item] = newItems.splice(index, 1);
    newItems.unshift(item);
    setImageItems(newItems);
  };

  const getCurrentLocation = () => {
    setGettingLoc(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(prev => ({ 
            ...prev, 
            latitude: pos.coords.latitude, 
            longitude: pos.coords.longitude 
          }));
          setGettingLoc(false);
        },
        (err) => {
          alert("ไม่สามารถดึงตำแหน่งได้: " + err.message);
          setGettingLoc(false);
        }
      );
    } else {
      alert("Browser นี้ไม่รองรับ Geolocation");
      setGettingLoc(false);
    }
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      let finalQuery = searchQuery;
      if (!finalQuery.toLowerCase().includes('phayao') && !finalQuery.includes('พะเยา')) {
        finalQuery += ' Phayao Thailand';
      }

      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        alert(`พบตำแหน่ง: ${data[0].display_name}`);
        setForm(prev => ({ ...prev, latitude: lat, longitude: lon }));
      } else {
        alert("ไม่พบสถานที่นี้ ลองระบุชื่อสถานที่ + ตำบล/อำเภอ ให้ชัดเจนขึ้น");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!form.title && !form.price) {
      alert("กรุณากรอก 'หัวข้อ' และ 'ราคา' เพื่อให้ AI มีข้อมูลเบื้องต้นในการแต่งครับ");
      return;
    }

    setGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        คุณคือนักเขียนโฆษณาขายอสังหาริมทรัพย์มืออาชีพในไทย
        ช่วยแต่งคำบรรยาย (Description) สำหรับประกาศขายอสังหาริมทรัพย์ให้น่าสนใจ ดึงดูดลูกค้า และอ่านง่าย (ใช้ Emoji ประกอบให้สวยงาม)
        
        ข้อมูลทรัพย์:
        - หัวข้อ: ${form.title}
        - ประเภท: ${form.type}
        - ราคา: ${form.price} บาท
        - ขนาด: ${form.size || 'ไม่ระบุ'}
        - ทำเล: ${selectedDistrict}, จังหวัดพะเยา
        - ข้อมูลเพิ่มเติมที่ผู้ขายร่างไว้ (ถ้ามี): ${form.description}
        
        โครงสร้างที่ต้องการ:
        1. พาดหัวให้น่าตื่นเต้น (Catchy Headline)
        2. รายละเอียดจุดเด่น (Highlights) เป็นข้อย่อย
        3. สถานที่ใกล้เคียง (ถ้าทราบจากทำเล หรือแต่งให้น่าสนใจว่าใกล้แหล่งชุมชน)
        4. ประโยคปิดท้ายกระตุ้นให้รีบติดต่อ (Call to Action)
        
        โทนภาษา: เป็นกันเอง, มืออาชีพ, น่าเชื่อถือ
        ภาษา: ไทย
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text) {
        setForm(prev => ({ ...prev, description: response.text || "" }));
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("เกิดข้อผิดพลาดในการเรียกใช้ AI: " + (error as Error).message);
    } finally {
      setGeneratingAI(false);
    }
  };

  const toggleStatus = () => {
    setForm(prev => ({
      ...prev,
      status: prev.status === 'active' ? 'sold' : 'active'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageItems.length === 0) {
      alert("กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป");
      return;
    }
    if (!confirm(isEditMode ? 'บันทึกการแก้ไข?' : 'เพิ่มทรัพย์ใหม่?')) return;
    
    setSubmitting(true);
    try {
      // 1. Separate new files to upload
      const filesToUpload = imageItems.filter(item => item.isNew && item.file).map(item => item.file!);
      
      // 2. Upload new files
      let uploadedUrls: string[] = [];
      if (filesToUpload.length > 0) {
        uploadedUrls = await uploadImages(filesToUpload);
      }

      // 3. Reconstruct final image list preserving the visual order
      let uploadPointer = 0;
      const finalImages = imageItems.map(item => {
        if (item.isNew) {
          return uploadedUrls[uploadPointer++];
        }
        return item.url;
      });

      // Prepare coordinates
      const coordinates = (form.latitude !== null && form.longitude !== null && !isNaN(form.latitude) && !isNaN(form.longitude))
        ? { lat: form.latitude, lng: form.longitude } 
        : null;
      
      // Format Location
      const finalLocation = `${selectedDistrict}, พะเยา`;

      const propertyData = {
        title: form.title,
        price: parseFloat(form.price.replace(/,/g, '')),
        type: form.type,
        size: form.size,
        description: form.description,
        image: finalImages[0] || '', // First image is cover
        images: finalImages,
        coordinates: coordinates,
        status: form.status,
        location: finalLocation
      };

      if (isEditMode && id) {
        await updateProperty(id, propertyData);
        alert('แก้ไขข้อมูลสำเร็จ');
      } else {
        // Pass the updated form with location included
        const formWithLocation = { ...form, location: finalLocation };
        await addProperty(formWithLocation, finalImages); 
      }
      navigate('/admin');
    } catch (error: any) {
      console.error(error);
      if (error.message === "CORS_ERROR") {
        alert("อัปโหลดรูปไม่ผ่าน (CORS Error)! กรุณาตรวจสอบการตั้งค่า");
      } else {
        alert('เกิดข้อผิดพลาด: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin inline" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Bar */}
      <div className="bg-slate-800 text-white px-6 py-4 sticky top-0 z-50 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <button onClick={() => navigate('/admin')} className="mr-3 hover:bg-slate-700 p-2 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="font-bold text-lg">{isEditMode ? 'แก้ไขทรัพย์' : 'เพิ่มทรัพย์ใหม่'}</h1>
        </div>
        <button 
          onClick={(e) => handleSubmit(e as any)}
          disabled={submitting}
          className="hidden md:flex bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold items-center transition-colors disabled:opacity-50 text-sm"
        >
          {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
          บันทึก
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Images & Status */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Status Card */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">สถานะประกาศ</span>
                    <button 
                        type="button" 
                        onClick={toggleStatus}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}
                    >
                        <span 
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${form.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} 
                        />
                    </button>
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded inline-block ${form.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {form.status === 'active' ? '● กำลังขาย (Active)' : '● ปิดการขายแล้ว (Sold)'}
                </div>
             </div>

             {/* Images Card */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-slate-800">รูปภาพ ({imageItems.length})</label>
                  <span className="text-xs text-slate-400">รูปแรก = ปก</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    {imageItems.map((item, idx) => (
                    <div key={item.id} className={`relative aspect-square rounded-lg overflow-hidden border group transition-all ${idx === 0 ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                        <img src={item.url} className="w-full h-full object-cover" alt="preview" />
                        
                        {/* Cover Badge */}
                        {idx === 0 && (
                        <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-br font-bold z-10">
                            ปก
                        </div>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                            {idx !== 0 && (
                            <button 
                                type="button"
                                onClick={() => handleSetCover(idx)}
                                className="bg-white/90 text-slate-800 text-[10px] px-2 py-1 rounded-full font-bold hover:bg-white hover:text-emerald-600 mb-1"
                            >
                                ตั้งปก
                            </button>
                            )}
                            <button 
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                    ))}

                    {/* Add Button */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
                    >
                        <Camera size={20} className="mb-1" />
                        <span className="text-[10px] font-medium">เพิ่มรูป</span>
                    </div>
                    <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
                </div>
             </div>
          </div>

          {/* Right Column: Form Data */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* General Info */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center">
                    <Layout size={16} className="mr-2 text-emerald-600"/> ข้อมูลหลัก
                </h2>
                
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">หัวข้อประกาศ *</label>
                    <input 
                        type="text" name="title" value={form.title} onChange={handleInputChange} required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                        placeholder="เช่น ขายบ้านเดี่ยว 2 ชั้น หมู่บ้าน..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ราคา (บาท) *</label>
                        <input 
                        type="number" name="price" value={form.price} onChange={handleInputChange} required
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ประเภท</label>
                        <select name="type" value={form.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white outline-none">
                            <option value={PropertyType.HOUSE}>บ้าน</option>
                            <option value={PropertyType.LAND}>ที่ดิน</option>
                            <option value={PropertyType.DORMITORY}>หอพัก</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ขนาดพื้นที่</label>
                        <input 
                            type="text" name="size" value={form.size} onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none" 
                            placeholder="เช่น 50 ตร.ว."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">อำเภอ (จ.พะเยา)</label>
                    <div className="relative">
                        <MapPin size={18} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
                        <select 
                            value={selectedDistrict} 
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {PHAYAO_DISTRICTS.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-slate-700">รายละเอียด</label>
                    <button 
                        type="button" 
                        onClick={handleGenerateDescription}
                        disabled={generatingAI}
                        className="text-xs bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg font-bold flex items-center transition-colors disabled:opacity-50"
                    >
                        {generatingAI ? <Loader2 size={14} className="animate-spin mr-1" /> : <Sparkles size={14} className="mr-1" />}
                        {generatingAI ? 'AI กำลังแต่ง...' : 'ใช้ AI แต่งให้'}
                    </button>
                 </div>
                 <textarea 
                    name="description" value={form.description} onChange={handleInputChange}
                    className="w-full p-3 border border-slate-300 rounded-lg h-32 focus:ring-2 focus:ring-emerald-500 outline-none text-sm leading-relaxed"
                    placeholder="ใส่รายละเอียด... หรือกดปุ่ม AI ด้านบน"
                 />
            </div>

            {/* Map */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                    <Navigation size={16} className="mr-2 text-emerald-600"/> พิกัดแผนที่
                </h2>

                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="ค้นหาสถานที่..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
                            className="w-full pl-3 pr-10 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button 
                            type="button"
                            onClick={handleSearchLocation}
                            disabled={searching}
                            className="absolute right-1 top-1 p-1.5 text-slate-400 hover:text-emerald-600"
                        >
                            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        </button>
                    </div>
                    <button 
                        type="button" 
                        onClick={getCurrentLocation}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-bold flex items-center justify-center hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                        {gettingLoc ? <Loader2 size={14} className="animate-spin mr-1" /> : <Navigation size={14} className="mr-1" />}
                        พิกัดปัจจุบัน
                    </button>
                </div>

                <div className="h-64 rounded-xl overflow-hidden border border-slate-200 z-0 relative">
                    <MapContainer 
                        center={form.latitude && form.longitude ? [form.latitude, form.longitude] : [PHAYAO_CENTER.lat, PHAYAO_CENTER.lng]} 
                        zoom={13} 
                        scrollWheelZoom={false} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker 
                            position={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : null}
                            onLocationSelect={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
                        />
                    </MapContainer>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Latitude</span>
                        <input 
                            type="number" step="any" name="latitude" value={form.latitude !== null ? form.latitude : ''} 
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setForm({...form, latitude: isNaN(val) ? null : val});
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs font-mono"
                        />
                    </div>
                    <div>
                        <span className="text-xs text-slate-500 block mb-1">Longitude</span>
                        <input 
                            type="number" step="any" name="longitude" value={form.longitude !== null ? form.longitude : ''} 
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                setForm({...form, longitude: isNaN(val) ? null : val});
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-xs font-mono"
                        />
                    </div>
                </div>
            </div>

          </div>
        </form>

        {/* Mobile Save Button (Sticky Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 z-40">
            <button 
                onClick={(e) => handleSubmit(e as any)}
                disabled={submitting}
                className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold shadow-lg flex justify-center items-center active:scale-95 transition-transform"
            >
                {submitting ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" size={20} /> บันทึกข้อมูล</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditPage;