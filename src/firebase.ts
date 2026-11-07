import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  query,
  limit,
  serverTimestamp,
  Firestore 
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { Testimonial } from './types';

// Firebase project credentials and configuration details
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore, Auth & Storage
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);

export interface FirestoreEnquiryData {
  studentName: string;
  phoneNumber: string;
  program: string;
  message?: string;
  createdAt?: unknown;
  source?: string;
}

/**
 * Saves student admission enquiry directly to the "enquiries" collection in Firestore.
 * Wrapped in try/catch to log permission/network errors cleanly to console.
 */
export async function saveAdmissionEnquiry(enquiry: {
  studentName: string;
  phoneNumber: string;
  program: string;
  message?: string;
  source?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'enquiries'), {
      studentName: enquiry.studentName.trim(),
      phoneNumber: enquiry.phoneNumber.trim(),
      program: enquiry.program,
      message: (enquiry.message || '').trim(),
      status: 'New',
      source: enquiry.source || 'website_contact_form',
      createdAt: serverTimestamp()
    });

    console.log('Enquiry successfully saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    console.error('Firestore enquiry submission error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches student testimonials from the "testimonials" collection in Firestore.
 * Logs cleanly and handles network/permission cases safely.
 */
export async function fetchTestimonialsFromFirestore(): Promise<Testimonial[]> {
  try {
    const testimonialsRef = collection(db, 'testimonials');
    const q = query(testimonialsRef, limit(25));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const testimonials: Testimonial[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      testimonials.push({
        id: docSnap.id,
        name: data.name || data.studentName || 'Student',
        program: data.program || data.course || 'Sarvadnya Student',
        scoreOrAchievement: data.scoreOrAchievement || data.achievement || '',
        year: data.year || data.batch || '',
        rating: typeof data.rating === 'number' ? data.rating : 5,
        review: data.review || data.message || data.feedback || '',
        avatarUrl: data.avatarUrl || ''
      });
    });

    return testimonials;
  } catch (error: unknown) {
    console.warn('Firestore testimonials fetch notice (using fallback defaults):', error);
    return [];
  }
}

/**
 * Saves a new student testimonial into the "testimonials" collection in Firestore.
 */
export async function saveTestimonialToFirestore(testimonial: {
  name: string;
  program: string;
  scoreOrAchievement?: string;
  year?: string;
  review: string;
  rating?: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, 'testimonials'), {
      name: testimonial.name.trim(),
      program: testimonial.program.trim(),
      scoreOrAchievement: (testimonial.scoreOrAchievement || '').trim(),
      year: (testimonial.year || '').trim(),
      review: testimonial.review.trim(),
      rating: testimonial.rating || 5,
      createdAt: serverTimestamp()
    });

    console.log('Testimonial saved to Firestore with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error: unknown) {
    console.error('Error saving testimonial to Firestore:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

export default db;

