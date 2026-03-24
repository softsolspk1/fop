import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Shuffle utility
function shuffleArray(array: any[]) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get all quizzes for a course (with shuffle for students)
router.get('/course/:courseId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    const quizzes = await prisma.quiz.findMany({
      where: { courseId: String(courseId) },
      include: { 
        questions: userRole === 'STUDENT', // Only send questions to students
        _count: { select: { questions: true } },
        results: { where: { userId: userId } } // Check if user already attempted
      }
    });

    // If student, shuffle questions and their options
    if (userRole === 'STUDENT') {
      const processedQuizzes = quizzes.map(quiz => {
        // If already attempted, don't send questions
        if (quiz.results.length > 0) {
          return { ...quiz, questions: [], attempted: true };
        }

        const shuffledQuestions = shuffleArray(quiz.questions).map(q => ({
          ...q,
          options: shuffleArray(q.options),
          answer: undefined // Hide answer from students
        }));
        return { ...quiz, questions: shuffledQuestions, attempted: false };
      });
      return res.json(processedQuizzes);
    }

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes', error });
  }
});

// Create a new quiz or exam (Teacher/Admin)
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, timeLimit, courseId, questions, isExam, startTime, endTime, totalMarks, passingPercentage } = req.body;
    
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit: parseInt(timeLimit),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalMarks: parseFloat(totalMarks),
        passingPercentage: parseFloat(passingPercentage) || 40,
        courseId,
        isExam: !!isExam,
        status: 'PENDING',
        questions: {
          create: questions.map((q: any) => ({
            text: q.text,
            options: q.options,
            answer: q.answer,
            points: parseFloat(q.points) || 1
          }))
        }
      },
      include: { questions: true }
    });
    
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Quiz creation error:', error);
    res.status(500).json({ message: 'Error creating quiz', error });
  }
});

// Submit quiz results (Student)
router.post('/:id/submit', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { score } = req.body; // Score calculated on frontend for now, or could be verified here
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Enforce single attempt
    const existingResult = await prisma.quizResult.findFirst({
      where: { quizId: id, userId }
    });

    if (existingResult) {
      return res.status(400).json({ message: 'You have already attempted this quiz' });
    }

    const quiz = await prisma.quiz.findUnique({ where: { id } });
    const passed = quiz ? (score / quiz.totalMarks) * 100 >= quiz.passingPercentage : false;

    const result = await prisma.quizResult.create({
      data: {
        score,
        passed,
        userId,
        quizId: String(id)
      }
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error });
  }
});

// Get Pending Quizzes/Exams, Approve/Reject (Keeping previous logic)
router.get('/pending', authenticateToken, authorizeRoles('DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const userBuffer = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    let whereClause: any = { status: 'PENDING' };
    if (req.user?.role === 'DEPT_ADMIN' && userBuffer?.departmentId) {
      whereClause.course = { departmentId: userBuffer.departmentId };
    }
    const pending = await prisma.quiz.findMany({
      where: whereClause,
      include: { course: { select: { name: true, code: true } } }
    });
    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending quizzes', error });
  }
});

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

export default router;
