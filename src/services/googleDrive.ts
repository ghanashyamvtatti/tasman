import { Board } from '../types';

export interface BoardPermission {
  id: string;
  emailAddress: string;
  role: string;
}

interface DrivePermission {
  id?: string;
  emailAddress?: string;
  role?: string;
  type?: string;
}

interface DriveFile {
  id?: string;
  name?: string;
  owners?: Array<{ displayName?: string; emailAddress?: string }>;
  modifiedTime?: string;
}

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const TASMAN_FOLDER_NAME = 'Tasman Boards';

declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

export interface GoogleDriveService {
  isInitialized: boolean;
  isSignedIn: boolean;
  userEmail?: string;
}

class GoogleDriveManager {
  private initialized = false;
  private signedIn = false;
  private userEmail?: string;
  private tasmanFolderId?: string;
  private accessToken?: string;

  async initialize(): Promise<GoogleDriveService> {
    if (!CLIENT_ID || !API_KEY) {
      return { isInitialized: false, isSignedIn: false };
    }

    try {
      // Load Google Identity Services and Google APIs
      await this.loadGoogleScripts();
      
      // Initialize Google APIs Client Library
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      // Initialize Google Identity Services
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: () => {}, // We'll handle sign-in manually
      });

      this.initialized = true;
      
