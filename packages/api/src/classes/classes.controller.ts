import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { generateAgoraToken } from './agora.service';
import { transcribeAudio } from './ai-transcription.service';

const router = Router();

// Get all classes with course details
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const isStudent = req.user?.role === 'STUDENT';
    const userId = req.user?.userId;

    const whereClause: any = {};
    if (isStudent) {
      // Get student's department
      const student = await prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true }
      });

      // Show classes for courses the student is explicitly enrolled in OR courses in their department
      const enrolledCourses = await prisma.course.findMany({
        where: {
          OR: [
            { students: { some: { id: userId } } },
            { departmentId: student?.departmentId || undefined }
          ]
        },
        select: { id: true }
      });
      const enrolledCourseIds = enrolledCourses.map(c => c.id);
      whereClause.courseId = { in: enrolledCourseIds };
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            teacher: { select: { name: true } }
          }
        }
      }
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error });
  }
});

// Create a new class session
router.post('/', authenticateToken, authorizeRoles('TEACHER', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, startTime, endTime, courseId, dayOfWeek, location, classType, isRecurring, recurrentMonths } = req.body;
    const agoraChannel = `class-${courseId}-${Date.now()}`;

    const newClass = await prisma.class.create({
      data: {
        title,
        dayOfWeek: dayOfWeek || 'Monday',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || 'Lecture Hall 1',
        courseId,
        agoraChannel,
        classType: classType || 'Physical',
        isRecurring: !!isRecurring,
        recurrentMonths: recurrentMonths || []
      }
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error });
  }
});

// START Session (Teacher)
router.put('/:id/start', authenticateToken, authorizeRoles('TEACHER', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const session = await prisma.class.update({
      where: { id: String(id) },
      data: { actualStartTime: new Date() }
    });
    res.json({ message: 'Session started successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Error starting session', error });
  }
});

// STOP Session (Teacher)
router.put('/:id/stop', authenticateToken, authorizeRoles('TEACHER', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const session = await prisma.class.update({
      where: { id: String(id) },
      data: { actualEndTime: new Date() }
    });
    res.json({ message: 'Session stopped successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Error stopping session', error });
  }
});


// Join a class session (Get Agora Token)
router.get('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const classSession = await prisma.class.findUnique({ where: { id: String(id) } });

    if (!classSession || !classSession.agoraChannel) {
      return res.status(404).json({ message: 'Class session not found or channel not initialized' });
    }

    // Generate a random UID for the user (or use their DB ID if numeric)
    const uid = Math.floor(Math.random() * 1000000);
    const token = generateAgoraToken(classSession.agoraChannel, uid);

    res.json({
      token,
      channel: classSession.agoraChannel,
      uid,
      appId: process.env.AGORA_APP_ID
    });
  } catch (error) {
    res.status(500).json({ message: 'Error joining class', error });
  }
});

// Save a recording and trigger AI transcription
router.post('/:id/recordings', authenticateToken, authorizeRoles('TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { url } = req.body;

    const recording = await prisma.recording.create({
      data: {
        classId: String(id),
        url,
      }
    });

    // Trigger AI transcription in the background (mocked)
    transcribeAudio(recording.id);

    res.status(201).json(recording);
  } catch (error) {
    res.status(500).json({ message: 'Error saving recording', error });
  }
});

// Mark START attendance (Check-In)
router.post('/mark-start', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.body;
    const userId = req.user!.userId;

    const attendance = await prisma.attendance.upsert({
      where: { userId_classId: { userId, classId: String(classId) } },
      update: { markedStartAt: new Date(), status: 'LATE' }, // Initially late if checking in after start, logic can be refined
      create: { 
        userId, 
        classId: String(classId), 
        markedStartAt: new Date(),
        status: 'PRESENT'
      }
    });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error marking start attendance', error });
  }
});

// Mark END attendance (Check-Out)
router.post('/mark-end', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.body;
    const userId = req.user!.userId;

    const attendance = await prisma.attendance.update({
      where: { userId_classId: { userId, classId: String(classId) } },
      data: { 
        markedEndAt: new Date(),
        status: 'PRESENT' 
      }
    });

    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error marking end attendance', error });
  }
});

// Delete a class session
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id: String(id) } });
    res.json({ message: 'Class session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class session', error });
  }
});

export default router;
