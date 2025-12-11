
export enum PropertyType {
  HOUSE = 'บ้าน',
  LAND = 'ที่ดิน',
  DORMITORY = 'หอพัก'
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: PropertyType;
  image: string;
  description: string;
  size?: string;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  contactName?: string;
  contactPhone?: string;
  createdAt?: any;
  status?: string; // 'active' | 'sold'
}

export interface SubmissionForm {
  name: string;
  phone: string;
  title: string;
  price: string;
  type: PropertyType;
  size: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  images: File[];
  status: string; // Added status field
  location?: string; // Added specific location string (e.g. District)
}