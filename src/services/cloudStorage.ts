import { Board } from '../types';
import { googleDriveManager } from './googleDrive';
import * as localStorage from '../utils/storage';

export interface CloudSyncStatus {
  isCloudEnabled: boolean;
  isSignedIn: boolean;
  userEmail?: string;
  lastSyncTime?: Date;
  syncInProgress: boolean;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  boardsUpdated?: number;
}

class CloudStorageManager {
  private syncInProgress = false;
  private lastSyncTime?: Date;
  private error?: string;

  async initialize(): Promise<CloudSyncStatus> {
    try {
      console.log('CloudStorageManager: Initializing...');
      const status = await googleDriveManager.initialize();
      console.log('CloudStorageManager: Google Drive status:', status);
      
      const result = {
        isCloudEnabled: status.isInitialized,
        isSignedIn: status.isSignedIn,
        userEmail: status.userEmail,
        lastSyncTime: this.lastSyncTime,
        syncInProgress: this.syncInProgress,
        error: this.error
      };
      
      console.log('CloudStorageManager: Returning status:', result);
      return result;
    } catch (error) {
      this.error = 'Failed to initialize cloud storage';
      console.error('Cloud storage initialization failed:', error);
      return {
        isCloudEnabled: false,
        isSignedIn: false,
        syncInProgress: false,
        error: this.error
      };
    }
  }

  async signIn(): Promise<boolean> {
    try {
      const success = await googleDriveManager.signIn();
      if (success) {
        this.error = undefined;
        // Auto-sync after sign-in
        setTimeout(() => this.syncToCloud(), 1000);
      } else {
        this.error = 'Failed to sign in to Google Drive';
      }
      return success;
    } catch (error) {
      this.error = 'Sign-in failed';
      console.error('Cloud storage sign-in failed:', error);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await googleDriveManager.signOut();
      this.error = undefined;
      this.lastSyncTime = undefined;
    } catch (error) {
      this.error = 'Sign-out failed';
      console.error('Cloud storage sign-out failed:', error);
    }
  }

  async saveBoard(board: Board): Promise<void> {
    // Always save locally first
    localStorage.saveBoardById(board.id, board);

    // Then sync to cloud if signed in
    const status = googleDriveManager.getStatus();
    if (status.isSignedIn) {
      try {
        await googleDriveManager.uploadBoard(board);
        this.lastSyncTime = new Date();
        this.error = undefined;
      } catch (error) {
        this.error = 'Failed to sync board to cloud';
        console.error('Failed to sync board to cloud:', error);
      }
    }
  }

  async loadBoard(boardId: string): Promise<Board | null> {
    // Try to load from local storage first
    const localBoard = localStorage.loadBoardById(boardId);
    
    // If signed in to cloud, try to get latest version
    const status = googleDriveManager.getStatus();
    if (status.isSignedIn) {
      try {
        const cloudBoard = await googleDriveManager.downloadBoard(boardId);
        
        if (cloudBoard) {
          // Compare timestamps or use cloud version if local doesn't exist
          if (!localBoard) {
            // Save cloud version locally and return it
            localStorage.saveBoardById(boardId, cloudBoard);
            return cloudBoard;
          }
          
          // For now, prefer cloud version if it exists
          // In a more sophisticated implementation, we could compare modification times
          localStorage.saveBoardById(boardId, cloudBoard);
          return cloudBoard;
        }
      } catch (error) {
        this.error = 'Failed to load board from cloud';
        console.error('Failed to load board from cloud:', error);
      }
    }
    
    return localBoard;
  }

  async syncToCloud(): Promise<SyncResult> {
    const status = googleDriveManager.getStatus();
    if (!status.isSignedIn) {
      return {
        success: false,
        message: 'Not signed in to Google Drive'
      };
    }

    if (this.syncInProgress) {
      return {
        success: false,
        message: 'Sync already in progress'
      };
    }

    this.syncInProgress = true;
    this.error = undefined;

    try {
      const localBoards = localStorage.getAllBoards();
      let uploadedCount = 0;

      for (const boardInfo of localBoards) {
        const board = localStorage.loadBoardById(boardInfo.id);
        if (board) {
          const success = await googleDriveManager.uploadBoard(board);
          if (success) {
            uploadedCount++;
          }
        }
      }

      this.lastSyncTime = new Date();
      this.syncInProgress = false;

      return {
        success: true,
        message: `Successfully synced ${uploadedCount} boards to cloud`,
        boardsUpdated: uploadedCount
      };
    } catch (error) {
      this.error = 'Sync to cloud failed';
      this.syncInProgress = false;
      console.error('Sync to cloud failed:', error);
      
      return {
        success: false,
        message: 'Failed to sync boards to cloud'
      };
    }
  }

  async syncFromCloud(): Promise<SyncResult> {
    const status = googleDriveManager.getStatus();
    if (!status.isSignedIn) {
      return {
        success: false,
        message: 'Not signed in to Google Drive'
      };
    }

    if (this.syncInProgress) {
      return {
        success: false,
        message: 'Sync already in progress'
      };
    }

    this.syncInProgress = true;
    this.error = undefined;

    try {
      const cloudBoards = await googleDriveManager.listCloudBoards();
      let downloadedCount = 0;

      for (const cloudBoardInfo of cloudBoards) {
        const cloudBoard = await googleDriveManager.downloadBoard(cloudBoardInfo.id);
        if (cloudBoard) {
          localStorage.saveBoardById(cloudBoard.id, cloudBoard);
          downloadedCount++;
        }
      }

      this.lastSyncTime = new Date();
      this.syncInProgress = false;

      return {
        success: true,
        message: `Successfully downloaded ${downloadedCount} boards from cloud`,
        boardsUpdated: downloadedCount
      };
    } catch (error) {
      this.error = 'Sync from cloud failed';
      this.syncInProgress = false;
      console.error('Sync from cloud failed:', error);
      
      return {
        success: false,
        message: 'Failed to sync boards from cloud'
      };
    }
  }

  async deleteBoard(boardId: string): Promise<void> {
    // Delete locally
    localStorage.deleteBoard(boardId);
    
    // Delete from cloud if signed in
    const status = googleDriveManager.getStatus();
    if (status.isSignedIn) {
      try {
        await googleDriveManager.deleteCloudBoard(boardId);
        this.error = undefined;
      } catch (error) {
        this.error = 'Failed to delete board from cloud';
        console.error('Failed to delete board from cloud:', error);
      }
    }
  }

  getStatus(): CloudSyncStatus {
    const driveStatus = googleDriveManager.getStatus();
    return {
      isCloudEnabled: driveStatus.isInitialized,
      isSignedIn: driveStatus.isSignedIn,
      userEmail: driveStatus.userEmail,
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
      error: this.error
    };
  }
}

export const cloudStorageManager = new CloudStorageManager();