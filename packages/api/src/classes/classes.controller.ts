import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { generateAgoraToken } from './agora.service';
import { transcribeAudio } from './ai-transcription.service';
import { normalizeYear } from '../lib/utils';
import { createWhiteboardRoom, generateRoomToken } from './whiteboard.service';

const router = Router();


// Get active (currently running) classes
router.get('/active', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const isStudent = req.user?.role === 'STUDENT';
    const userId = req.user?.userId;

    const whereClause: any = {
      actualStartTime: { not: null },
      actualEndTime: null
    };

    let student: any = null;
    let enrolledCourses: any[] = [];

    if (isStudent) {
      const student = await prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true, year: true }
      });

      const enrolledCourses = await prisma.course.findMany({
        where: {
          OR: [
            { students: { some: { id: userId } } },
            { 
              // Match by department IF student has one, otherwise skip this constraint
              departmentId: student?.departmentId || undefined,
              // Match by professional year mapping
              professional: normalizeYear(student?.year) || undefined
            },
            // Fallback: If student has NO department assigned, show all courses matching their year
            // to prevent complete invisibility during transition/testing
            ...(!student?.departmentId ? [{ professional: normalizeYear(student?.year) || undefined }] : [])
          ]
        },
        select: { id: true }
      });
      whereClause.courseId = { in: enrolledCourses.map(c => c.id) };
    }

    const classes = await prisma.class.findMany({
      where: whereClause,
      include: {
        course: {
          include: {
            teacher: { select: { name: true, designation: true } }
          }
        },
        _count: {
          select: { attendance: true }
        }
      }
    });

    if (isStudent) {
      console.log(`[Classes:Active]: Student ${userId} | Dept: ${student?.departmentId} | Year: ${student?.year}`);
      console.log(`[Classes:Active]: Enrolled Course IDs: ${enrolledCourses.map(c => (c as any).id).join(', ')}`);
      console.log(`[Classes:Active]: Found ${classes.length} active classes for student.`);
    }

    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active classes', error });
  }
});

// Get all classes with course details
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const isStudent = req.user?.role === 'STUDENT';
    const userId = req.user?.userId;

    const { courseId } = req.query;

    const whereClause: any = {};
    if (courseId) whereClause.courseId = String(courseId);

    if (isStudent) {
      // Get student details
      const student = await prisma.user.findUnique({
        where: { id: userId },
        select: { departmentId: true, year: true }
      });

      // Show classes for courses the student is explicitly enrolled in 
      // OR courses in their department AND matching their professional year
      const enrolledCourses = await prisma.course.findMany({
        where: {
          OR: [
            { students: { some: { id: userId } } },
            { 
              departmentId: student?.departmentId || undefined,
              professional: { in: [student?.year || '', normalizeYear(student?.year) || ''] }
            },
            ...(!student?.departmentId ? [{ professional: { in: [student?.year || '', normalizeYear(student?.year) || ''] } }] : [])
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
            teacher: { select: { name: true, designation: true } }
          }
        },
        _count: {
          select: { attendance: true }
        }
      }
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classes', error });
  }
});

// Create a new class session
router.post('/', authenticateToken, authorizeRoles('FACULTY', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
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
router.put('/:id/start', authenticateToken, authorizeRoles('FACULTY', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Create Whiteboard Room if not exists
    const classSession = await prisma.class.findUnique({ where: { id: String(id) } });
    let whiteboardUuid = classSession?.whiteboardUuid;

    if (!whiteboardUuid) {
      const room = await createWhiteboardRoom();
      if (room) whiteboardUuid = room.uuid;
    }

    const session = await prisma.class.update({
      where: { id: String(id) },
      data: { 
        actualStartTime: new Date(),
        whiteboardUuid
      }
    });
    res.json({ message: 'Session started successfully', session });
  } catch (error) {
    res.status(500).json({ message: 'Error starting session', error });
  }
});

// STOP Session (Teacher)
router.put('/:id/stop', authenticateToken, authorizeRoles('FACULTY', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
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

// DELETE Session (Teacher/Admin)
router.delete('/:id', authenticateToken, authorizeRoles('FACULTY', 'SUPER_ADMIN', 'MAIN_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    // First delete dependent records (SessionMessage, SessionPresence, SessionAsset)
    await (prisma as any).sessionMessage.deleteMany({ where: { classId: String(id) } });
    await (prisma as any).sessionPresence.deleteMany({ where: { classId: String(id) } });
    await (prisma as any).sessionAsset.deleteMany({ where: { classId: String(id) } });
    await prisma.attendance.deleteMany({ where: { classId: String(id) } });
    await prisma.recording.deleteMany({ where: { classId: String(id) } });

    await prisma.class.delete({
      where: { id: String(id) }
    });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete Class Error:', error);
    res.status(500).json({ message: 'Error deleting session', error });
  }
});


// Join a class session (Get Agora Token + Whiteboard details)
router.get('/:id/join', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const classSession = await prisma.class.findUnique({ where: { id: String(id) } });

    if (!classSession || !classSession.agoraChannel) {
      return res.status(404).json({ message: 'Class session not found or channel not initialized' });
    }

    // Generate a random UID for the user
    const uid = Math.floor(Math.random() * 1000000);
    const token = generateAgoraToken(classSession.agoraChannel, uid);

    res.json({
      token,
      channel: classSession.agoraChannel,
      uid,
      appId: process.env.AGORA_APP_ID,
      whiteboard: classSession.whiteboardUuid ? {
        uuid: classSession.whiteboardUuid,
        token: await generateRoomToken(classSession.whiteboardUuid),
        appId: process.env.NEXT_PUBLIC_AGORA_WHITEBOARD_APP_ID || '876dc55e0241436fb6c63433afeb9563' // Fallback to Agora Video App ID if distinct Whiteboard ID is missing (sometimes shared)
      } : null
    });
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ message: 'Error joining class', error });
  }
});

