import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { cloudStorageManager, CloudSyncStatus, SyncResult } from '../services/cloudStorage';

interface CloudSyncContextType {
  status: CloudSyncStatus;
  setTokenAndSignIn: (token: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  syncToCloud: () => Promise<SyncResult>;
  syncFromCloud: () => Promise<SyncResult>;
  refreshStatus: () => void;
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

  useEffect(() => {
    const initializeCloudSync = () => {
      console.log('CloudSyncProvider: Initializing cloud sync...');
      const initialStatus = cloudStorageManager.initialize();
      console.log('CloudSyncProvider: Received status:', initialStatus);
      setStatus(initialStatus);
    };

    initializeCloudSync();
  }, []);

  const refreshStatus = () => {
    const currentStatus = cloudStorageManager.getStatus();
    console.log('CloudSyncContext: Refreshing status:', currentStatus);
    setStatus(currentStatus);
  };

  const setTokenAndSignIn = async (token: string): Promise<boolean> => {
    const success = await cloudStorageManager.setTokenAndSignIn(token);
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
    const result = await cloudStorageManager.syncFromCloud();
    refreshStatus();
    return result;
  };

  const contextValue: CloudSyncContextType = {
    status,
    setTokenAndSignIn,
    signOut,
    syncToCloud,
    syncFromCloud,
    refreshStatus
  };

  return (
    <CloudSyncContext.Provider value={contextValue}>
      {children}
    </CloudSyncContext.Provider>
  );
};