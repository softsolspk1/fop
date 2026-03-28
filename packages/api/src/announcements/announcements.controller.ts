import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// 1. Create Announcement (Admin/Faculty/HOD)
router.post('/', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN', 'HOD', 'FACULTY'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, targetRole, targetYear, targetShift, departmentId, courseId } = req.body;
    const senderId = req.user?.userId;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        senderId: senderId!,
        targetRole: targetRole as Role || null,
        targetYear: targetYear || null,
        targetShift: targetShift || null,
        departmentId: departmentId || null,
        courseId: courseId || null,
      },
      include: {
        sender: { select: { name: true, role: true } }
      }
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('[Announcements:Create]:', error);
    res.status(500).json({ message: 'Error creating announcement', error });
  }
});

// 2. Get Announcements (Filtered for current user)
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Get user details for filtering
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { departmentId: true, year: true, shift: true }
    });

    // Filtering Logic:
    // 1. If no filters are set, it's a global announcement.
    // 2. If filters are set, they must match the user's properties.
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          // Public / No filter
          {
            AND: [
              { targetRole: null },
              { targetYear: null },
              { targetShift: null },
              { departmentId: null }
            ]
          },
          // Filtered by Role
          { targetRole: userRole as Role },
          // Filtered by Year (for students)
          { targetYear: user?.year },
          // Filtered by Shift (for students)
          { targetShift: user?.shift },
          // Filtered by Department
          { departmentId: user?.departmentId }
        ]
      },
      include: {
        sender: { select: { name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json(announcements);
  } catch (error) {
    console.error('[Announcements:Get]:', error);
    res.status(500).json({ message: 'Error fetching announcements', error });
  }
});

// 3. Delete Announcement (Sender or Admin)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    const announcement = await prisma.announcement.findUnique({ where: { id } });

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Only sender or Admin can delete
    if (announcement.senderId !== userId && !['MAIN_ADMIN', 'SUPER_ADMIN'].includes(userRole!)) {
      return res.status(403).json({ message: 'Unauthorized to delete this announcement' });
    }

    await prisma.announcement.delete({ where: { id } });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting announcement', error });
  }
});

export default router;
