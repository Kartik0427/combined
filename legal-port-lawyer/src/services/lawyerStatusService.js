
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Real-time listener for lawyer status changes
export const subscribeLawyerStatus = (lawyerId, callback) => {
  if (!lawyerId) return null;
  
  const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
  
  return onSnapshot(lawyerRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        availability: data.availability || { audio: false, video: false, chat: false },
        isOnline: data.isOnline || false,
        lastActive: data.lastActive?.toDate() || new Date(),
        ...data
      });
    }
  }, (error) => {
    console.error('Error listening to lawyer status:', error);
  });
};

// Update lawyer availability
export const updateLawyerAvailability = async (lawyerId, availability, isOnline) => {
  if (!lawyerId) return;
  
  try {
    const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
    await updateDoc(lawyerRef, {
      availability,
      isOnline,
      lastActive: new Date()
    });
  } catch (error) {
    console.error('Error updating lawyer availability:', error);
    throw error;
  }
};

// Update lawyer profile
export const updateLawyerProfile = async (lawyerId, profileData) => {
  if (!lawyerId) return;
  
  try {
    const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
    await updateDoc(lawyerRef, {
      ...profileData,
      lastActive: new Date()
    });
  } catch (error) {
    console.error('Error updating lawyer profile:', error);
    throw error;
  }
};
