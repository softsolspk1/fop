import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { parseAsPKT } from '../lib/utils';
import { sendNotification } from '../lib/notifications';

const router = Router();

// Get quizzes created by current user
router.get('/my', authenticateToken, authorizeRoles('FACULTY', 'HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      where: { course: { teacherId: req.user?.userId } },
      include: { course: { select: { name: true, code: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error });
  }
});

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
router.post('/', authenticateToken, authorizeRoles('FACULTY', 'HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, timeLimit, courseId, questions, startTime, endTime, totalMarks, passingPercentage, isExam } = req.body;
    
    console.log(`[Quizzes]: Incoming create request for "${title}"`, {
      courseId,
      questionCount: questions?.length,
      body: req.body,
      userId: req.user?.userId
    });
    
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: 'Questions array is required' });
    }

    const quiz = await prisma.quiz.create({
      data: {
        title: title || 'Untitled Quiz',
        description: description || '',
        timeLimit: parseInt(timeLimit) || 30,
        startTime: parseAsPKT(startTime),
        endTime: parseAsPKT(endTime),
        totalMarks: parseFloat(totalMarks) || questions.length,
        passingPercentage: parseFloat(passingPercentage) || 40,
        courseId,
        status: 'APPROVED',
        isExam: Boolean(isExam || false),
        questions: {
          create: questions.map((q: any) => ({
            text: q.text || 'Question Text',
            options: Array.isArray(q.options) ? q.options : [],
            answer: q.answer || '',
          }))
        }
      },
      include: { questions: true }
    });
    
    res.status(201).json(quiz);

    // Trigger notification
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { name: true } });
    await sendNotification({
      title: `${isExam ? 'Exam' : 'Quiz'}: ${quiz.title}`,
      content: `A new assessment has been posted for ${course?.name}. Start: ${quiz.startTime?.toLocaleString()}`,
      courseId: String(courseId),
      senderId: req.user?.userId || ''
    });
  } catch (error: any) {
    console.error(`[Quizzes]: Error creating quiz for course ${req.body.courseId}:`, error);
    res.status(500).json({ 
      message: 'Error creating quiz', 
      error: error.message || 'Unknown error',
      details: error,
      stack: error.stack
    });
  }
});

// Get a single quiz for attempt
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const quiz = await prisma.quiz.findUnique({
      where: { id: String(id) },
      include: {
        questions: userRole === 'STUDENT',
        results: { where: { userId: userId } }
      }
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    if (userRole === 'STUDENT') {
      if (quiz.results.length > 0) {
        return res.json({ alreadyAttempted: true });
      }

      const shuffledQuestions = shuffleArray(quiz.questions).map(q => ({
        ...q,
        options: shuffleArray(q.options),
        answer: undefined // Hide answer
      }));

      return res.json({ ...quiz, questions: shuffledQuestions, attempted: false });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz', error });
  }
});

// Submit quiz results (Student)
router.post('/:id/submit', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; 
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: 'User not authenticated' });

    // Enforce single attempt
    const existingResult = await prisma.quizResult.findFirst({
      where: { quizId: String(id), userId: String(userId) }
    });

    if (existingResult) {
      return res.status(400).json({ message: 'You have already attempted this quiz' });
    }

    const quiz = await prisma.quiz.findUnique({ 
      where: { id: String(id) },
      include: { questions: true } 
    });

    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    if (answers && typeof answers === 'object') {
       quiz.questions.forEach((q) => {
          if (answers[q.id] === q.answer) {
             score += (quiz.totalMarks / quiz.questions.length);
          }
       });
    }

    const passed = (score / quiz.totalMarks) * 100 >= quiz.passingPercentage;

    const result = await prisma.quizResult.create({
      data: {
        score,
        passed,
        userId: String(userId),
        quizId: String(id)
      }
    });

    res.status(201).json({ ...result, totalQuestions: quiz.questions.length, percentage: ((score / quiz.totalMarks) * 100).toFixed(2) });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting quiz', error });
  }
});

// Get Pending Quizzes/Exams, Approve/Reject (Keeping previous logic)
router.get('/pending', authenticateToken, authorizeRoles('HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const userBuffer = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    let whereClause: any = { status: 'PENDING' };
    if (req.user?.role === 'HOD' && userBuffer?.departmentId) {
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

router.put('/:id/status', authenticateToken, authorizeRoles('HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const quiz = await prisma.quiz.update({
      where: { id: String(id) },
      data: { status }
    });
    if (status === 'APPROVED') {
       const fullQuiz = await prisma.quiz.findUnique({ where: { id: String(id) }, include: { course: true } });
       await sendNotification({
         title: `Approved: ${fullQuiz?.title}`,
         content: `The ${fullQuiz?.isExam ? 'exam' : 'quiz'} for ${fullQuiz?.course?.name} is now active.`,
         courseId: fullQuiz?.courseId || '',
         senderId: req.user?.userId || ''
       });
    }

    res.json({ message: `Quiz ${status.toLowerCase()} successfully`, quiz });
  } catch (error) {
    res.status(500).json({ message: 'Error updating quiz status', error });
  }
});

// Delete a quiz
router.delete('/:id', authenticateToken, authorizeRoles('FACULTY', 'HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Delete associated results and questions first (since no cascade in schema)
    await prisma.$transaction([
      prisma.quizResult.deleteMany({ where: { quizId: String(id) } }),
      prisma.question.deleteMany({ where: { quizId: String(id) } }),
      prisma.quiz.delete({ where: { id: String(id) } })
    ]);

    res.status(204).send();
  } catch (error: any) {
    console.error('[Quizzes]: Error deleting quiz:', error);
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
});

export default router;
