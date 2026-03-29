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
      
      // Categorize resource type based on extension
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(originalName);
      const isVideo = /\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i.test(originalName);
      const isDocument = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|txt|rtf)$/i.test(originalName);
      
      let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
      if (isImage) resourceType = 'image';
      else if (isVideo) resourceType = 'video';
      else if (isDocument) resourceType = 'raw';

      // Sanitize filename to avoid Cloudinary issues
      const sanitizedName = fileNameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      
      // For 'raw' (PDF/DOC) publicId MUST have extension to work properly.
      // For 'image/video' publicId should NOT have extension (Cloudinary adds it for format conversion).
      const publicId = resourceType === 'raw' 
        ? `${sanitizedName}_${Date.now()}${fileExtension}`
        : `${sanitizedName}_${Date.now()}`;

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { 
            folder, 
            resource_type: resourceType,
            access_mode: 'public',
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

  deleteFile: async (publicId: string, resourceType: string = 'image') => {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (error) {
      console.error('Cloudinary Delete Error:', error);
      throw error;
    }
  },

  getSignedUrl: (publicId: string, resourceType: string = 'image') => {
    if (!publicId) return null;
    try {
      // Generate a signed URL that expires in 1 hour
      return cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true,
        sign_url: true,
        type: 'upload',
        // Optional: specify expiration if needed via transformations, 
        // but simple signing is usually enough for authorization.
      });
    } catch (error) {
      console.error('[Cloudinary]: Error generating signed URL:', error);
      return null;
    }
  }
};

export default cloudinaryService;
