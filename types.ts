
export enum PropertyType {
  HOUSE = 'บ้าน',
  LAND = 'ที่ดิน',
  DORMITORY = 'หอพัก'
}

export type ContentType = 'post' | 'video';

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
  viewCount?: number;
  isRecommended?: boolean;
  contentType?: ContentType; // New: 'post' or 'video'
  videoUrl?: string; // New: URL for the video file
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
  status: string;
  location?: string;
  isRecommended?: boolean;
  contentType?: ContentType; // New
  video?: File | null; // New: File object for upload
}

// New Types for Leads Management
export type LeadStatus = 'pending' | 'contacted' | 'contract_signed';

export interface Lead {
  id: string;
  title: string;
  price: string;
  type: PropertyType;
  size: string;
  description: string;
  name: string;
  phone: string;
  location?: string;
  latitude: number | null;
  longitude: number | null;
  images: string[]; // Stored as URLs
  status: LeadStatus;
  createdAt: any;
}