// 1. Heartbeat - Update user's last seen status
router.post('/:id/heartbeat', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: classId } = req.params;
    const { agoraUid } = req.body;
    const userId = (req.user as any)?.userId;
    if (!userId) return res.status(401).send();

    await (prisma as any).sessionPresence.upsert({
      where: { userId_classId: { userId, classId } },
      update: { lastSeen: new Date(), agoraUid: agoraUid ? Number(agoraUid) : undefined },
      create: { userId, classId, lastSeen: new Date(), agoraUid: agoraUid ? Number(agoraUid) : undefined }
    });

    // Auto-mark Attendance if student
    if (req.user?.role === 'STUDENT') {
      const session = await prisma.class.findUnique({ where: { id: String(classId) } });
      if (session && session.actualStartTime) {
        const arrivalTime = new Date();
        const diffMins = (arrivalTime.getTime() - session.actualStartTime.getTime()) / (1000 * 60);
        const status = diffMins <= 15 ? 'PRESENT' : 'LATE';

        await prisma.attendance.upsert({
          where: { userId_classId: { userId, classId: String(classId) } },
          update: {}, 
          create: {
            userId,
            classId: String(classId),
            status,
            markedStartAt: arrivalTime
          }
        });
      }
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Heartbeat failed' });
  }
});

// 2. Leave Session - Remove user's presence
router.post('/:id/leave', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: classId } = req.params;
    const userId = (req.user as any)?.userId;
    if (!userId) return res.status(401).send();

    await (prisma as any).sessionPresence.deleteMany({
      where: { userId, classId }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Leave failed' });
  }
});

// 3. Sync - Get all session state (participants, messages, assets)
router.get('/:id/sync', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: classId } = req.params;
    
    // Get active participants (heartbeat in last 60 seconds)
    const activeTime = new Date(Date.now() - 60000);
    const presences = await (prisma as any).sessionPresence.findMany({
      where: { classId },
      include: { 
        user: { 
          select: { 
            name: true, 
            role: true,
            attendances: {
              where: { classId },
              take: 1
            }
          } 
        } 
      }
    });

    const participants = presences.map((p: any) => ({
      uid: p.userId, 
      agoraUid: p.agoraUid,
      name: p.user.name,
      role: p.user.role,
      status: p.user.attendances?.[0]?.status || 'JOINING',
      joinTime: p.user.attendances?.[0]?.markedStartAt || p.createdAt
    }));

    // Get recent messages
    const messages = await (prisma as any).sessionMessage.findMany({
      where: { classId },
      orderBy: { createdAt: 'asc' },
      take: 50,
      include: { sender: { select: { name: true } } }
    });

    // Get shared assets
    const assets = await (prisma as any).sessionAsset.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { name: true } } }
    });

    res.json({
      participants,
      messages: messages.map((m: any) => ({
        id: m.id,
        sender: m.sender.name,
        text: m.content,
        time: m.createdAt, // Raw ISO string
        senderId: m.senderId
      })),
      assets: assets.map((a: any) => ({
        id: a.id,
        name: a.title,
        url: a.url,
        type: a.type,
        sender: a.sender.name,
        time: a.createdAt
      }))
    });
  } catch (error) {
    console.error('[Sync Error]:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// 3. Send Message
router.post('/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: classId } = req.params;
    const { content } = req.body;
    const userId = (req.user as any)?.userId;
    if (!userId) return res.status(401).send();

    const message = await (prisma as any).sessionMessage.create({
      data: { content, classId, senderId: userId }
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// 4. Share Asset (File/Video)
router.post('/:id/assets', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: classId } = req.params;
    const { title, url, type } = req.body;
    const userId = (req.user as any)?.userId;
    if (!userId) return res.status(401).send();

    const asset = await (prisma as any).sessionAsset.create({
      data: { title, url, type, classId, senderId: userId }
    });

    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to share asset' });
  }
});

// Get participants joined in a class (Backward compatibility/Original version)
router.get('/:id/participants', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const activeTime = new Date(Date.now() - 60000);
    const presences = await (prisma as any).sessionPresence.findMany({
      where: { classId: String(id), lastSeen: { gte: activeTime } },
      include: { user: { select: { name: true, role: true } } }
    });

    const participants = presences.map((p: any) => ({
      name: p.user.name,
      role: p.user.role,
      uid: p.userId
    }));

    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching participants', error });
  }
});

// Save a recording and trigger AI transcription
router.post('/:id/recordings', authenticateToken, authorizeRoles('FACULTY'), async (req: AuthRequest, res: Response) => {
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

    const existing = await prisma.attendance.findFirst({
      where: { userId, classId: String(classId) }
    });

    if (existing) {
      const attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: { markedStartAt: new Date(), status: 'LATE' },
      });
      return res.status(200).json(attendance);
    }

    const attendance = await prisma.attendance.create({
      data: { 
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

    const existing = await prisma.attendance.findFirst({
      where: { userId, classId: String(classId) }
    });

    if (!existing) return res.status(404).json({ message: 'Attendance record not found' });

    const attendance = await prisma.attendance.update({
      where: { id: existing.id },
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
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'FACULTY'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.class.delete({ where: { id: String(id) } });
    res.json({ message: 'Class session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting class session', error });
  }
});

export default router;