      return {
        isInitialized: this.initialized,
        isSignedIn: this.signedIn,
        userEmail: this.userEmail
      };
    } catch (error) {
      return { isInitialized: false, isSignedIn: false };
    }
  }

  private async loadGoogleScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Load Google Identity Services
      if (!document.querySelector('script[src*="accounts.google.com"]')) {
        const gsiScript = document.createElement('script');
        gsiScript.src = 'https://accounts.google.com/gsi/client';
        gsiScript.onload = () => {
          // Load Google APIs Client Library
          if (!document.querySelector('script[src*="apis.google.com"]')) {
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.onload = () => resolve();
            gapiScript.onerror = () => reject(new Error('Failed to load Google APIs Client Library'));
            document.head.appendChild(gapiScript);
          } else {
            resolve();
          }
        };
        gsiScript.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(gsiScript);
      } else if (!document.querySelector('script[src*="apis.google.com"]')) {
        const gapiScript = document.createElement('script');
        gapiScript.src = 'https://apis.google.com/js/api.js';
        gapiScript.onload = () => resolve();
        gapiScript.onerror = () => reject(new Error('Failed to load Google APIs Client Library'));
        document.head.appendChild(gapiScript);
      } else {
        resolve();
      }
    });
  }

  async signIn(): Promise<boolean> {
    if (!this.initialized) {
      return false;
    }

    try {
      
      return new Promise((resolve) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: async (response: any) => {
            if (response.error) {
              resolve(false);
              return;
            }

            this.accessToken = response.access_token;
            
            // Set the access token for gapi client
            window.gapi.client.setToken({ access_token: this.accessToken });
            
            // Get user info
            try {
              const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                  'Authorization': `Bearer ${this.accessToken}`
                }
              });
              
              if (userInfoResponse.ok) {
                const userInfo = await userInfoResponse.json();
                this.userEmail = userInfo.email;
                this.signedIn = true;
                
                await this.ensureTasmanFolder();
                resolve(true);
              } else {
                resolve(false);
              }
            } catch (error) {
              resolve(false);
            }
          },
        });

        // Request access token
        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (error) {
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (!this.initialized) return;

    try {
      if (this.accessToken) {
        // Revoke the access token
        window.google.accounts.oauth2.revoke(this.accessToken);
        this.accessToken = undefined;
      }
      
      // Clear gapi client token
      window.gapi.client.setToken(null);
      
      this.signedIn = false;
      this.userEmail = undefined;
      this.tasmanFolderId = undefined;
    } catch (error) {
      // Ignore sign-out errors
    }
  }

  private async ensureTasmanFolder(): Promise<string | undefined> {
    if (this.tasmanFolderId) {
      return this.tasmanFolderId;
    }

    try {
      // Check if folder already exists
      const response = await window.gapi.client.drive.files.list({
        q: `name='${TASMAN_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        this.tasmanFolderId = response.result.files[0].id || '';
        return this.tasmanFolderId;
      }

      // Create folder if it doesn't exist
      const createResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: TASMAN_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        }
      });

      this.tasmanFolderId = createResponse.result.id || '';
      return this.tasmanFolderId;
    } catch (error) {
      throw error;
    }
  }

  async uploadBoard(board: Board): Promise<boolean> {
    if (!this.signedIn || !this.tasmanFolderId || !this.accessToken) {
      return false;
    }

    try {
      const fileName = `${board.id}.json`;
      const fileContent = JSON.stringify(board, null, 2);
      
      // Check if file already exists
      const existingResponse = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const metadata = {
        name: fileName,
        parents: [this.tasmanFolderId]
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        close_delim;

      if (existingResponse.result.files && existingResponse.result.files.length > 0) {
        // Update existing file (don't include parents in update)
        const fileId = existingResponse.result.files[0].id!;
        
        const updateMetadata = {
          name: fileName
          // Don't include parents in update requests
        };

        const updateMultipartRequestBody =
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          JSON.stringify(updateMetadata) +
          delimiter +
          'Content-Type: application/json\r\n\r\n' +
          fileContent +
          close_delim;

        await window.gapi.client.request({
          path: `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`
          },
          body: updateMultipartRequestBody
        });
      } else {
        // Create new file
        await window.gapi.client.request({
          path: 'https://www.googleapis.com/upload/drive/v3/files',
          method: 'POST',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`
          },
          body: multipartRequestBody
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async downloadBoard(boardId: string): Promise<Board | null> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return null;
    }

    try {
      const fileName = `${boardId}.json`;
      
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return null;
      }

      const fileId = response.result.files[0].id || '';
      const fileResponse = await window.gapi.client.drive.files.get({
        fileId,
        alt: 'media'
      });

      const boardData = JSON.parse(fileResponse.body) as Board;
      
      return boardData;
    } catch (error) {
      return null;
    }
  }

  async listCloudBoards(): Promise<{ id: string; name: string; modifiedTime: string }[]> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return [];
    }

    try {
      const response = await window.gapi.client.drive.files.list({
        q: `parents in '${this.tasmanFolderId}' and trashed=false and name contains '.json'`,
        fields: 'files(id,name,modifiedTime)'
      });

      if (!response.result.files) {
        return [];
      }

      return response.result.files.map((file: any) => ({
        id: (file.name || '').replace('.json', ''),
        name: (file.name || '').replace('.json', ''),
        modifiedTime: file.modifiedTime || ''
      }));
    } catch (error) {
      return [];
    }
  }

  async deleteCloudBoard(boardId: string): Promise<boolean> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return false;
    }

    try {
      const fileName = `${boardId}.json`;
      
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return false;
      }

      const fileId = response.result.files[0].id || '';
      await window.gapi.client.drive.files.delete({ fileId });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  async shareBoardWithEmail(boardId: string, email: string, permission: 'reader' | 'writer' = 'writer'): Promise<boolean> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return false;
    }

    try {
      const fileName = `${boardId}.json`;
      
      // Find the board file
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return false;
      }

      const fileId = response.result.files[0].id || '';
      
      // Create permission for the email
      await window.gapi.client.drive.permissions.create({
        fileId: fileId,
        resource: {
          role: permission,
          type: 'user',
          emailAddress: email
        },
        sendNotificationEmail: true
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async getBoardPermissions(boardId: string): Promise<BoardPermission[]> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return [];
    }

    try {
      const fileName = `${boardId}.json`;
      
      // Find the board file
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return [];
      }

      const fileId = response.result.files[0].id || '';
      
      // Get permissions
      const permissionsResponse = await window.gapi.client.drive.permissions.list({
        fileId: fileId,
        fields: 'permissions(emailAddress,role,type)'
      });

      const permissions = (permissionsResponse.result.permissions || []) as DrivePermission[];
      return permissions
        .filter((p: DrivePermission) => p.type === 'user' && p.emailAddress)
        .map((p: DrivePermission) => ({
          id: p.id || '',
          emailAddress: p.emailAddress || '',
          role: p.role || ''
        }));
    } catch (error) {
      return [];
    }
  }

  async removeSharePermission(boardId: string, email: string): Promise<boolean> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return false;
    }

    try {
      const fileName = `${boardId}.json`;
      
      // Find the board file
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return false;
      }

      const fileId = response.result.files[0].id || '';
      
      // Get permissions to find the permission ID
      const permissionsResponse = await window.gapi.client.drive.permissions.list({
        fileId: fileId,
        fields: 'permissions(id,emailAddress,type)'
      });

      const permissions = (permissionsResponse.result.permissions || []) as DrivePermission[];
      const targetPermission = permissions.find((p: DrivePermission) => 
        p.type === 'user' && p.emailAddress === email
      );

      if (!targetPermission || !targetPermission.id) {
        return false;
      }

      // Delete the permission
      await window.gapi.client.drive.permissions.delete({
        fileId: fileId,
        permissionId: targetPermission.id
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  async listSharedBoards(): Promise<{ id: string; name: string; owner: string; modifiedTime: string }[]> {
    if (!this.signedIn) {
      return [];
    }

    try {
      // Search for shared JSON files (boards shared with us)
      const response = await window.gapi.client.drive.files.list({
        q: `name contains '.json' and sharedWithMe=true and trashed=false`,
        fields: 'files(id,name,owners,modifiedTime)'
      });

      if (!response.result.files) {
        return [];
      }

      return (response.result.files as DriveFile[])
        .filter((file: DriveFile) => (file.name || '').endsWith('.json'))
        .map((file: DriveFile) => ({
          id: (file.name || '').replace('.json', ''),
          name: (file.name || '').replace('.json', ''),
          owner: file.owners && file.owners[0] ? (file.owners[0].displayName || file.owners[0].emailAddress || 'Unknown') : 'Unknown',
          modifiedTime: file.modifiedTime || ''
        }));
    } catch (error) {
      return [];
    }
  }

  async downloadSharedBoard(boardId: string): Promise<Board | null> {
    if (!this.signedIn) {
      return null;
    }

    try {
      const fileName = `${boardId}.json`;
      
      // Search for the shared board file
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and sharedWithMe=true and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return null;
      }

      const fileId = response.result.files[0].id || '';
      const fileResponse = await window.gapi.client.drive.files.get({
        fileId,
        alt: 'media'
      });

      const boardData = JSON.parse(fileResponse.body) as Board;
      
      // Mark as shared
      boardData.isShared = true;
      
      return boardData;
    } catch (error) {
      return null;
    }
  }

  getStatus(): GoogleDriveService {
    return {
      isInitialized: this.initialized,
      isSignedIn: this.signedIn,
      userEmail: this.userEmail
    };
  }
}

export const googleDriveManager = new GoogleDriveManager();