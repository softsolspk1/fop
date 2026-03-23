import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all quizzes for a course
router.get('/course/:courseId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const quizzes = await prisma.quiz.findMany({
      where: { courseId: String(courseId) },
      include: { 
        _count: { select: { questions: true } }
      }
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
});

// Create a new quiz or exam (Teacher/Admin)
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, timeLimit, courseId, questions, isExam } = req.body;
    
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit,
        courseId,
        isExam: !!isExam,
        status: 'PENDING', // Always starts as PENDING for approval
        questions: {
          create: questions // Expecting array of { text, options, answer }
        }
      },
      include: { questions: true }
    });
    
    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error creating quiz', error });
  }
});

// Get Pending Quizzes/Exams (HOD or Super Admin)
router.get('/pending', authenticateToken, authorizeRoles('DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const userBuffer = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    
    let whereClause: any = { status: 'PENDING' };
    
    if (req.user?.role === 'DEPT_ADMIN' && userBuffer?.departmentId) {
      whereClause.course = { departmentId: userBuffer.departmentId };
    }

    const pending = await prisma.quiz.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true, code: true } }
      }
    });

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending quizzes', error });
  }
});

// Approve/Reject Quiz (HOD or Super Admin)
router.put('/:id/status', authenticateToken, authorizeRoles('DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quiz = await prisma.quiz.update({
      where: { id: String(id) },
      data: { status }
    });

    res.json({ message: `Quiz ${status.toLowerCase()} successfully`, quiz });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz status', error });
  }
});


// Submit quiz results (Student)
router.post('/:id/submit', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    const result = await prisma.quizResult.create({
      data: {
        score,
        userId,
        quizId: String(id)
      }
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error });
  }
});

export default router;
