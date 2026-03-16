import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all users (Super Admin only)
router.get('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// Get profile (Authenticated)
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      include: { department: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Omit password
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error });
  }
});

// Update user (Super Admin or Self)
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.userId !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { name, email },
    });

    res.json({ message: 'User updated', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

export default router;
