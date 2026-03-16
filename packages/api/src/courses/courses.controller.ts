import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

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
        classes: true
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

export default router;
