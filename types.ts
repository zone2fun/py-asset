
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
  viewCount?: number; // Added view count
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