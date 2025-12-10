
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  where, 
  addDoc, 
  deleteDoc,
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
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
    let q = collection(db, COLLECTION_NAME);
    
    if (type && type !== 'All') {
      q = query(collection(db, COLLECTION_NAME), where("type", "==", type)) as any;
    }

    const querySnapshot = await getDocs(q);
    
    const realProperties: Property[] = [];
    querySnapshot.forEach((doc) => {
      realProperties.push({ id: doc.id, ...doc.data() } as Property);
    });

    // Merge with Mock Data for demo purposes if needed, or just return real data
    // To allow user to see their changes immediately, we prioritize real data
    // But we keep mock data if the DB is empty so the app isn't blank
    if (realProperties.length === 0) {
       if (type && type !== 'All') return MOCK_PROPERTIES.filter(p => p.type === type);
       return MOCK_PROPERTIES;
    }

    return realProperties;

  } catch (error) {
    console.warn("Error fetching properties from Firebase:", error);
    if (type && type !== 'All') {
      return MOCK_PROPERTIES.filter(p => p.type === type);
    }
    return MOCK_PROPERTIES;
  }
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  if (!db) return MOCK_PROPERTIES.find(p => p.id === id);

  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Property;
    } 
    
    // Fallback to mock data if not found in DB
    return MOCK_PROPERTIES.find(p => p.id === id);
  } catch (error) {
    console.warn("Error fetching property by ID:", error);
    return MOCK_PROPERTIES.find(p => p.id === id);
  }
};

// --- ADMIN ACTIONS ---

export const deleteProperty = async (id: string) => {
  if (!db) throw new Error("Database not initialized");
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};

export const updateProperty = async (id: string, data: Partial<Property>) => {
  if (!db) throw new Error("Database not initialized");
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, data);
};

export const addProperty = async (form: SubmissionForm, imageUrls: string[]) => {
  if (!db) throw new Error("Firestore not initialized");

  const propertyData = {
    title: form.title,
    description: form.description,
    price: parseFloat(form.price.toString().replace(/,/g, '')) || 0,
    type: form.type,
    location: "พะเยา", // Default or add location field to admin form
    size: form.size,
    image: imageUrls[0] || '',
    images: imageUrls,
    contactName: form.name,
    contactPhone: form.phone,
    coordinates: form.latitude && form.longitude ? {
      lat: form.latitude,
      lng: form.longitude
    } : null,
    createdAt: serverTimestamp(),
    status: 'active'
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), propertyData);
  return docRef.id;
};

// --- USER SUBMISSION (LEAD GEN) ---

export const uploadImages = async (files: File[]): Promise<string[]> => {
  if (!storage) throw new Error("Storage not initialized");

  const uploadPromises = files.map(async (file) => {
    try {
      const uniqueName = `submissions/${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      const storageRef = ref(storage, uniqueName);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
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
  const docRef = await addDoc(collection(db, SUBMISSION_COLLECTION), {
    ...form,
    images: imageUrls,
    createdAt: serverTimestamp(),
    status: 'pending'
  });
  
  return docRef.id;
};
