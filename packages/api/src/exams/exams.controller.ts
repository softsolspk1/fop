import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get exam schedule (Authenticated)
router.get('/schedule', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const isStudent = req.user?.role === 'STUDENT';
    const whereClause: any = {};

    if (isStudent) {
      const student = await prisma.user.findUnique({
        where: { id: req.user?.userId },
        select: { year: true }
      });
      if (student?.year) {
        whereClause.course = { professional: student.year };
      }
    }

    const exams = await prisma.exam.findMany({
      where: whereClause,
      include: { course: true },
      orderBy: { date: 'asc' }
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam schedule', error });
  }
});

// Get my exam results (Student only)
router.get('/my-results', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const results = await prisma.examResult.findMany({
      where: { userId },
      include: { exam: { include: { course: true } } }
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course results', error });
  }
});

// Create an exam (Admin/Teacher only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'HOD', 'FACULTY'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, date, location, courseId } = req.body;
    const exam = await prisma.exam.create({
      data: {
        title,
        date: new Date(date),
        location,
        courseId
      }
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error creating exam', error });
  }
});

// Post exam result (Admin/Teacher only)
router.post('/results', authenticateToken, authorizeRoles('SUPER_ADMIN', 'HOD', 'FACULTY'), async (req: AuthRequest, res: Response) => {
  try {
    const { score, grade, userId, examId } = req.body;
    const result = await prisma.examResult.create({
      data: {
        score,
        grade,
        userId,
        examId
      }
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error posting result', error });
  }
});

// Delete result (Super Admin only)
router.delete('/results/:id', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.examResult.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting result', error });
  }
});

// Delete exam (Super Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.exam.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error });
  }
});

export default router;
