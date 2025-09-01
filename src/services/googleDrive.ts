import { googleLogout } from '@react-oauth/google';
import { Board } from '../types';

const TASMAN_FOLDER_NAME = 'Tasman Boards';

export interface GoogleDriveService {
  isSignedIn: boolean;
  userEmail?: string;
}

class GoogleDriveManager {
  private accessToken?: string;
  private signedIn = false;
  private userEmail?: string;
  private tasmanFolderId?: string;

  async setToken(token: string): Promise<void> {
    this.accessToken = token;
    this.signedIn = true;
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      const userInfo = await response.json();
      this.userEmail = userInfo.email;
      await this.ensureTasmanFolder();
    } catch (error) {
      console.error('Failed to set token and get user info', error);
      this.signOut();
    }
  }

  signOut(): void {
    googleLogout();
    this.accessToken = undefined;
    this.signedIn = false;
    this.userEmail = undefined;
    this.tasmanFolderId = undefined;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('Not signed in');
    }
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.status === 401) {
      this.signOut();
      throw new Error('Unauthorized');
    }
    return response;
  }

  private async ensureTasmanFolder(): Promise<string | undefined> {
    if (this.tasmanFolderId) {
      return this.tasmanFolderId;
    }

    try {
      const query = `name='${TASMAN_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&spaces=drive`;
      const response = await this.fetchWithAuth(url);
      const data = await response.json();

      if (data.files && data.files.length > 0) {
        this.tasmanFolderId = data.files[0].id || '';
        return this.tasmanFolderId;
      }

      const createResponse = await this.fetchWithAuth('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: TASMAN_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        }),
      });

      const createData = await createResponse.json();
      this.tasmanFolderId = createData.id || '';
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

      const query = `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`;
      const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
      const existingResponse = await this.fetchWithAuth(listUrl);
      const existingData = await existingResponse.json();

      const boundary = '-------314159265358979323846';
      const delimiter = `
--${boundary}
`;
      const close_delim = `
--${boundary}--`;

      const metadata = {
        name: fileName,
        parents: [this.tasmanFolderId],
      };

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        close_delim;

      let uploadUrl: string;
      let method: string;

      if (existingData.files && existingData.files.length > 0) {
        const fileId = existingData.files[0].id!;
        uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
        method = 'PATCH';
      } else {
        uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
        method = 'POST';
      }

      await this.fetchWithAuth(uploadUrl, {
        method,
        headers: {
          'Content-Type': `multipart/related; boundary="${boundary}"`, 
        },
        body: multipartRequestBody,
      });

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
      const query = `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`;
      const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
      
      const response = await this.fetchWithAuth(listUrl);
      const data = await response.json();

      if (!data.files || data.files.length === 0) {
        return null;
      }

      const fileId = data.files[0].id || '';
      const fileUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const fileResponse = await this.fetchWithAuth(fileUrl);

      return await fileResponse.json() as Board;
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
      const query = `parents in '${this.tasmanFolderId}' and trashed=false and name contains '.json'`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)`;
      const response = await this.fetchWithAuth(url);
      const data = await response.json();

      if (!data.files) {
        return [];
      }

      return data.files.map((file: any) => ({
        id: (file.name || '').replace('.json', ''),
        name: (file.name || '').replace('.json', ''),
        modifiedTime: file.modifiedTime || '',
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
      const query = `name='${fileName}' and parents in '${this.tasmanFolderId}' and trashed=false`;
      const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
      
      const response = await this.fetchWithAuth(listUrl);
      const data = await response.json();

      if (!data.files || data.files.length === 0) {
        return false;
      }

      const fileId = data.files[0].id || '';
      const deleteUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;
      await this.fetchWithAuth(deleteUrl, { method: 'DELETE' });
      
      return true;
    } catch (error) {
      console.error('Failed to delete cloud board:', error);
      return false;
    }
  }

  getStatus(): GoogleDriveService {
    return {
      isSignedIn: this.signedIn,
      userEmail: this.userEmail,
    };
  }
}

export const googleDriveManager = new GoogleDriveManager();