import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import { Property, PropertyType, SubmissionForm } from "../types";
import { MOCK_PROPERTIES } from "../constants";

const COLLECTION_NAME = "properties";

// --- FETCH DATA ---

export const getProperties = async (type?: PropertyType | 'All'): Promise<Property[]> => {
  if (!db) {
    console.warn("Firestore not initialized, falling back to mock data");
    if (type && type !== 'All') return MOCK_PROPERTIES.filter(p => p.type === type);
    return MOCK_PROPERTIES;
  }

  try {
    // Try to fetch from Firestore
    let q = collection(db, COLLECTION_NAME);
    
    if (type && type !== 'All') {
      q = query(collection(db, COLLECTION_NAME), where("type", "==", type)) as any;
    }

    const querySnapshot = await getDocs(q);
    
    const realProperties: Property[] = [];
    querySnapshot.forEach((doc) => {
      realProperties.push({ id: doc.id, ...doc.data() } as Property);
    });

    // Merge Real Data with Mock Data (so the app doesn't look empty initially)
    // In a real production app, you might want to remove MOCK_PROPERTIES
    let filteredMock = MOCK_PROPERTIES;
    if (type && type !== 'All') {
        filteredMock = MOCK_PROPERTIES.filter(p => p.type === type);
    }

    return [...realProperties, ...filteredMock];

  } catch (error) {
    console.warn("Error fetching properties from Firebase:", error);
    // Fallback to Mock Data on error
    if (type && type !== 'All') {
      return MOCK_PROPERTIES.filter(p => p.type === type);
    }
    return MOCK_PROPERTIES;
  }
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  // 1. Check Mock Data first for hardcoded IDs
  const mockProp = MOCK_PROPERTIES.find(p => p.id === id);
  if (mockProp) return mockProp;

  if (!db) return undefined;

  try {
    // 2. Fetch from Firestore
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Property;
    } else {
      return undefined;
    }
  } catch (error) {
    console.warn("Error fetching property by ID:", error);
    return undefined;
  }
};

// --- SUBMISSION ---

export const uploadImages = async (files: File[]): Promise<string[]> => {
  if (!storage) throw new Error("Storage not initialized");

  const uploadPromises = files.map(async (file) => {
    try {
      // Create a unique reference for the file
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      const storageRef = ref(storage, `properties/${uniqueName}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

export const submitProperty = async (form: SubmissionForm, imageUrls: string[]) => {
  if (!db) throw new Error("Firestore not initialized");

  try {
    // Convert SubmissionForm to Property-like structure for the 'properties' collection
    const propertyData = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price.replace(/,/g, '')) || 0, // Ensure number
      type: form.type,
      location: "พะเยา (User Submitted)", // Default location if not specific
      size: form.size,
      image: imageUrls[0] || '', // First image as main thumbnail
      images: imageUrls,
      contactName: form.name,
      contactPhone: form.phone,
      coordinates: form.latitude && form.longitude ? {
        lat: form.latitude,
        lng: form.longitude
      } : null,
      createdAt: serverTimestamp(),
      status: 'active' // Show immediately
    };

    const docRef = await addDoc(collection(db, COLLECTION_NAME), propertyData);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};