import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Simple config: if CLOUDINARY_URL exists, it's used automatically by the SDK.
// Otherwise, we use explicit keys.
if (!process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

console.log('[Cloudinary]: Initialized');

export const cloudinaryService = {
  uploadFile: async (file: any, folder: string = 'course-materials') => {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder, resource_type: 'auto' },
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
