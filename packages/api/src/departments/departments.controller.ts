import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get all departments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true, courses: true }
        }
      }
    });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
});

// Create department (Super Admin only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;
    const department = await prisma.department.create({
      data: { name }
    });
    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error creating department', error });
  }
});

// Update department (Super Admin only for now)
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, hodId } = req.body;
    const department = await prisma.department.update({
      where: { id: String(id) },
      data: { name, hodId }
    });
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error updating department', error });
  }
});

export default router;
