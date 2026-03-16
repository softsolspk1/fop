import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all semesters
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { courses: true } } }
    });
    res.json(semesters);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching semesters', error });
  }
});

// Create semester (Super Admin only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, startDate, endDate } = req.body;
    const semester = await prisma.semester.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate) }
    });
    res.status(201).json(semester);
  } catch (error) {
    res.status(500).json({ message: 'Error creating semester', error });
  }
});

export default router;
