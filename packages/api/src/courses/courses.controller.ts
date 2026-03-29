import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { upload } from '../middleware/storage.middleware';
import { normalizeYear } from '../lib/utils';
import cloudinaryService from '../services/cloudinary.service';
import fs from 'fs';
import { sendNotification } from '../lib/notifications';

const router = Router();

// Get all materials across all courses (for Live Sessions page)
router.get('/materials', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;
    const where: any = {};
    if (type) where.type = String(type);
    
    // Students only see materials for their courses or global scheduled sessions
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { studentCourses: { select: { id: true } } }
      });
      const studentCourseIds = student?.studentCourses.map(c => c.id) || [];
      where.OR = [
        { courseId: { in: studentCourseIds } },
        { type: 'SCHEDULED_LECTURE' }
      ];
    }

    const materials = await prisma.material.findMany({
      where,
      include: { 
        course: { 
          include: { 
            teacher: { select: { name: true, designation: true } } 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials', error });
  }
});

// Get materials uploaded by current user (Teacher/Admin)
router.get('/materials/my', authenticateToken, authorizeRoles('FACULTY', 'HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const materials = await prisma.material.findMany({
      where: { uploadedById: req.user?.userId },
      include: { course: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials', error });
  }
});

// Update all courses visibility by semester (Admin only)
router.put('/visibility/bulk', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { semesterName, isActive } = req.body;
    if (!semesterName) return res.status(400).json({ message: 'semesterName is required' });

    await prisma.course.updateMany({
      where: { semesterName: String(semesterName) },
      data: { isActive: Boolean(isActive) }
    });

    res.json({ message: `Courses for ${semesterName} visibility set to ${isActive}` });
  } catch (error: any) {
    console.error('Bulk Visibility Error:', error);
    res.status(500).json({ 
      message: 'Error updating bulk visibility', 
      error: error.message,
      details: error,
      stack: error.stack
    });
  }
});

// Get all courses (Authenticated) - Supporting Filters
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId, semesterName } = req.query;
    const isStudent = req.user?.role === 'STUDENT';

    const whereClause: any = {};
    if (departmentId) whereClause.departmentId = String(departmentId);
    if (semesterName) whereClause.semesterName = String(semesterName);
    
    // Students only see active courses for their professional year
    if (isStudent) {
      whereClause.isActive = true;
      const student = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: { year: true }
      });
      if (student?.year) {
        whereClause.professional = normalizeYear(student.year);
      }
    }

    // HOD only sees courses for their department
    if (req.user?.role === 'HOD') {
      const hod = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { departmentId: true }
      });
      if (hod?.departmentId) {
        whereClause.departmentId = hod.departmentId;
      }
    }

    // Faculty only sees courses they teach
    if (req.user?.role === 'FACULTY') {
      whereClause.teacherId = req.user.userId;
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        department: true,
        teacher: {
          select: { name: true, email: true }
        },
        _count: {
          select: { students: true }
        }
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error });
  }
});

// Create course (Super Admin or Dept Admin only)
router.post('/', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN', 'HOD'), async (req: AuthRequest, res: Response) => {
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
        assignments: {
          include: req.user?.role === 'STUDENT' ? {
            submissions: {
              where: { studentId: req.user.userId },
              include: { grade: true }
            }
          } : {
            _count: { select: { submissions: true } }
          }
        },
        quizzes: {
          include: req.user?.role === 'STUDENT' ? {
            results: {
              where: { userId: req.user.userId }
            }
          } : {
            _count: { select: { results: true } }
          }
        },
        classes: true,
        labs: true,
        teacher: {
          select: { name: true, designation: true }
        },
        department: {
          select: { name: true }
        }
      }
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error: any) {
    console.error(`[Courses]: Error fetching course details for ID ${req.params.id}:`, error);
    res.status(500).json({ 
      message: 'Error fetching course details', 
      error: error.message || 'Unknown error',
      details: error, // FOR DEBUGGING
      stack: error.stack
    });
  }
});

// Get students for a specific course
router.get('/:id/students', authenticateToken, authorizeRoles('FACULTY', 'HOD', 'SUPER_ADMIN', 'MAIN_ADMIN'), async (req: AuthRequest, res: Response) => {
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
router.post('/:id/materials', authenticateToken, authorizeRoles('FACULTY', 'HOD'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  const filePath = req.file?.path;
  try {
    const { id: courseId } = req.params;
    const { title, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const cloudinaryResponse = await (cloudinaryService.uploadFile as any)(
      req.file,
      `courses/${courseId}/materials`
    );
    const material = await prisma.material.create({
      data: {
        title: title || req.file.originalname,
        url: cloudinaryResponse.url,
        publicId: cloudinaryResponse.publicId,
        type: type || 'LECTURE_NOTE',
        courseId: String(courseId),
        uploadedById: req.user?.userId
      },
    });
    res.status(201).json(material);
    
    // Trigger notification
    const course = await prisma.course.findUnique({ where: { id: String(courseId) }, select: { name: true } });
    await sendNotification({
      title: `New Material: ${material.title}`,
      content: `A new ${type || 'resource'} has been added to your course: ${course?.name}`,
      courseId: String(courseId),
      senderId: req.user?.userId || ''
    });
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(500).json({ message: 'Error uploading material', error });
  }
});

// Update course
router.put('/:id', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN', 'HOD'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, departmentId, teacherId, semesterId, isActive, professional, semesterName, creditHours, category } = req.body;
    const course = await prisma.course.update({
      where: { id: String(id) },
      data: { name, code, departmentId, teacherId, semesterId, isActive, professional, semesterName, creditHours, category }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error });
  }
});

// Delete course
router.delete('/:id', authenticateToken, authorizeRoles('MAIN_ADMIN'), async (req: AuthRequest, res: Response) => {
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
