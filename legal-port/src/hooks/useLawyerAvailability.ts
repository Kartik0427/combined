
import { useState, useEffect, useCallback } from 'react';
import { eventSourceManager, LawyerAvailabilityUpdate } from '../services/eventSourceService';
import { Lawyer } from '../services/lawyerService';

interface LawyerAvailabilityState {
  [lawyerId: string]: {
    availability: {
      audio: boolean;
      video: boolean;
      chat: boolean;
    };
    isOnline: boolean;
    lastActive: Date;
  };
}

export const useLawyerAvailability = (initialLawyers: Lawyer[] = []) => {
  const [availabilityState, setAvailabilityState] = useState<LawyerAvailabilityState>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Initialize state with current lawyers
  useEffect(() => {
    const initialState: LawyerAvailabilityState = {};
    initialLawyers.forEach(lawyer => {
      initialState[lawyer.id] = {
        availability: lawyer.availability,
        isOnline: lawyer.isOnline,
        lastActive: lawyer.lastActive
      };
    });
    setAvailabilityState(initialState);
  }, [initialLawyers]);

  const handleAvailabilityUpdate = useCallback((update: LawyerAvailabilityUpdate) => {
    setAvailabilityState(prev => ({
      ...prev,
      [update.lawyerId]: {
        availability: update.availability,
        isOnline: update.isOnline,
        lastActive: update.lastActive
      }
    }));
  }, []);

  const handleOnlineStatus = useCallback((lawyerId: string, isOnline: boolean) => {
    setAvailabilityState(prev => ({
      ...prev,
      [lawyerId]: {
        ...prev[lawyerId],
        isOnline,
        lastActive: new Date()
      }
    }));
  }, []);

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionError(null);
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
  }, []);

  const handleError = useCallback((error: Event) => {
    setConnectionError('Connection error occurred');
    setIsConnected(false);
  }, []);

  useEffect(() => {
    eventSourceManager.connect({
      onAvailabilityUpdate: handleAvailabilityUpdate,
      onLawyerOnlineStatus: handleOnlineStatus,
      onConnect: handleConnect,
      onDisconnect: handleDisconnect,
      onError: handleError
    });

    return () => {
      eventSourceManager.disconnect();
    };
  }, [handleAvailabilityUpdate, handleOnlineStatus, handleConnect, handleDisconnect, handleError]);

  const getLawyerAvailability = useCallback((lawyerId: string) => {
    return availabilityState[lawyerId] || null;
  }, [availabilityState]);

  const getLawyersWithUpdatedAvailability = useCallback((lawyers: Lawyer[]): Lawyer[] => {
    return lawyers.map(lawyer => {
      const availability = availabilityState[lawyer.id];
      if (availability) {
        return {
          ...lawyer,
          availability: availability.availability,
          isOnline: availability.isOnline,
          lastActive: availability.lastActive
        };
      }
      return lawyer;
    });
  }, [availabilityState]);

  return {
    availabilityState,
    isConnected,
    connectionError,
    getLawyerAvailability,
    getLawyersWithUpdatedAvailability
  };
};
