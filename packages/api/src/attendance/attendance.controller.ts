import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Mark attendance for a class (Teacher/Admin)
router.post('/mark', authenticateToken, authorizeRoles('FACULTY', 'HOD', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { classId, records } = req.body; // records: { userId: string, status: 'PRESENT' | 'ABSENT' | 'LATE', remarks: string }[]

    const attendanceRecords = await Promise.all(
      records.map((record: any) =>
        prisma.attendance.create({
          data: {
            classId,
            userId: record.userId,
            status: record.status,
            remarks: record.remarks,
          },
        })
      )
    );

    res.status(201).json({ message: 'Attendance marked', count: attendanceRecords.length });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get attendance for a specific class
router.get('/class/:classId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const records = await prisma.attendance.findMany({
      where: { classId: String(classId) },
      include: { user: { select: { id: true, name: true, email: true, rollNumber: true } } },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get attendance summary for a student in a course
router.get('/student/:courseId', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        class: {
          courseId: String(courseId)
        },
      },
      include: { class: true },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Student marks START attendance
router.post('/mark-start', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.body;
    const userId = req.user!.userId;

    const session = await prisma.class.findUnique({ where: { id: classId } });
    if (!session || !session.actualStartTime) {
      return res.status(400).json({ message: 'Session has not started yet' });
    }

    const now = new Date();
    const diffMins = (now.getTime() - session.actualStartTime.getTime()) / (1000 * 60);

    if (diffMins > 15) {
      return res.status(403).json({ message: 'Attendance window (Start) has closed (15 mins passed)' });
    }

    const existing = await prisma.attendance.findFirst({ where: { classId, userId } });

    if (existing) {
      if (existing.markedStartAt) {
        return res.status(200).json({ message: 'Start attendance already marked', record: existing });
      }
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { markedStartAt: now }
      });
    } else {
      await prisma.attendance.create({
        data: {
          classId,
          userId,
          markedStartAt: now,
          status: 'ABSENT' // Defaults to ABSENT until both are marked
        }
      });
    }

    res.status(201).json({ message: 'Start attendance marked' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Student marks END attendance
router.post('/mark-end', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.body;
    const userId = req.user!.userId;

    const session = await prisma.class.findUnique({ where: { id: classId } });
    if (!session || !session.actualEndTime) {
      return res.status(400).json({ message: 'Session has not ended yet' });
    }

    const now = new Date();
    const diffMins = (now.getTime() - session.actualEndTime.getTime()) / (1000 * 60);

    if (diffMins > 5) {
      return res.status(403).json({ message: 'Attendance window (End) has closed (5 mins passed)' });
    }

    const record = await prisma.attendance.findFirst({ where: { classId, userId } });
    if (!record || !record.markedStartAt) {
      return res.status(403).json({ message: 'You did not mark attendance at the start' });
    }

    await prisma.attendance.update({
      where: { id: record.id },
      data: { 
        markedEndAt: now,
        status: 'PRESENT' // Now both marked
      }
    });

    res.json({ message: 'End attendance marked. You are marked PRESENT.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Simple self-mark for mobile live sessions
router.post('/self-mark', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.body;
    const userId = req.user!.userId;

    const existing = await prisma.attendance.findFirst({
      where: { classId, userId }
    });

    if (existing) {
      if (existing.status === 'PRESENT') {
        return res.status(200).json({ message: 'Attendance already marked as PRESENT', record: existing });
      }
      await prisma.attendance.update({
        where: { id: existing.id },
        data: { status: 'PRESENT', markedStartAt: new Date() }
      });
    } else {
      await prisma.attendance.create({
        data: {
          classId,
          userId,
          status: 'PRESENT',
          markedStartAt: new Date()
        }
      });
    }

    res.status(201).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get Cumulative Attendance (YTD)
router.get('/cumulative', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { studentId, courseId, departmentId, professional } = req.query;
    
    let whereClause: any = {};
    if (studentId) whereClause.userId = String(studentId);
    
    if (courseId || departmentId || professional) {
      whereClause.class = {
        course: {}
      };
      if (courseId) whereClause.class.course.id = String(courseId);
      if (departmentId) whereClause.class.course.departmentId = String(departmentId);
      if (professional) whereClause.class.course.professional = String(professional);
    }

    const attendance = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, rollNumber: true } },
        class: { include: { course: true } }
      }
    });

    // Grouping logic for YTD
    const stats = attendance.reduce((acc: any, curr) => {
      const key = curr.userId;
      if (!acc[key]) {
        acc[key] = { 
          name: curr.user.name, 
          rollNumber: curr.user.rollNumber,
          total: 0, 
          present: 0,
          percentage: 0 
        };
      }
      acc[key].total += 1;
      if (curr.status === 'PRESENT') acc[key].present += 1;
      acc[key].percentage = (acc[key].present / acc[key].total) * 100;
      return acc;
    }, {});

    res.json(Object.values(stats));
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});


export default router;
