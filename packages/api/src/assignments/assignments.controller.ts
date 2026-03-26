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
    console.log('[Assignments]: Incoming upload request:', { 
      body: req.body, 
      hasFile: !!req.file, 
      fileName: req.file?.originalname,
      userId: req.user?.userId 
    });
    let fileUrl = null;
    let publicId = null;

    if (req.file) {
      console.log(`[Assignments]: Uploading file to Cloudinary for course ${courseId}. File: ${req.file.originalname}, Size: ${req.file.size}`);
      try {
        const cloudinaryRes = await (cloudinaryService.uploadFile as any)(req.file, `courses/${courseId}/assignments`);
        console.log(`[Assignments]: Cloudinary Upload Success: ${cloudinaryRes.url}`);
        fileUrl = cloudinaryRes.url;
        publicId = cloudinaryRes.publicId;
      } catch (uploadError) {
        console.error('[Assignments]: Cloudinary Upload Failed:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload assignment file to Cloudinary', 
          error: uploadError instanceof Error ? uploadError.message : 'Upload failed' 
        });
      }
    }

    const assignment = await prisma.assignment.create({
      data: {
        title: title || 'New Assignment',
        description: description || '',
        startTime: startTime ? new Date(startTime) : new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
        totalMarks: parseFloat(totalMarks) || 100,
        fileUrl,
        publicId,
        courseId,
      }
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error(`[Assignments]: Error creating assignment for course ${req.body.courseId}:`, error);
    res.status(500).json({ 
      message: 'Error creating assignment', 
      error: error.message || 'Unknown error',
      details: error,
      stack: error.stack
    });
  }
});
// Submit an assignment (Student)
router.post('/:assignmentId/submit', authenticateToken, authorizeRoles('STUDENT'), upload.single('file'), async (req: any, res) => {
  const filePath = req.file?.path;
  try {
    const { assignmentId } = req.params;
    const userId = req.user.userId;

    console.log('[Assignments]: Incoming submission request:', { 
      params: req.params,
      hasFile: !!req.file, 
      fileName: req.file?.originalname,
      userId
    });

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const cloudinaryRes = await (cloudinaryService.uploadFile as any)(
      req.file,
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
    console.error('[Assignments]: Submission Error:', error);
    res.status(500).json({ message: 'Internal server error during submission', error: error instanceof Error ? error.message : 'Unknown' });
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
