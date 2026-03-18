import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { generateAgoraToken } from './agora.service';
import { transcribeAudio } from './ai-transcription.service';

const router = Router();

// Get all classes with course details
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
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
    const { title, startTime, endTime, courseId, dayOfWeek, location } = req.body;
    const agoraChannel = `class-${courseId}-${Date.now()}`;

    const newClass = await prisma.class.create({
      data: {
        title,
        dayOfWeek: dayOfWeek || 'Monday',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: location || 'Lecture Hall 1',
        courseId,
        agoraChannel
      }
    });

    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ message: 'Error creating class', error });
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

// Mark attendance for a class
router.post('/:id/attendance', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if attendance already marked
    const existing = await prisma.attendance.findFirst({
      where: { classId: String(id), userId }
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const attendance = await prisma.attendance.create({
      data: {
        classId: String(id),
        userId,
        status: 'PRESENT'
      }
    });

    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error marking attendance', error });
  }
});

export default router;
