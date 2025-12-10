export enum PropertyType {
  HOUSE = 'House',
  LAND = 'Land',
  DORMITORY = 'Dormitory'
}

export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  type: PropertyType;
  image: string;
  description: string;
  size?: string; // Added size field
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SubmissionForm {
  name: string;
  phone: string;
  description: string;
  latitude: number | null;
  longitude: number | null;
  images: File[]; // Changed from single image to array
}