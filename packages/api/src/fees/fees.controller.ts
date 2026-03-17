import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get fees for a user
router.get('/my-fees', authenticateToken, async (req: any, res) => {
  try {
    const fees = await prisma.fee.findMany({
      where: { userId: req.user.userId },
      orderBy: { dueDate: 'asc' }
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching fees', error });
  }
});

// Get all fees (Admin only)
router.get('/all', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req, res) => {
  try {
    const fees = await prisma.fee.findMany({
      include: { user: { select: { name: true, rollNumber: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all fees', error });
  }
});

// Generate a fee (Admin only)
router.post('/generate', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req, res) => {
  try {
    const { title, amount, dueDate, userId } = req.body;
    const fee = await prisma.fee.create({
      data: {
        title,
        amount,
        dueDate: new Date(dueDate),
        status: 'UNPAID',
        userId
      }
    });
    res.status(201).json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error generating fee', error });
  }
});

// Update fee status (Admin only)
router.patch('/:id/status', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const fee = await prisma.fee.update({
      where: { id: String(id) },
      data: { status }
    });
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: 'Error updating fee status', error });
  }
});

export default router;
