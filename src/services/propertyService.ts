import { db, storage } from "../firebaseConfig";
import firebase from "firebase/app";
import { Property, PropertyType, SubmissionForm } from "../types";
import { MOCK_PROPERTIES } from "../constants";

const COLLECTION_NAME = "properties";
const SUBMISSION_COLLECTION = "submissions";

// --- FETCH DATA ---

export const getProperties = async (type?: PropertyType | 'All'): Promise<Property[]> => {
  if (!db) {
    console.warn("Firestore not initialized, falling back to mock data");
    if (type && type !== 'All') return MOCK_PROPERTIES.filter(p => p.type === type);
    return MOCK_PROPERTIES;
  }

  try {
    // Try to fetch from Firestore
    let query: firebase.firestore.Query = db.collection(COLLECTION_NAME);
    
    if (type && type !== 'All') {
      query = query.where("type", "==", type);
    }

    const querySnapshot = await query.get();
    
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
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { id: docSnap.id, ...docSnap.data() } as Property;
    } else {
      return undefined;
    }
  } catch (error) {
    console.warn("Error fetching property by ID:", error);
    return undefined;
  }
};

// --- ADMIN ACTIONS ---

export const deleteProperty = async (id: string) => {
  if (!db) throw new Error("Database not initialized");
  await db.collection(COLLECTION_NAME).doc(id).delete();
};

export const updateProperty = async (id: string, data: Partial<Property>) => {
  if (!db) throw new Error("Database not initialized");
  await db.collection(COLLECTION_NAME).doc(id).update(data);
};

export const addProperty = async (form: SubmissionForm, imageUrls: string[]) => {
  if (!db) throw new Error("Firestore not initialized");

  const propertyData = {
    title: form.title,
    description: form.description,
    price: parseFloat(form.price.toString().replace(/,/g, '')) || 0,
    type: form.type,
    location: "พะเยา", 
    size: form.size,
    image: imageUrls[0] || '',
    images: imageUrls,
    contactName: form.name,
    contactPhone: form.phone,
    coordinates: form.latitude && form.longitude ? {
      lat: form.latitude,
      lng: form.longitude
    } : null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  };

  const docRef = await db.collection(COLLECTION_NAME).add(propertyData);
  return docRef.id;
};

// --- SUBMISSION (User Lead) ---

export const uploadImages = async (files: File[]): Promise<string[]> => {
  if (!storage) throw new Error("Storage not initialized");

  const uploadPromises = files.map(async (file) => {
    try {
      // Create a unique reference for the file
      const uniqueName = `properties/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      const storageRef = storage.ref(uniqueName);
      
      // Upload file
      const snapshot = await storageRef.put(file);
      
      // Get URL
      const downloadURL = await snapshot.ref.getDownloadURL();
      return downloadURL;
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

export const submitUserLead = async (form: SubmissionForm, imageUrls: string[]) => {
  if (!db) throw new Error("Firestore not initialized");

  // Save to a separate 'submissions' collection for review/audit
  const docRef = await db.collection(SUBMISSION_COLLECTION).add({
    ...form,
    images: imageUrls,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });
  
  return docRef.id;
};
// Deprecated alias for backward compatibility if needed, but prefer specific functions
export const submitProperty = submitUserLead;