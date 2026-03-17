import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get exam schedule (Authenticated)
router.get('/schedule', authenticateToken, async (req: any, res) => {
  try {
    const exams = await prisma.exam.findMany({
      include: { course: true },
      orderBy: { date: 'asc' }
    });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam schedule', error });
  }
});

// Get my exam results (Student only)
router.get('/my-results', authenticateToken, authorizeRoles('STUDENT'), async (req: any, res) => {
  try {
    const results = await prisma.examResult.findMany({
      where: { userId: req.user.userId },
      include: { exam: { include: { course: true } } }
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching results', error });
  }
});

// Create an exam (Admin/Teacher only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'), async (req, res) => {
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
router.post('/results', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'), async (req, res) => {
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

export default router;
