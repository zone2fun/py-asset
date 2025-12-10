import { db, storage } from "../src/firebaseConfig";
import firebase from "firebase/compat/app";
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

    // Merge Real Data with Mock Data
    let filteredMock = MOCK_PROPERTIES;
    if (type && type !== 'All') {
        filteredMock = MOCK_PROPERTIES.filter(p => p.type === type);
    }

    return [...realProperties, ...filteredMock];

  } catch (error) {
    console.warn("Error fetching properties from Firebase:", error);
    if (type && type !== 'All') {
      return MOCK_PROPERTIES.filter(p => p.type === type);
    }
    return MOCK_PROPERTIES;
  }
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  const mockProp = MOCK_PROPERTIES.find(p => p.id === id);
  if (mockProp) return mockProp;

  if (!db) return undefined;

  try {
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

// --- SUBMISSION ---

export const uploadImages = async (files: File[]): Promise<string[]> => {
  if (!storage) throw new Error("Storage not initialized");

  const uploadPromises = files.map(async (file) => {
    try {
      const uniqueName = `properties/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      const storageRef = storage.ref(uniqueName);
      const snapshot = await storageRef.put(file);
      return await snapshot.ref.getDownloadURL();
    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

export const submitUserLead = async (form: SubmissionForm, imageUrls: string[]) => {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await db.collection(SUBMISSION_COLLECTION).add({
    ...form,
    images: imageUrls,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'pending'
  });
  
  return docRef.id;
};

export const submitProperty = submitUserLead;