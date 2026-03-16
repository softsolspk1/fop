import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Mark attendance for a class (Teacher/Admin)
router.post('/mark', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'), async (req, res) => {
  try {
    const { classId, records } = req.body; // records: { userId: string, status: 'PRESENT' | 'ABSENT' }[]

    const attendanceRecords = await Promise.all(
      records.map((record: any) =>
        prisma.attendance.create({
          data: {
            classId,
            userId: record.userId,
            status: record.status,
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
router.get('/class/:classId', authenticateToken, async (req, res) => {
  try {
    const { classId } = req.params;
    const records = await prisma.attendance.findMany({
      where: { classId },
      include: { user: { select: { id: true, name: true, email: true, rollNumber: true } } },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// Get attendance summary for a student in a course
router.get('/student/:courseId', authenticateToken, authorizeRoles('STUDENT'), async (req: any, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    const attendance = await prisma.attendance.findMany({
      where: {
        userId,
        class: { courseId },
      },
      include: { class: true },
    });

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
