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
  size?: string;
  images?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SubmissionForm {
  name: string;
  phone: string;
  title: string;      // Added
  price: string;      // Added (keep as string for input, convert to number later)
  type: PropertyType; // Added
  size: string;       // Added
  description: string;
  latitude: number | null;
  longitude: number | null;
  images: File[];
}