import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { checkPlagiarism } from './plagiarism.service';
import { upload } from '../middleware/storage.middleware';
import cloudinaryService from '../services/cloudinary.service';
import fs from 'fs';

const router = Router();

// Get all assignments for a course
router.get('/course/:courseId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const assignments = await prisma.assignment.findMany({
      where: { courseId: String(courseId) },
      include: {
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error });
  }
});

// Create an assignment (Teacher)
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'), upload.single('file'), async (req: AuthRequest, res: Response) => {
  const filePath = req.file?.path;
  try {
    const { title, description, startTime, dueDate, totalMarks, courseId } = req.body;
    let fileUrl = null;
    let publicId = null;

    if (req.file) {
      const cloudinaryRes = await cloudinaryService.uploadFile(req.file.path, `courses/${courseId}/assignments`);
      fileUrl = cloudinaryRes.url;
      publicId = cloudinaryRes.publicId;
    }

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : new Date(),
        dueDate: new Date(dueDate),
        totalMarks: parseFloat(totalMarks) || 100,
        fileUrl,
        publicId,
        courseId,
      }
    });

    res.status(201).json(assignment);
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Error creating assignment', error });
  }
});
// Submit an assignment (Student)
router.post('/:assignmentId/submit', authenticateToken, authorizeRoles('STUDENT'), upload.single('file'), async (req: any, res) => {
  const filePath = req.file?.path;
  try {
    const { assignmentId } = req.params;
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const cloudinaryRes = await cloudinaryService.uploadFile(
      req.file.path,
      `assignments/${assignmentId}/submissions`
    );

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: userId,
        fileUrl: cloudinaryRes.url,
        publicId: cloudinaryRes.publicId,
        status: 'SUBMITTED',
      },
    });

    // Trigger plagiarism check in the background (mocked)
    checkPlagiarism(submission.id);

    res.status(201).json(submission);
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
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
      where: { assignmentId: String(assignmentId) },
      include: { student: { select: { name: true, rollNumber: true } }, grade: true },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
