import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Use /tmp for Vercel compatibility, otherwise fallback to local uploads/
const isVercel = process.env.VERCEL === '1';
const uploadDir = isVercel ? '/tmp' : path.join(process.cwd(), 'uploads');

if (!isVercel && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

console.log(`[Storage]: Using ${uploadDir} as upload directory`);

const storage = multer.memoryStorage();

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});
