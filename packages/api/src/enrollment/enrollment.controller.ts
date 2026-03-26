import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all pending enrollments (Admin only)
router.get('/pending', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN', 'HOD'), async (req: any, res) => {
  try {
    const pendingStudents = await prisma.user.findMany({
      where: { 
        role: 'STUDENT',
        status: 'PENDING'
      },
      include: {
        department: true
      }
    });
    res.json(pendingStudents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending enrollments', error });
  }
});

// Approve enrollment
router.post('/:id/approve', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN', 'HOD'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'APPROVED' }
    });
    res.json({ message: 'Enrollment approved', user });
  } catch (error) {
    res.status(500).json({ message: 'Error approving enrollment', error });
  }
});

// Reject enrollment
router.post('/:id/reject', authenticateToken, authorizeRoles('MAIN_ADMIN', 'SUPER_ADMIN', 'HOD'), async (req: any, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' }
    });
    res.json({ message: 'Enrollment rejected', user });
  } catch (error) {
    res.status(500).json({ message: 'Error rejecting enrollment', error });
  }
});

export default router;
