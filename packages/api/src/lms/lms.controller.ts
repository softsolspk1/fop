import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { upload } from '../middleware/storage.middleware';
import cloudinaryService from '../services/cloudinary.service';
import fs from 'fs';
import path from 'path';
import { parseAsPKT } from '../lib/utils';

const router = Router();

// 1. Get Materials for a Course
router.get('/courses/:courseId/materials', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userRole = req.user?.role;

    let whereClause: any = { courseId };

    // Students only see APPROVED materials
    if (userRole === 'STUDENT') {
      whereClause.status = 'APPROVED';
    }

    whereClause.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } }
    ];

    const materials = await prisma.material.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: { name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Sign URLs for private Cloudinary assets
    const signedMaterials = materials.map(mat => {
      if (mat.publicId) {
        // Simple heuristic: if it's not a video/youtube, try raw first if it's a doc
        const isVideo = mat.url?.includes('/video/') || mat.type === 'VIDEO';
        const resourceType = isVideo ? 'video' : (mat.type === 'DOCUMENT' || mat.url?.includes('/raw/') ? 'raw' : 'image');
        
        const signedUrl = cloudinaryService.getSignedUrl(mat.publicId, resourceType);
        if (signedUrl) {
          return { ...mat, url: signedUrl };
        }
      }
      return mat;
    });

    res.json(signedMaterials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials', error });
  }
});

// 2. Upload Material (Teacher or Admin)
router.post('/materials', authenticateToken, authorizeRoles('FACULTY', 'SUPER_ADMIN', 'HOD'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  const filePath = req.file?.path;
  try {
    console.log('[LMS]: Incoming upload request:', { 
      body: req.body, 
      hasFile: !!req.file, 
      fileName: req.file?.originalname,
      userId: req.user?.userId 
    });

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (ext === '.exe' || ext === '.bat') {
        return res.status(400).json({ message: 'File type NOT allowed (.exe or .bat)' });
      }
    }

    let { title, url, type, courseId, expiresAt, isDownloadable, isScheduled, scheduledAt } = req.body;
    const userId = req.user?.userId;
    let publicId = null;

    if (!courseId) {
      console.error('[LMS]: Missing courseId in request body');
      return res.status(400).json({ message: 'courseId is required' });
    }

    // YouTube Link Detection
    const isYoutube = url && (String(url).includes('youtube.com') || String(url).includes('youtu.be'));
    if (isYoutube) {
      console.log('[LMS]: YouTube link detected:', url);
      type = 'YOUTUBE';
    }

    // Google Drive Link Detection for VIDEO type
    if (type === 'VIDEO' || type === 'SCHEDULED_LECTURE') {
      if (!url) {
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({ message: 'Google Drive Link is required for videos and scheduled lectures' });
      }
      if (req.file) {
        console.warn(`[LMS]: File uploaded for ${type} type, but will be ignored for Google Drive Link.`);
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    // If a file is uploaded, use Cloudinary
    if (req.file) {
      console.log(`[LMS]: Uploading file to Cloudinary for course ${courseId}`);
      try {
        const cloudinaryResponse = await (cloudinaryService.uploadFile as any)(
          req.file,
          `courses/${courseId}/materials`
        );
        url = cloudinaryResponse.url;
        publicId = cloudinaryResponse.publicId;
        title = title || req.file.originalname;
        // If it's a file, we override the type based on the file unless it was already set (e.g. from frontend)
        if (!type || type === 'YOUTUBE') {
          type = 'DOCUMENT'; // Default for files if not specified
        }
      } catch (uploadError) {
        console.error('[LMS]: Cloudinary Upload Failed:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload file to Cloudinary', 
          error: uploadError instanceof Error ? uploadError.message : 'Upload failed' 
        });
      }
    }

    if (!url) {
      return res.status(400).json({ message: 'URL or File is required' });
    }

    const material = await prisma.material.create({
      data: {
        title,
        url,
        publicId,
        type: type || 'LECTURE_NOTE',
        courseId,
        uploadedById: userId,
        status: 'APPROVED',
        expiresAt: expiresAt ? parseAsPKT(expiresAt) : null,
        isDownloadable: isDownloadable === 'true' || isDownloadable === true,
        isScheduled: isScheduled === 'true' || isScheduled === true,
        scheduledAt: scheduledAt ? parseAsPKT(scheduledAt) : null
      }
    });

    res.status(201).json(material);
  } catch (error: any) {
    console.error('[LMS]: Upload Error for course', req.params.id || req.body.courseId, ':', error);
    res.status(500).json({ 
      message: 'Error uploading material', 
      error: error.message || 'Unknown error',
      details: error,
      stack: error.stack
    });
  }
});

// 3. Get Pending Materials (HOD or Super Admin)
router.get('/pending', authenticateToken, authorizeRoles('HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    
    let whereClause: any = { status: 'PENDING' };
    
    // HOD only sees materials for their department
    if (req.user?.role === 'HOD' && user?.departmentId) {
      whereClause.course = { departmentId: user.departmentId };
    }

    const pending = await prisma.material.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true, code: true } },
        uploadedBy: { select: { name: true } }
      }
    });

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending materials', error });
  }
});

// 4. Approve/Reject Material (HOD or Super Admin)
router.put('/materials/:id/status', authenticateToken, authorizeRoles('HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const material = await prisma.material.update({
      where: { id: String(id) },
      data: { status }
    });

    res.json({ message: `Material ${status.toLowerCase()} successfully`, material });
  } catch (error) {
    res.status(500).json({ message: 'Error updating material status', error });
  }
});

// 5. Delete Material
router.delete('/materials/:id', authenticateToken, authorizeRoles('FACULTY', 'HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // 1. Find the material to get the publicId
    const material = await prisma.material.findUnique({
      where: { id: String(id) }
    });

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    // 2. Delete from Cloudinary if exists
    if (material.publicId) {
      try {
        await cloudinaryService.deleteFile(material.publicId);
      } catch (err) {
        console.error('[LMS]: Error deleting material file from Cloudinary:', err);
      }
    }

    // 3. Delete from Database
    await prisma.material.delete({ where: { id: String(id) } });
    
    res.status(204).send();
  } catch (error) {
    console.error('[LMS]: Error deleting material:', error);
    res.status(500).json({ message: 'Error deleting material', error });
  }
});

export default router;
