import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { checkPlagiarism } from './plagiarism.service';
import { upload } from '../middleware/storage.middleware';
import googleDriveService from '../services/googleDrive.service';
import fs from 'fs';

const router = Router();

// Get all assignments with course details
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await prisma.assignment.findMany({
      include: {
        course: {
          select: { name: true }
        }
      }
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error });
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

    // Upload to Google Drive
    const driveFile = await googleDriveService.uploadFile(
      req.file.originalname,
      req.file.path,
      req.file.mimetype
    );

    // Make file public (optional, or restricted to anyone with link)
    await googleDriveService.makePublic(driveFile.id!);

    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: userId,
        fileUrl: driveFile.webViewLink!,
        status: 'SUBMITTED',
      },
    });

    // Cleanup local file
    fs.unlinkSync(filePath);

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
