import { gapi } from 'gapi-script';
import { Board } from '../types';

// Type extensions for gapi.client.drive
declare global {
  namespace gapi.client {
    const drive: any;
  }
}

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
// Use minimal scope to test
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const TASMAN_FOLDER_NAME = 'Tasman Boards';

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

  async initialize(): Promise<GoogleDriveService> {
    if (!CLIENT_ID || !API_KEY) {
      console.warn('Google Drive integration disabled: Missing CLIENT_ID or API_KEY');
      return { isInitialized: false, isSignedIn: false };
    }

    console.log('Initializing Google Drive API with:', {
      clientId: CLIENT_ID,
      apiKey: API_KEY ? 'Present' : 'Missing',
      origin: window.location.origin,
      scopes: SCOPES,
      discoveryDoc: DISCOVERY_DOC
    });

    try {
      await new Promise<void>((resolve, reject) => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: [DISCOVERY_DOC],
              scope: SCOPES
            });

            this.initialized = true;
            const authInstance = gapi.auth2.getAuthInstance();
            this.signedIn = authInstance.isSignedIn.get();
            
            // Test if Drive API is accessible
            console.log('Testing Drive API access...');
            try {
              await gapi.client.drive.about.get();
              console.log('Drive API is accessible');
            } catch (apiError) {
              console.warn('Drive API test failed (this is expected if not signed in):', apiError);
            }
            
            if (this.signedIn) {
              const user = authInstance.currentUser.get();
              this.userEmail = user.getBasicProfile().getEmail();
            }

            // Listen for sign-in state changes
            authInstance.isSignedIn.listen((isSignedIn: boolean) => {
              this.signedIn = isSignedIn;
              if (isSignedIn) {
                const user = authInstance.currentUser.get();
                this.userEmail = user.getBasicProfile().getEmail();
              } else {
                this.userEmail = undefined;
                this.tasmanFolderId = undefined;
              }
            });
            
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      if (this.signedIn) {
        await this.ensureTasmanFolder();
      }

      console.log('Google Drive API initialized successfully');
      return {
        isInitialized: this.initialized,
        isSignedIn: this.signedIn,
        userEmail: this.userEmail
      };
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return { isInitialized: false, isSignedIn: false };
    }
  }

  async signIn(): Promise<boolean> {
    if (!this.initialized) {
      console.error('Google Drive API not initialized');
      return false;
    }

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      console.log('Attempting Google Drive sign-in...');
      console.log('Auth instance details:', {
        isSignedIn: authInstance.isSignedIn.get(),
        currentUser: authInstance.currentUser.get()
      });
      
      // Check if user is already signed in (after redirect)
      if (authInstance.isSignedIn.get()) {
        console.log('User is already signed in!');
        const user = authInstance.currentUser.get();
        this.userEmail = user.getBasicProfile().getEmail();
        this.signedIn = true;
        console.log('Google Drive sign-in successful:', this.userEmail);
        await this.ensureTasmanFolder();
        return true;
      }
      
      // Use popup mode only to avoid page refresh
      console.log('Trying signIn with popup mode...');
      const user = await authInstance.signIn({
        ux_mode: 'popup'
      });
      
      console.log('User object received:', user);
      console.log('Auth response:', user.getAuthResponse());
      
      this.userEmail = user.getBasicProfile().getEmail();
      this.signedIn = true;
      
      console.log('Google Drive sign-in successful:', this.userEmail);
      await this.ensureTasmanFolder();
      return true;
    } catch (error) {
      console.error('Google Drive sign-in failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error,
        type: typeof error,
        keys: error && typeof error === 'object' ? Object.keys(error) : []
      });
      
      // Check if it's a Google auth error with specific handling
      if (error && typeof error === 'object' && 'error' in error) {
        console.error('Google Auth Error Type:', (error as any).error);
        console.error('Google Auth Error Details:', (error as any));
        
        // Try to get more specific error information
        if ((error as any).error === 'server_error') {
          console.error('Server error - possible causes:');
          console.error('1. OAuth consent screen not properly configured');
          console.error('2. Client ID domain mismatch'); 
          console.error('3. API quotas exceeded');
          console.error('4. Project billing issues');
          console.error('Current origin:', window.location.origin);
          console.error('Current CLIENT_ID:', CLIENT_ID);
          console.error('');
          console.error('PLEASE VERIFY IN GOOGLE CLOUD CONSOLE:');
          console.error(`1. Go to: https://console.cloud.google.com/apis/credentials`);
          console.error(`2. Edit OAuth Client: ${CLIENT_ID}`);
          console.error(`3. Check Authorized JavaScript origins contains: ${window.location.origin}`);
          console.error(`4. Check Authorized redirect URIs contains: ${window.location.origin}`);
        }
      }
      
      return false;
    }
  }

  async signOut(): Promise<void> {
    if (!this.initialized) return;

    try {
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.signedIn = false;
      this.userEmail = undefined;
      this.tasmanFolderId = undefined;
    } catch (error) {
      console.error('Google Drive sign-out failed:', error);
    }
  }

  private async ensureTasmanFolder(): Promise<string | undefined> {
    if (this.tasmanFolderId) {
      return this.tasmanFolderId;
    }

    try {
      // Check if folder already exists
      const response = await gapi.client.drive.files.list({
        q: `name='${TASMAN_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        this.tasmanFolderId = response.result.files[0].id || '';
        return this.tasmanFolderId;
      }

      // Create folder if it doesn't exist
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: TASMAN_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder'
        }
      });

      this.tasmanFolderId = createResponse.result.id || '';
      return this.tasmanFolderId;
    } catch (error) {
      console.error('Failed to ensure Tasman folder:', error);
      throw error;
    }
  }

  async uploadBoard(board: Board): Promise<boolean> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return false;
    }

    try {
      const fileName = `${board.id}.json`;
      const fileContent = JSON.stringify(board, null, 2);
      
      // Check if file already exists
      const existingResponse = await gapi.client.drive.files.list({
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
        // Update existing file
        const fileId = existingResponse.result.files[0].id!;
        await gapi.client.request({
          path: `https://www.googleapis.com/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'multipart' },
          headers: {
            'Content-Type': `multipart/related; boundary="${boundary}"`
          },
          body: multipartRequestBody
        });
      } else {
        // Create new file
        await gapi.client.request({
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
      console.error('Failed to upload board to Google Drive:', error);
      return false;
    }
  }

  async downloadBoard(boardId: string): Promise<Board | null> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return null;
    }

    try {
      const fileName = `${boardId}.json`;
      
      const response = await gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return null;
      }

      const fileId = response.result.files[0].id || '';
      const fileResponse = await gapi.client.drive.files.get({
        fileId,
        alt: 'media'
      });

      return JSON.parse(fileResponse.body) as Board;
    } catch (error) {
      console.error('Failed to download board from Google Drive:', error);
      return null;
    }
  }

  async listCloudBoards(): Promise<{ id: string; name: string; modifiedTime: string }[]> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return [];
    }

    try {
      const response = await gapi.client.drive.files.list({
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
      console.error('Failed to list cloud boards:', error);
      return [];
    }
  }

  async deleteCloudBoard(boardId: string): Promise<boolean> {
    if (!this.signedIn || !this.tasmanFolderId) {
      return false;
    }

    try {
      const fileName = `${boardId}.json`;
      
      const response = await gapi.client.drive.files.list({
        q: `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`
      });

      if (!response.result.files || response.result.files.length === 0) {
        return false;
      }

      const fileId = response.result.files[0].id || '';
      await gapi.client.drive.files.delete({ fileId });
      
      return true;
    } catch (error) {
      console.error('Failed to delete cloud board:', error);
      return false;
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