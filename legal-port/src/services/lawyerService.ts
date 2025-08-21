
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from "firebase/firestore";

export interface Lawyer {
  id: string;
  name: string;
  specializations: string[];
  rating: number;
  reviews: number;
  experience: number;
  isOnline: boolean;
  pricing: {
    audio: number;
    video: number;
    chat: number;
  };
  image: string;
  connections: number;
  verified: boolean;
  availability: {
    audio: boolean;
    video: boolean;
    chat: boolean;
  };
  lastActive: Date;
}

// Function to convert Firebase Storage gs:// URL to HTTPS URL
const getImageUrl = async (imageUrl: string): Promise<string> => {
  if (!imageUrl) return '';
  
  // If it's already an HTTPS URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // If it's a gs:// URL, convert to download URL
  if (imageUrl.startsWith('gs://')) {
    try {
      const storage = getStorage();
      // Extract the path from gs://bucket-name/path
      const path = imageUrl.replace(/^gs:\/\/[^\/]+\//, '');
      const storageRef = ref(storage, path);
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (error) {
      console.error('Error getting download URL for image:', error);
      return '';
    }
  }
  
  return imageUrl;
};

// Function to fetch specializations for a specific lawyer
export const fetchLawyerCategories = async (lawyerId: string) => {
  try {
    const q = query(
      collection(db, "categories"),
      where("id", "==", lawyerId)
    );

    const querySnapshot = await getDocs(q);

    let categories: string[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories = [...categories, ...data.names]; // assuming schema { id: string, names: [] }
    });

    return categories;
  } catch (error) {
    console.error("Error fetching lawyer categories:", error);
    return [];
  }
};

export const fetchLawyers = async (): Promise<Lawyer[]> => {
  try {
    const lawyersRef = collection(db, 'lawyer_profiles');
    const q = query(lawyersRef);
    const querySnapshot = await getDocs(q);

    const lawyerPromises = querySnapshot.docs.map(async (doc) => {
      const data = doc.data();

      // Fetch categories from categories collection
      const specializations = await fetchLawyerCategories(doc.id);

      // Get the proper image URL
      const imageUrl = await getImageUrl(data.image || '');

      return {
        id: doc.id,
        name: data.name || '',
        specializations,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        experience: data.experience || 0,
        isOnline: data.isOnline || false,
        pricing: {
          audio: data.pricing?.audio || 0,
          video: data.pricing?.video || 0,
          chat: data.pricing?.chat || 0,
        },
        image: imageUrl,
        connections: data.connections || 0,
        verified: data.verified || false,
        availability: {
          audio: data.availability?.audio || false,
          video: data.availability?.video || false,
          chat: data.availability?.chat || false,
        },
        lastActive: data.lastActive?.toDate() || new Date(),
      };
    });

    return await Promise.all(lawyerPromises);
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    throw new Error('Failed to fetch lawyers from database');
  }
};

// Real-time listener for lawyer availability changes
export const subscribeLawyerAvailability = (lawyerId: string, callback: (availability: any) => void) => {
  const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
  
  return onSnapshot(lawyerRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        availability: data.availability || { audio: false, video: false, chat: false },
        isOnline: data.isOnline || false,
        lastActive: data.lastActive?.toDate() || new Date()
      });
    }
  }, (error) => {
    console.error('Error listening to lawyer availability:', error);
  });
};

// Real-time listener for all lawyers (for the main catalog)
export const subscribeLawyers = (callback: (lawyers: Lawyer[]) => void) => {
  const lawyersRef = collection(db, 'lawyer_profiles');
  
  return onSnapshot(lawyersRef, async (snapshot) => {
    try {
      const lawyerPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();

        // Fetch categories from categories collection
        const specializations = await fetchLawyerCategories(doc.id);

        // Get the proper image URL
        const imageUrl = await getImageUrl(data.image || '');

      return {
        id: doc.id,
        name: data.name || '',
        specializations,
        rating: data.rating || 0,
        reviews: data.reviews || 0,
        experience: data.experience || 0,
        isOnline: data.isOnline || false,
        pricing: {
          audio: data.pricing?.audio || 0,
          video: data.pricing?.video || 0,
          chat: data.pricing?.chat || 0,
        },
        image: imageUrl,
        connections: data.connections || 0,
        verified: data.verified || false,
        availability: {
          audio: data.availability?.audio || false,
          video: data.availability?.video || false,
          chat: data.availability?.chat || false,
        },
        lastActive: data.lastActive?.toDate() || new Date(),
      };
    });

    const lawyers = await Promise.all(lawyerPromises);
    callback(lawyers);
  });
};
