import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

class GoogleDriveService {
  private drive;

  constructor() {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: 'v3', auth: oauth2Client });
  }

  /**
   * Upload a file to Google Drive
   * @param fileName Name of the file on Drive
   * @param filePath Local path to the file
   * @param mimeType MIME type of the file
   * @param folderId Parent folder ID
   */
  async uploadFile(fileName: string, filePath: string, mimeType: string, folderId?: string) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: folderId ? [folderId] : [],
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink',
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }

  /**
   * Create a folder on Google Drive
   * @param folderName Name of the folder
   * @param parentFolderId Parent folder ID
   */
  async createFolder(folderName: string, parentFolderId?: string) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolderId ? [parentFolderId] : [],
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });

      return response.data.id;
    } catch (error) {
      console.error('Error creating folder on Google Drive:', error);
      throw error;
    }
  }

  /**
   * Set public read permissions for a file
   * @param fileId Google Drive file ID
   */
  async makePublic(fileId: string) {
    try {
      await this.drive.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (error) {
      console.error('Error making file public:', error);
      throw error;
    }
  }
}

export default new GoogleDriveService();
