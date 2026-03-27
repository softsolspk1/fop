import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Simple config: if CLOUDINARY_URL exists, it's used automatically by the SDK.
// Otherwise, we use explicit keys.
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dq78ed4vu';
const API_KEY = process.env.CLOUDINARY_API_KEY || '879696267292899';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || 'yxNM3nyPpJwa8QJ8A6qIBM-pA0I';

if (process.env.CLOUDINARY_URL) {
  console.log('[Cloudinary]: Configured with CLOUDINARY_URL');
} else {
  console.log('[Cloudinary]: Configuring with keys (Source: ' + (process.env.CLOUDINARY_CLOUD_NAME ? 'ENV' : 'HARDCODED_FALLBACK') + ')');
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true
  });
}

console.log('[Cloudinary]: Initialized');

export const cloudinaryService = {
  uploadFile: async (file: any, folder: string = 'course-materials') => {
    try {
      const originalName = file.originalname || 'file';
      const fileExtension = path.extname(originalName);
      const fileNameWithoutExt = path.basename(originalName, fileExtension);
      
      // Sanitize filename to avoid Cloudinary issues
      const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      const publicId = `${sanitizedName}_${Date.now()}`;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder, 
            resource_type: 'auto',
            public_id: publicId,
            use_filename: true,
            unique_filename: true
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Upload Stream Error:', error);
              return reject(new Error(`Cloudinary Upload Failed: ${error.message}`));
            }
            resolve({
              url: result?.secure_url,
              publicId: result?.public_id,
              format: result?.format,
              resourceType: result?.resource_type,
            });
          }
        );
        
        if (file.buffer) {
          uploadStream.end(file.buffer);
        } else if (typeof file === 'string' && fs.existsSync(file)) {
          fs.createReadStream(file).pipe(uploadStream);
        } else {
          reject(new Error('Invalid file input for Cloudinary upload'));
        }
      }) as Promise<any>;
    } catch (error: any) {
      console.error('Cloudinary Upload Error Details:', {
        message: error.message,
        http_code: error.http_code,
        name: error.name
      });
      throw new Error(`Cloudinary Upload Failed: ${error.message || 'Unknown Error'}`);
    } finally {
      // No local file cleanup needed for memoryStorage buffers
    }
  },

  deleteFile: async (publicId: string) => {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary Delete Error:', error);
      throw error;
    }
  },
};

export default cloudinaryService;
