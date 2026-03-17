import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Post results (Teachers or Admins)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, courseId, marks, grade, semester, academicYear } = req.body;
    const teacherId = req.user!.id;

    const result = await prisma.result.create({
      data: {
        studentId,
        courseId,
        teacherId,
        marks: parseFloat(marks),
        grade,
        semester: parseInt(semester),
        academicYear
      }
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error posting result', error });
  }
});

// Get results for a student (Self, Teacher, HOD, Admin)
router.get('/student/:studentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // Authorization check: Student can only see their own results
    if (req.user!.role === 'STUDENT' && req.user!.id !== studentId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const results = await prisma.result.findMany({
      where: { studentId },
      include: {
        course: true,
        teacher: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error });
  }
});

// Get results for a course (Teacher, HOD, Admin)
router.get('/course/:courseId', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;

    const results = await prisma.result.findMany({
      where: { courseId },
      include: {
        student: { select: { name: true, rollNumber: true, email: true } },
        teacher: { select: { name: true } }
      }
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course results', error });
  }
});

export default router;
