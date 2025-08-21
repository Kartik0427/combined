
import { doc, updateDoc, onSnapshot, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const updateLawyerAvailability = async (lawyerId, serviceType, isAvailable) => {
  try {
    const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
    
    // Check if document exists, if not create it
    const docSnap = await getDoc(lawyerRef);
    if (!docSnap.exists()) {
      await setDoc(lawyerRef, {
        availability: {
          audio: false,
          video: false,
          chat: false,
          [serviceType]: isAvailable
        },
        isOnline: true,
        lastActive: serverTimestamp()
      });
    } else {
      await updateDoc(lawyerRef, {
        [`availability.${serviceType}`]: isAvailable,
        lastActive: serverTimestamp()
      });
    }
    
    console.log(`${serviceType} availability updated to:`, isAvailable);
  } catch (error) {
    console.error('Error updating availability:', error);
    throw error;
  }
};

export const updateLawyerOnlineStatus = async (lawyerId, isOnline) => {
  try {
    const lawyerRef = doc(db, 'lawyer_profiles', lawyerId);
    
    // Check if document exists, if not create it
    const docSnap = await getDoc(lawyerRef);
    if (!docSnap.exists()) {
      await setDoc(lawyerRef, {
        isOnline: isOnline,
        availability: {
          audio: false,
          video: false,
          chat: false
        },
        lastActive: serverTimestamp()
      });
    } else {
      await updateDoc(lawyerRef, {
        isOnline: isOnline,
        lastActive: serverTimestamp()
      });
    }
    
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
    
    // Check if document exists, if not create it with profile data
    const docSnap = await getDoc(lawyerRef);
    if (!docSnap.exists()) {
      await setDoc(lawyerRef, {
        ...profileData,
        isOnline: false,
        availability: {
          audio: false,
          video: false,
          chat: false
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(lawyerRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });
    }
    
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};
