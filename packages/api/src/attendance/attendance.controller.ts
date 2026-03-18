import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Mark attendance for a class (Teacher/Admin)
router.post('/mark', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
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

// Student marks their own attendance when joining a live class
router.post('/self-mark', authenticateToken, authorizeRoles('STUDENT'), async (req: AuthRequest, res: Response) => {
  try {
    const { classId } = req.body;
    const userId = req.user!.userId;

    // Check if attendance already exists
    const existing = await prisma.attendance.findFirst({
      where: { classId, userId }
    });

    if (existing) {
      return res.status(200).json({ message: 'Attendance already marked', record: existing });
    }

    const record = await prisma.attendance.create({
      data: {
        classId,
        userId,
        status: 'PRESENT',
        remarks: 'Marked via Live Class Join'
      }
    });

    res.status(201).json({ message: 'Attendance marked successfully', record });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
