import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Camera, MapPin, Navigation, Search } from 'lucide-react';
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

const AdminEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // If id exists = Edit, else = Add
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [gettingLoc, setGettingLoc] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  // Default center for Phayao
  const PHAYAO_CENTER = { lat: 19.166, lng: 99.902 };

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
      // Fix: Explicitly cast to File[] to prevent 'unknown' type error in map callback
      const files = Array.from(e.target.files) as File[];
      const newUrls = files.map(f => URL.createObjectURL(f));
      setNewImages(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...newUrls]);
    }
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
      // 1. เพิ่ม Context การค้นหาถ้าผู้ใช้ไม่ได้ระบุจังหวัด/ประเทศ
      let finalQuery = searchQuery;
      // ถ้าไม่มีคำว่า Phayao หรือ พะเยา ให้เติมต่อท้าย
      if (!finalQuery.toLowerCase().includes('phayao') && !finalQuery.includes('พะเยา')) {
        finalQuery += ' Phayao Thailand'; // เน้นพะเยา
      }

      // Use Nominatim API (OpenStreetMap)
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(finalQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // แจ้งผู้ใช้ว่าเจอที่ไหน เพื่อความชัวร์
        alert(`พบตำแหน่ง: ${data[0].display_name}\n(ถ้าไม่ตรง สามารถลากหมุดบนแผนที่ได้เลย)`);
        
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
      const finalImages = isEditMode 
        ? [...previewUrls.filter(url => url.startsWith('http')), ...uploadedUrls]
        : uploadedUrls;

      // Prepare coordinates (use null if missing, never undefined)
      const coordinates = (form.latitude !== null && form.longitude !== null && !isNaN(form.latitude) && !isNaN(form.longitude))
        ? { lat: form.latitude, lng: form.longitude } 
        : null;

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
          coordinates: coordinates
        });
        alert('แก้ไขข้อมูลสำเร็จ');
      } else {
        // Add
        await addProperty(form, finalImages);
        alert('เพิ่มทรัพย์สำเร็จ');
      }
      navigate('/admin');
    } catch (error: any) {
      console.error(error);
      if (error.message === "CORS_ERROR") {
        alert("อัปโหลดรูปไม่ผ่าน (CORS Error)!\nกรุณาไปที่หน้า Login > กด 'วิธีแก้ปัญหาอัปโหลดรูป' แล้วทำตามขั้นตอน");
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
               <option value={PropertyType.HOUSE}>บ้าน</option>
               <option value={PropertyType.LAND}>ที่ดิน</option>
               <option value={PropertyType.DORMITORY}>หอพัก</option>
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