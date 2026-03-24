import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get all users (Authenticated) - used for chat discovery and directory
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
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
    const { name, email, role, departmentId, rollNumber, shift, year, status } = req.body;

    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.userId !== id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Only SUPER_ADMIN can change roles or status
    const updateData: any = { name, email, departmentId, rollNumber, shift, year };
    if (req.user?.role === 'SUPER_ADMIN') {
      if (role) updateData.role = role;
      if (status) updateData.status = status;
    }

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: updateData,
    });

    res.json({ message: 'User updated', user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error });
  }
});

// Create user (Super Admin only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role, departmentId, shift, year, rollNumber } = req.body;
    
    // Hash password
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(password || '123456', 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'STUDENT',
        departmentId,
        shift,
        year,
        rollNumber
      }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
});

// Delete user (Super Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Change Password (Authenticated)
router.put('/change-password', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bcrypt = await import('bcryptjs');
    const isValid = await bcrypt.compare(oldPassword, user.password);
    
    if (!isValid) return res.status(400).json({ message: 'Invalid current password' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error });
  }
});

// Admin reset password (Super Admin only)
router.put('/:id/reset-password', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ message: 'New password is required' });

    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: String(id) },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
});

export default router;
