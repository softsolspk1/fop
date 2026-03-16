import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../auth/auth.middleware';
import { checkPlagiarism } from './plagiarism.service';

const router = Router();
const prisma = new PrismaClient();

// Create a new assignment (Teacher)
router.post('/', authenticateToken, authorizeRoles('TEACHER'), async (req: any, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        courseId,
      },
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// List assignments for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      include: { submissions: { select: { id: true, status: true, studentId: true } } },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Submit an assignment (Student)
router.post('/:assignmentId/submit', authenticateToken, authorizeRoles('STUDENT'), async (req: any, res) => {
  try {
    const { assignmentId } = req.params;
    const { fileUrl } = req.body;
    const userId = req.user.userId;

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: userId,
        fileUrl,
        status: 'SUBMITTED',
      },
    });

    // Trigger plagiarism check in the background (mocked)
    checkPlagiarism(submission.id);

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Grade a submission (Teacher)
router.post('/submissions/:submissionId/grade', authenticateToken, authorizeRoles('TEACHER'), async (req: any, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    const teacherId = req.user.userId;

    const grade = await prisma.grade.create({
      data: {
        score,
        feedback,
        submissionId,
        teacherId,
      },
    });

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'GRADED' },
    });

    res.status(201).json(grade);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get submissions for an assignment (Teacher)
router.get('/:assignmentId/submissions', authenticateToken, authorizeRoles('TEACHER'), async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      include: { student: { select: { name: true, rollNumber: true } }, grade: true },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
