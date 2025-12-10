import { Property, PropertyType } from './types';

// CONFIGURATION
// Change this to your actual LINE OA ID (with the @ symbol)
export const LINE_OA_ID = '@phayao_asset'; 
export const LINE_OA_URL = `https://line.me/R/ti/p/${LINE_OA_ID}`;

// MOCK DATA
export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Modern House near Phayao Lake',
    price: 2500000,
    location: 'Mueang Phayao',
    type: PropertyType.HOUSE,
    image: 'https://picsum.photos/800/600?random=1',
    description: '3 Bedrooms, 2 Bathrooms, beautiful lake view.',
    size: '50 ตร.ว.',
    coordinates: { lat: 19.166, lng: 99.901 }
  },
  {
    id: '2',
    title: 'Rice Field Land 5 Rai',
    price: 1200000,
    location: 'Dok Khamtai',
    type: PropertyType.LAND,
    image: 'https://picsum.photos/800/600?random=2',
    description: 'Perfect for agriculture or building a resort.',
    size: '5 ไร่',
    coordinates: { lat: 19.120, lng: 99.950 }
  },
  {
    id: '3',
    title: 'Student Dormitory Investment',
    price: 5500000,
    location: 'Near University of Phayao',
    type: PropertyType.DORMITORY,
    image: 'https://picsum.photos/800/600?random=3',
    description: '20 rooms, fully occupied, high ROI.',
    size: '2 งาน',
    coordinates: { lat: 19.030, lng: 99.920 }
  },
  {
    id: '4',
    title: 'Cozy Wooden House',
    price: 1800000,
    location: 'Mae Chai',
    type: PropertyType.HOUSE,
    image: 'https://picsum.photos/800/600?random=4',
    description: 'Traditional Lanna style, peaceful environment.',
    size: '85 ตร.ว.',
    coordinates: { lat: 19.300, lng: 99.800 }
  },
  {
    id: '5',
    title: 'Empty Land City Center',
    price: 3000000,
    location: 'Mueang Phayao',
    type: PropertyType.LAND,
    image: 'https://picsum.photos/800/600?random=5',
    description: '100 sq.wah, ready to build.',
    size: '100 ตร.ว.',
  }
];