import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Camera, Navigation, Search, Trash2, MapPin, Sparkles, Layout, AlertCircle, Star, Video, Image as ImageIcon, PlayCircle, Film } from 'lucide-react';
import { getPropertyById, updateProperty, addProperty, uploadImages, uploadVideo } from '../services/propertyService';
import { PropertyType, SubmissionForm, ContentType } from '../types';
import { GoogleGenAI } from "@google/genai";

// ==================================================================================
// 🔑 Google Maps Configuration
// ==================================================================================
const GOOGLE_MAPS_API_KEY: string = 'AIzaSyCpFgVS3VZn5UOeOc9waxkJeaWR-H6wH4o'; 
// ==================================================================================

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
    initMap: () => void;
    gm_authFailure?: () => void; // Add auth failure handler type
  }
}

interface ImageItem {
  id: string;
  url: string;
  file?: File;
  isNew: boolean;
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
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  
  // Video State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  
  const [gettingLoc, setGettingLoc] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('เมืองพะเยา');
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markerInstance, setMarkerInstance] = useState<any>(null);
  const [mapError, setMapError] = useState<string | null>(null); // State for map errors

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
    status: 'active',
    isRecommended: false,
    contentType: 'post', // Default
    video: null
  });

  const isEditMode = !!id;

  // 1. Initialize Google Maps Script
  useEffect(() => {
    // Define global handler for auth failure (invalid key/referer)
    window.gm_authFailure = () => {
      setMapError("Google Maps Error: API Key ไม่ถูกต้อง หรือไม่ได้อนุญาต URL นี้ (RefererNotAllowed)");
      console.error("Google Maps Auth Failure");
    };

    const loadGoogleMaps = () => {
      if (window.google) {
        initMap();
        return;
      }

      const scriptId = 'google-maps-script';
      if (document.getElementById(scriptId)) return;

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => initMap();
      script.onerror = () => setMapError("ไม่สามารถโหลด Google Maps Script ได้");
      document.head.appendChild(script);
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
      window.gm_authFailure = undefined;
    };
  }, []);

  // 2. Initialize Map Instance
  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      const initialPos = (form.latitude && form.longitude) 
        ? { lat: form.latitude, lng: form.longitude }
        : PHAYAO_CENTER;

      const map = new window.google.maps.Map(mapRef.current, {
        center: initialPos,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      const marker = new window.google.maps.Marker({
        position: initialPos,
        map: map,
        draggable: true,
        animation: window.google.maps.Animation.DROP,
      });

      // Add drag listener
      marker.addListener('dragend', () => {
        const pos = marker.getPosition();
        setForm(prev => ({
          ...prev,
          latitude: pos.lat(),
          longitude: pos.lng()
        }));
      });

      // Add click listener
      map.addListener('click', (e: any) => {
        const pos = e.latLng;
        marker.setPosition(pos);
        setForm(prev => ({
          ...prev,
          latitude: pos.lat(),
          longitude: pos.lng()
        }));
      });

      setMapInstance(map);
      setMarkerInstance(marker);
    } catch (e) {
      console.error("Error initializing map:", e);
      setMapError("เกิดข้อผิดพลาดในการแสดงแผนที่");
    }
  };

  // 3. Update Map/Marker when form coordinates change programmatically
  useEffect(() => {
    if (mapInstance && markerInstance && form.latitude && form.longitude) {
      const newPos = { lat: form.latitude, lng: form.longitude };
      
      // Avoid re-centering if the change came from the map itself (simple check to avoid jitter)
      try {
        const currentMarkerPos = markerInstance.getPosition();
        const dist = Math.abs(currentMarkerPos.lat() - newPos.lat) + Math.abs(currentMarkerPos.lng() - newPos.lng);
        
        if (dist > 0.0001) {
          markerInstance.setPosition(newPos);
          mapInstance.panTo(newPos);
        }
      } catch (e) {
        // Ignore errors if map not ready
      }
    }
  }, [form.latitude, form.longitude, mapInstance, markerInstance]);

  // Load existing property data
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
        status: prop.status || 'active',
        isRecommended: prop.isRecommended || false,
        contentType: prop.contentType || 'post',
        video: null
      });
      
      // Load Images
      const existingImages = prop.images && prop.images.length > 0 ? prop.images : [prop.image];
      const items: ImageItem[] = existingImages.map((url, index) => ({
        id: `existing-${index}-${Date.now()}`,
        url: url,
        isNew: false
      }));
      setImageItems(items);

      // Load Video if exists
      if (prop.videoUrl) {
          setVideoPreviewUrl(prop.videoUrl);
      }

      if (prop.location) {
        const parts = prop.location.split(',');
        const district = parts[0].trim();
        if (PHAYAO_DISTRICTS.includes(district)) {
          setSelectedDistrict(district);
        } else if (PHAYAO_DISTRICTS.some(d => district.includes(d))) {
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

  const handleContentTypeChange = (type: ContentType) => {
    setForm(prev => ({ ...prev, contentType: type }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      
      // If Video mode, restrict to only 1 image (Cover)
      if (form.contentType === 'video') {
          if (imageItems.length >= 1) {
              alert("วิดีโอรีวิว ใส่รูปปกได้เพียง 1 รูปครับ (สามารถลบรูปเดิมก่อนเพิ่มใหม่)");
              return;
          }
      }

      const newItems: ImageItem[] = files.map(file => ({
        id: `new-${Math.random().toString(36).substr(2, 9)}`,
        url: URL.createObjectURL(file),
        file: file,
        isNew: true
      }));
      setImageItems(prev => [...prev, ...newItems]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          // Simple validation
          if (file.size > 100 * 1024 * 1024) { // 100MB
              alert("ไฟล์วิดีโอใหญ่เกินไป (จำกัด 100MB)");
              return;
          }
          setVideoFile(file);
          setVideoPreviewUrl(URL.createObjectURL(file));
      }
      if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const handleRemoveImage = (index: number) => {
    setImageItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = () => {
      setVideoFile(null);
      setVideoPreviewUrl(null);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
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

  const handleSearchLocation = () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    
    if (window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      let query = searchQuery;
      // Append context if not present
      if (!query.includes('พะเยา') && !query.toLowerCase().includes('phayao')) {
        query += ' จ.พะเยา';
      }

      geocoder.geocode({ address: query }, (results: any, status: any) => {
        setSearching(false);
        if (status === 'OK' && results[0]) {
          const loc = results[0].geometry.location;
          setForm(prev => ({ ...prev, latitude: loc.lat(), longitude: loc.lng() }));
          if (mapInstance) {
            mapInstance.setCenter(loc);
            mapInstance.setZoom(15);
          }
        } else {
          alert('ไม่พบสถานที่นี้ ลองระบุชื่อให้ชัดเจนขึ้น');
        }
      });
    } else {
      // Fallback if Google Maps didn't load (e.g. invalid key)
      alert("Google Maps API ยังไม่พร้อมใช้งาน");
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
      // Check for API Key explicitly
      if (!process.env.API_KEY) {
         throw new Error("ไม่พบ API Key สำหรับ AI (process.env.API_KEY) กรุณาตรวจสอบการตั้งค่า .env");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        คุณคือนักเขียนโฆษณาขายอสังหาริมทรัพย์มืออาชีพในไทย
        ช่วยแต่งคำบรรยาย (Description) สำหรับประกาศขายอสังหาริมทรัพย์ให้น่าสนใจ
        ข้อมูล: ${form.title}, ประเภท: ${form.type}, ราคา: ${form.price}, ทำเล: ${selectedDistrict} พะเยา
        รายละเอียด: ${form.description}
        ขอแบบมี Emoji และแบ่งเป็นข้อย่อยอ่านง่าย
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
      alert("AI Error: " + (error as Error).message);
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

  const toggleRecommended = () => {
    setForm(prev => ({
      ...prev,
      isRecommended: !prev.isRecommended
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageItems.length === 0) {
      alert("กรุณาเพิ่มรูปภาพอย่างน้อย 1 รูป (สำหรับรูปปก)");
      return;
    }

    // Validation for Video Review
    if (form.contentType === 'video') {
        if (!videoFile && !videoPreviewUrl) {
            alert("กรุณาอัปโหลดวิดีโอ");
            return;
        }
        if (imageItems.length > 1) {
             // In case they switched modes with multiple images loaded
             alert("โหมดวิดีโอรีวิว อนุญาตให้มีรูปปกเพียง 1 รูป กรุณาลบรูปส่วนเกินออก");
             return;
        }
    }

    if (!confirm(isEditMode ? 'บันทึกการแก้ไข?' : 'เพิ่มทรัพย์ใหม่?')) return;
    
    setSubmitting(true);
    try {
      // 1. Upload Images
      const filesToUpload = imageItems.filter(item => item.isNew && item.file).map(item => item.file!);
      
      let uploadedUrls: string[] = [];
      if (filesToUpload.length > 0) {
        uploadedUrls = await uploadImages(filesToUpload);
      }

      let uploadPointer = 0;
      const finalImages = imageItems.map(item => {
        if (item.isNew) {
          return uploadedUrls[uploadPointer++];
        }
        return item.url;
      });

      // 2. Upload Video (if new file exists)
      let finalVideoUrl = videoPreviewUrl || '';
      if (videoFile) {
          finalVideoUrl = await uploadVideo(videoFile);
      }

      const coordinates = (form.latitude !== null && form.longitude !== null && !isNaN(form.latitude) && !isNaN(form.longitude))
        ? { lat: form.latitude, lng: form.longitude } 
        : null;
      
      const finalLocation = `${selectedDistrict}, พะเยา`;

      const propertyData = {
        title: form.title,
        price: parseFloat(form.price.replace(/,/g, '')),
        type: form.type,
        size: form.size,
        description: form.description,
        image: finalImages[0] || '', 
        images: finalImages,
        coordinates: coordinates,
        status: form.status,
        location: finalLocation,
        isRecommended: form.isRecommended,
        contentType: form.contentType,
        videoUrl: finalVideoUrl
      };

      if (isEditMode && id) {
        await updateProperty(id, propertyData);
        alert('แก้ไขข้อมูลสำเร็จ');
      } else {
        const formWithLocation = { ...form, location: finalLocation };
        await addProperty(formWithLocation, finalImages, finalVideoUrl); 
      }
      navigate('/admin');
    } catch (error: any) {
      console.error(error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
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
        
        {mapError && (
           <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r shadow-sm animate-in fade-in">
             <div className="flex">
               <div className="flex-shrink-0">
                 <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
               </div>
               <div className="ml-3">
                 <p className="text-sm text-red-700 font-bold">
                   {mapError}
                 </p>
                 <p className="text-xs text-red-600 mt-1">
                   วิธีแก้: ไปที่ Google Cloud Console {'>'} API Credentials {'>'} เลือก Key นี้ {'>'} เพิ่ม "https://py-asset.vercel.app/*" และ "http://localhost:*" ในช่อง Website Restrictions
                 </p>
               </div>
             </div>
           </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Media & Status */}
          <div className="lg:col-span-4 space-y-6">
             
             {/* Content Type Selector */}
             <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex">
                 <button
                    type="button"
                    onClick={() => handleContentTypeChange('post')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-lg transition-all ${form.contentType === 'post' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                     <ImageIcon size={16} className="mr-2" /> โพสต์ทั่วไป
                 </button>
                 <button
                    type="button"
                    onClick={() => handleContentTypeChange('video')}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-lg transition-all ${form.contentType === 'video' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                 >
                     <Video size={16} className="mr-2" /> วิดีโอรีวิว
                 </button>
             </div>

             {/* Status Card */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                {/* Sale Status */}
                <div>
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

                {/* Recommended Toggle */}
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-800 flex items-center">
                            <Star size={14} className="mr-1 text-yellow-500 fill-yellow-500" />
                            ทรัพย์น่าซื้อ (แนะนำ)
                        </span>
                        <button 
                            type="button" 
                            onClick={toggleRecommended}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${form.isRecommended ? 'bg-yellow-400' : 'bg-slate-300'}`}
                        >
                            <span 
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out ${form.isRecommended ? 'translate-x-6' : 'translate-x-1'}`} 
                            />
                        </button>
                    </div>
                    <p className="text-xs text-slate-500">
                        {form.isRecommended ? 'จะแสดงในส่วน "ทรัพย์น่าซื้อ" หน้าแรก' : 'แสดงเป็นทรัพย์ทั่วไป'}
                    </p>
                </div>
             </div>

             {/* MEDIA UPLOADER */}
             <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-slate-800">
                      {form.contentType === 'video' ? 'รูปปก (1 รูป)' : `รูปภาพ (${imageItems.length})`}
                  </label>
                  {form.contentType === 'post' && (
                      <span className="text-xs text-slate-400">รูปแรก = ปก</span>
                  )}
                </div>
                
                {/* Images Grid */}
                <div className="grid grid-cols-3 gap-2">
                    {imageItems.map((item, idx) => (
                    <div key={item.id} className={`relative aspect-square rounded-lg overflow-hidden border group transition-all ${idx === 0 ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                        <img src={item.url} className="w-full h-full object-cover" alt="preview" />
                        {idx === 0 && (
                        <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[10px] px-1.5 py-0.5 rounded-br font-bold z-10">
                            ปก
                        </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                            {idx !== 0 && form.contentType === 'post' && (
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
                    
                    {/* Add Image Button logic */}
                    {(form.contentType === 'post' || (form.contentType === 'video' && imageItems.length === 0)) && (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-emerald-400 hover:text-emerald-500 transition-colors"
                        >
                            <Camera size={20} className="mb-1" />
                            <span className="text-[10px] font-medium">เพิ่มรูป</span>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} hidden multiple={form.contentType === 'post'} accept="image/*" onChange={handleFileChange} />
                </div>

                {/* VIDEO UPLOADER (Only in video mode) */}
                {form.contentType === 'video' && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                         <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-slate-800">
                                ไฟล์วิดีโอ
                            </label>
                            {videoPreviewUrl && (
                                <button type="button" onClick={handleRemoveVideo} className="text-xs text-red-500 hover:underline">ลบวิดีโอ</button>
                            )}
                        </div>

                        {videoPreviewUrl ? (
                            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-200">
                                <video src={videoPreviewUrl} controls className="w-full h-full" />
                            </div>
                        ) : (
                             <div 
                                onClick={() => videoInputRef.current?.click()}
                                className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 hover:border-red-400 hover:text-red-500 transition-colors bg-slate-50"
                            >
                                <Film size={32} className="mb-2 opacity-50" />
                                <span className="text-sm font-medium">อัปโหลดวิดีโอ</span>
                                <span className="text-[10px] opacity-70 mt-1">MP4, MOV (max 100MB)</span>
                            </div>
                        )}
                        <input type="file" ref={videoInputRef} hidden accept="video/*" onChange={handleVideoFileChange} />
                    </div>
                )}
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

            {/* Google Map */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
                        <Navigation size={16} className="mr-2 text-emerald-600"/> พิกัดแผนที่ (Google Maps)
                    </h2>
                </div>

                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            placeholder="ค้นหาสถานที่ (เช่น หน้ามอพะเยา)..." 
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

                {/* Map Container */}
                <div className="rounded-xl overflow-hidden border border-slate-200 z-0 relative">
                    {mapError ? (
                       <div className="w-full h-[500px] bg-slate-100 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                         <MapPin size={48} className="mb-4 text-slate-300" />
                         <p className="font-bold text-slate-500">แผนที่โหลดไม่ได้</p>
                         <p className="text-xs mt-2 text-red-400">{mapError}</p>
                       </div>
                    ) : (
                       <div ref={mapRef} className="w-full h-[500px] bg-slate-100" />
                    )}
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