
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
  contactName?: string;
  contactPhone?: string;
  createdAt?: any;
  status?: string;
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
}
