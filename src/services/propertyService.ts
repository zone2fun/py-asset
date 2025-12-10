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
const SUBMISSION_COLLECTION = "submissions";

// --- FETCH DATA ---

export const getProperties = async (type?: PropertyType | 'All'): Promise<Property[]> => {
  try {
    // Try to fetch from Firestore
    let q = collection(db, COLLECTION_NAME);
    
    if (type && type !== 'All') {
      q = query(collection(db, COLLECTION_NAME), where("type", "==", type)) as any;
    }

    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No documents found in Firestore, using Mock Data.");
      // Fallback to Mock Data if DB is empty (for demo purposes)
      if (type && type !== 'All') {
        return MOCK_PROPERTIES.filter(p => p.type === type);
      }
      return MOCK_PROPERTIES;
    }

    const properties: Property[] = [];
    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() } as Property);
    });

    return properties;

  } catch (error) {
    console.warn("Error fetching properties from Firebase (likely config missing), using Mock Data:", error);
    // Fallback to Mock Data on error
    if (type && type !== 'All') {
      return MOCK_PROPERTIES.filter(p => p.type === type);
    }
    return MOCK_PROPERTIES;
  }
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
  try {
    // 1. Check Mock Data first for hardcoded IDs (to keep demo working)
    const mockProp = MOCK_PROPERTIES.find(p => p.id === id);
    if (mockProp) return mockProp;

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
    return MOCK_PROPERTIES.find(p => p.id === id);
  }
};

// --- SUBMISSION ---

export const uploadImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    try {
      // Create a unique reference for the file
      // Structure: submissions/{timestamp}_{random}_{filename}
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
      const storageRef = ref(storage, `submissions/${uniqueName}`);
      
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
  try {
    const docRef = await addDoc(collection(db, SUBMISSION_COLLECTION), {
      ...form,
      images: imageUrls, // Store Firebase Storage URLs
      createdAt: serverTimestamp(),
      status: 'pending' // pending, approved, rejected
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};