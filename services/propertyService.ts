import { db } from "../firebaseConfig";
import firebase from "firebase/compat/app";
import { Property, PropertyType, SubmissionForm, Lead, LeadStatus } from "../types";

const COLLECTION_NAME = "properties";
const SUBMISSION_COLLECTION = "submissions";

// ==========================================
// ☁️ CLOUDINARY CONFIG
// ==========================================
const CLOUD_NAME = "dxegbpc5t"; 
const UPLOAD_PRESET = "phayao_upload"; 
// ==========================================

// --- FETCH DATA ---

export const getProperties = async (type?: PropertyType | 'All' | 'VIDEO'): Promise<Property[]> => {
  if (!db) {
    console.warn("Firestore not initialized");
    return [];
  }

  try {
    // Try to fetch from Firestore
    let query: firebase.firestore.Query = db.collection(COLLECTION_NAME);
    
    if (type === 'VIDEO') {
        // Filter by content type video
        query = query.where("contentType", "==", "video");
    } else if (type && type !== 'All') {
        // Filter by Property Type (House, Land, Dorm)
        query = query.where("type", "==", type);
    }

    const querySnapshot = await query.get();
    
    const realProperties: Property[] = [];
    querySnapshot.forEach((doc) => {
      realProperties.push({ id: doc.id, ...doc.data() } as Property);
    });

    return realProperties;

  } catch (error) {
    console.error("Error fetching properties from Firebase:", error);
    return [];
  }
};

export const getPropertyById = async (id: string): Promise<Property | undefined> => {
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

export const incrementViewCount = async (id: string) => {
  if (!db) return;
  try {
    const docRef = db.collection(COLLECTION_NAME).doc(id);
    await docRef.update({
      viewCount: firebase.firestore.FieldValue.increment(1)
    });
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};

// --- LEADS MANAGEMENT (New) ---

export const getLeads = async (): Promise<Lead[]> => {
  if (!db) return [];
  try {
    const querySnapshot = await db.collection(SUBMISSION_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();
      
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() } as Lead);
    });
    return leads;
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
};

export const getLeadById = async (id: string): Promise<Lead | undefined> => {
  if (!db) return undefined;
  try {
    const doc = await db.collection(SUBMISSION_COLLECTION).doc(id).get();
    if (doc.exists) {
      return { id: doc.id, ...doc.data() } as Lead;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching lead:", error);
    return undefined;
  }
};

export const updateLeadStatus = async (id: string, status: LeadStatus) => {
  if (!db) throw new Error("Firestore not initialized");
  await db.collection(SUBMISSION_COLLECTION).doc(id).update({ status });
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

export const addProperty = async (form: SubmissionForm, imageUrls: string[], videoUrl?: string) => {
  if (!db) throw new Error("Firestore not initialized");

  const propertyData = {
    title: form.title,
    description: form.description,
    price: parseFloat(form.price.toString().replace(/,/g, '')) || 0,
    type: form.type,
    location: form.location || "พะเยา", // Use form location or default
    size: form.size,
    image: imageUrls[0] || '', // Cover image
    images: imageUrls,
    contactName: form.name,
    contactPhone: form.phone,
    coordinates: form.latitude && form.longitude ? {
      lat: form.latitude,
      lng: form.longitude
    } : null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: form.status || 'active', // Use form status
    viewCount: 0, // Initialize view count
    isRecommended: form.isRecommended || false, // Initialize recommended status
    isUnder100k: form.isUnder100k || false, // Initialize under 100k status
    contentType: form.contentType || 'post',
    videoUrl: videoUrl || ''
  };

  const docRef = await db.collection(COLLECTION_NAME).add(propertyData);
  return docRef.id;
};

// --- SUBMISSION & UPLOAD (CLOUDINARY) ---

export const uploadImages = async (files: File[]): Promise<string[]> => {
  
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Cloudinary Error:", data);
        throw new Error(data.error?.message || "Upload failed");
      }

      return data.secure_url;
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
};

export const uploadVideo = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 

    try {
      // Note: Endpoint changes to /video/upload
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Cloudinary Video Error:", data);
        throw new Error(data.error?.message || "Video upload failed");
      }

      return data.secure_url;
    } catch (error) {
      console.error("Error uploading video to Cloudinary:", error);
      throw error;
    }
};

export const submitUserLead = async (form: SubmissionForm, imageUrls: string[]) => {
  if (!db) throw new Error("Firestore not initialized");

  const docRef = await db.collection(SUBMISSION_COLLECTION).add({
    ...form,
    images: imageUrls,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'pending' // Default status
  });
  
  return docRef.id;
};

export const submitProperty = submitUserLead;