` tags.

<replit_final_file>
import { collection, onSnapshot, doc, getDoc, Timestamp } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

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

// Fetch lawyer categories from categories collection
const fetchLawyerCategories = async (lawyerId: string): Promise<string[]> => {
  try {
    const categoriesRef = doc(db, 'categories', lawyerId);
    const docSnap = await getDoc(categoriesRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.categories || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// Get proper image URL from storage
const getImageUrl = async (imagePath: string): Promise<string> => {
  try {
    if (!imagePath) return '';
    const imageRef = ref(storage, imagePath);
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Error getting download URL for image:', error);
    return '';
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
    } catch (error) {
      console.error('Error in subscribeLawyers:', error);
      callback([]);
    }
  });
};