import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { cloudStorageManager, CloudSyncStatus, SyncResult } from '../services/cloudStorage';

interface CloudSyncContextType {
  status: CloudSyncStatus;
  signIn: () => Promise<boolean>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<SyncResult>;
  syncFromCloud: () => Promise<SyncResult>;
  refreshStatus: () => void;
  resetSyncStatus: () => void;
}

const CloudSyncContext = createContext<CloudSyncContextType | undefined>(undefined);

export const useCloudSync = () => {
  const context = useContext(CloudSyncContext);
  if (context === undefined) {
    throw new Error('useCloudSync must be used within a CloudSyncProvider');
  }
  return context;
};

interface CloudSyncProviderProps {
  children: ReactNode;
}

export const CloudSyncProvider: React.FC<CloudSyncProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<CloudSyncStatus>({
    isCloudEnabled: false,
    isSignedIn: false,
    syncInProgress: false
  });
  
  const [isAppVisible, setIsAppVisible] = useState<boolean>(!document.hidden);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const SYNC_INTERVAL_MS = 60000; // 1 minute

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsAppVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Periodic sync when signed in and app is visible
  useEffect(() => {
    const startPeriodicSync = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      
      intervalRef.current = setInterval(async () => {
        if (status.isSignedIn && isAppVisible && !status.syncInProgress) {
          try {
            const result = await cloudStorageManager.syncFromCloud(true);
            if (result.boardsUpdated && result.boardsUpdated > 0) {
            }
            refreshStatus();
          } catch (error) {
          }
        }
      }, SYNC_INTERVAL_MS);
    };

    const stopPeriodicSync = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Start or stop periodic sync based on conditions
    if (status.isSignedIn && isAppVisible) {
      startPeriodicSync();
    } else {
      stopPeriodicSync();
    }

    // Cleanup on unmount
    return () => stopPeriodicSync();
  }, [status.isSignedIn, isAppVisible, status.syncInProgress]);

  useEffect(() => {
    const initializeCloudSync = async () => {
      const initialStatus = await cloudStorageManager.initialize();
      setStatus(initialStatus);
    };

    initializeCloudSync();
  }, []);

  const refreshStatus = () => {
    const currentStatus = cloudStorageManager.getStatus();
    setStatus(currentStatus);
  };

  const signIn = async (): Promise<boolean> => {
    const success = await cloudStorageManager.signIn();
    refreshStatus();
    return success;
  };

  const signOut = async (): Promise<void> => {
    await cloudStorageManager.signOut();
    refreshStatus();
  };

  const syncToCloud = async (): Promise<SyncResult> => {
    const result = await cloudStorageManager.syncToCloud();
    refreshStatus();
    return result;
  };

  const syncFromCloud = async (): Promise<SyncResult> => {
    const result = await cloudStorageManager.syncFromCloud(false);
    refreshStatus();
    return result;
  };

  const resetSyncStatus = (): void => {
    cloudStorageManager.resetSyncStatus();
    refreshStatus();
  };

  const contextValue: CloudSyncContextType = {
    status,
    signIn,
    signOut,
    syncToCloud,
    syncFromCloud,
    refreshStatus,
    resetSyncStatus
  };

  return (
    <CloudSyncContext.Provider value={contextValue}>
      {children}
    </CloudSyncContext.Provider>
  );
};