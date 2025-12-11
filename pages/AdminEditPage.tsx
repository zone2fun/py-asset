import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Camera, Navigation, Search, Star, Trash2, Crown, MapPin } from 'lucide-react';
import { getPropertyById, updateProperty, addProperty, uploadImages } from '../services/propertyService';
import { PropertyType, SubmissionForm } from '../types';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

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
      <div className="bg-slate-800 text-white px-4 py-4 sticky top-0 z-40 flex items-center shadow-md">
        <button onClick={() => navigate('/admin')} className="mr-3">
          <ArrowLeft />
        </button>
        <h1 className="font-bold text-lg">{isEditMode ? 'แก้ไขทรัพย์ 🇹🇭' : 'เพิ่มทรัพย์ใหม่'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* Status Toggle */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <span className="block text-sm font-bold text-slate-800">สถานะประกาศ</span>
                <span className={`text-xs ${form.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                    {form.status === 'active' ? 'กำลังขาย (Active)' : 'ปิดการขายแล้ว (Sold)'}
                </span>
            </div>
            <button 
                type="button" 
                onClick={toggleStatus}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${form.status === 'active' ? 'bg-green-500' : 'bg-slate-300'}`}
            >
                <span 
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${form.status === 'active' ? 'translate-x-7' : 'translate-x-1'}`} 
                />
            </button>
        </div>
        
        {/* Image Management Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">รูปภาพ ({imageItems.length})</label>
          <p className="text-xs text-slate-500 mb-2">รูปแรกจะเป็นภาพหน้าปก (Cover Image)</p>
          
          <div className="grid grid-cols-3 gap-3">
            {imageItems.map((item, idx) => (
               <div key={item.id} className={`relative aspect-square rounded-lg overflow-hidden border-2 group transition-all ${idx === 0 ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                 <img src={item.url} className="w-full h-full object-cover" alt="preview" />
                 
                 {/* Cover Badge (Index 0) */}
                 {idx === 0 && (
                   <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-br-lg font-bold flex items-center shadow-sm z-10">
                     <Crown size={10} className="mr-1" fill="currentColor" /> ปก
                   </div>
                 )}

                 {/* Actions Overlay */}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {idx !== 0 && (
                      <button 
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="bg-white text-slate-800 text-xs px-2 py-1 rounded-full font-bold hover:bg-emerald-50 hover:text-emerald-600 flex items-center transform active:scale-95 transition-transform"
                      >
                        <Star size={12} className="mr-1" /> ตั้งเป็นปก
                      </button>
                    )}
                    <button 
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    >
                        <Trash2 size={14} />
                    </button>
                 </div>
               </div>
            ))}

            {/* Add Button */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
            >
              <Camera size={24} className="mb-1" />
              <span className="text-xs font-medium">เพิ่มรูป</span>
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
               <option value={PropertyType.HOUSE}>บ้าน</option>
               <option value={PropertyType.LAND}>ที่ดิน</option>
               <option value={PropertyType.DORMITORY}>หอพัก</option>
            </select>
          </div>
        </div>

        {/* District Selector */}
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-1">อำเภอ (ใน จ.พะเยา)</label>
           <div className="relative">
              <MapPin size={20} className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" />
              <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border rounded-xl bg-white appearance-none cursor-pointer hover:border-emerald-400 transition-colors"
              >
                  {PHAYAO_DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                  ))}
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

        {/* Map Picker Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
             <label className="block text-sm font-medium text-slate-700">พิกัดแผนที่ (Lat/Lng)</label>
             <button 
                type="button" 
                onClick={getCurrentLocation}
                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold flex items-center hover:bg-blue-100 transition-colors"
             >
                {gettingLoc ? <Loader2 size={12} className="animate-spin mr-1" /> : <Navigation size={12} className="mr-1" />}
                ระบุตำแหน่งปัจจุบัน
             </button>
          </div>

          {/* Search Box */}
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="ค้นหาสถานที่ (ระบบจะเติม 'พะเยา' ให้อัตโนมัติ)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())}
              className="flex-grow p-2 text-sm border rounded-lg"
            />
            <button 
              type="button"
              onClick={handleSearchLocation}
              disabled={searching}
              className="bg-slate-100 border border-slate-200 p-2 rounded-lg text-slate-600 hover:bg-slate-200"
            >
              {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
            </button>
          </div>
          
          <p className="text-xs text-slate-500">* ทิป: ค้นหาเสร็จแล้ว สามารถกดค้างที่หมุดแล้วลากเพื่อปรับตำแหน่งให้ตรงเป๊ะได้</p>

          <div className="h-64 rounded-xl overflow-hidden border border-slate-200 z-0 relative shadow-inner">
             <MapContainer 
                center={form.latitude && form.longitude ? [form.latitude, form.longitude] : [PHAYAO_CENTER.lat, PHAYAO_CENTER.lng]} 
                zoom={13} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
             >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
               <input 
                  type="number" step="any" placeholder="Latitude" name="latitude" value={form.latitude !== null ? form.latitude : ''} 
                  onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setForm({...form, latitude: isNaN(val) ? null : val});
                  }}
                  className="w-full p-3 border rounded-xl bg-slate-50 text-sm"
               />
             </div>
             <div>
               <input 
                  type="number" step="any" placeholder="Longitude" name="longitude" value={form.longitude !== null ? form.longitude : ''} 
                  onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setForm({...form, longitude: isNaN(val) ? null : val});
                  }}
                  className="w-full p-3 border rounded-xl bg-slate-50 text-sm"
               />
             </div>
          </div>
        </div>

        <button 
          type="submit" disabled={submitting}
          className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg flex justify-center mt-6"
        >
          {submitting ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> บันทึกข้อมูล</>}
        </button>

      </form>
    </div>
  );
};

export default AdminEditPage;