import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { upload } from '../middleware/storage.middleware';
import googleDriveService from '../services/googleDrive.service';
import fs from 'fs';

const router = Router();

// Get all courses (Authenticated)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        department: true,
        teacher: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
});

// Create course (Super Admin or Dept Admin only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, departmentId, teacherId } = req.body;
    const course = await prisma.course.create({
      data: { name, code, departmentId, teacherId }
    });

    // Automatically create a ChatGroup for this course
    await prisma.chatGroup.create({
      data: {
        name: `${code} - ${name} Group`,
        description: `Official chat group for ${name}`,
        courseId: course.id,
        members: {
          connect: [{ id: teacherId }]
        }
      }
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error });
  }
});

// Get specific course with details
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: String(id) },
      include: {
        materials: true,
        assignments: true,
        classes: true,
        labs: true
      }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course details', error });
  }
});

// Get students for a specific course
router.get('/:id/students', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: String(id) },
      include: {
        students: {
          select: { id: true, name: true, email: true, rollNumber: true, shift: true }
        }
      }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course.students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error });
  }
});

// Upload material for a course (Teacher)
router.post('/:id/materials', authenticateToken, authorizeRoles('TEACHER'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  const filePath = req.file?.path;
  try {
    const { id: courseId } = req.params;
    const { title, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Google Drive
    const driveFile = await googleDriveService.uploadFile(
      title || req.file.originalname,
      req.file.path,
      req.file.mimetype
    );

    // Make file public
    await googleDriveService.makePublic(driveFile.id!);

    const material = await prisma.material.create({
      data: {
        title: title || req.file.originalname,
        url: driveFile.webViewLink!,
        type: type || 'LECTURE_NOTE',
        courseId: String(courseId),
      },
    });

    // Cleanup local file
    if (filePath) {
      fs.unlinkSync(filePath);
    }

    res.status(201).json(material);
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: 'Error uploading material', error });
  }
});

// Update course
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, departmentId, teacherId, semesterId } = req.body;
    const course = await prisma.course.update({
      where: { id: String(id) },
      data: { name, code, departmentId, teacherId, semesterId }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error });
  }
});

// Delete course
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error });
  }
});

export default router;
