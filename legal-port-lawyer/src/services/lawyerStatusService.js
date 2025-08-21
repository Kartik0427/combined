
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const updateLawyerAvailability = async (lawyerId, serviceType, isAvailable) => {
  try {
    const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
    await updateDoc(lawyerRef, {
      [`availability.${serviceType}`]: isAvailable,
      lastActive: serverTimestamp(),
      isOnline: true
    });
    console.log(`${serviceType} availability updated to:`, isAvailable);
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
};

export const updateLawyerOnlineStatus = async (lawyerId, isOnline) => {
  try {
    const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
    await updateDoc(lawyerRef, {
      isOnline: isOnline,
      lastActive: serverTimestamp()
    });
    console.log('Online status updated to:', isOnline);
  } catch (error) {
    console.error('Error updating online status:', error);
    throw error;
  }
};

export const subscribeLawyerStatus = (lawyerId, callback) => {
  const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
  return onSnapshot(lawyerRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback(data);
    }
  }, (error) => {
    console.error('Error listening to lawyer status:', error);
  });
};

export const updateLawyerProfile = async (lawyerId, profileData) => {
  try {
    const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
    await updateDoc(lawyerRef, {
      ...profileData,
      updatedAt: serverTimestamp()
    });
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
