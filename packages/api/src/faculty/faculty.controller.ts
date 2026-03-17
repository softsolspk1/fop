import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get all faculty members
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const faculty = await prisma.facultyMember.findMany();
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching faculty members', error });
  }
});

// Create faculty member (Super Admin or Dept Admin only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, designation, department } = req.body;
    const facultyMember = await prisma.facultyMember.create({
      data: { name, designation, department }
    });
    res.status(201).json(facultyMember);
  } catch (error) {
    res.status(500).json({ message: 'Error creating faculty member', error });
  }
});

// Update faculty member
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, designation, department } = req.body;
    const facultyMember = await prisma.facultyMember.update({
      where: { id: String(id) },
      data: { name, designation, department }
    });
    res.json(facultyMember);
  } catch (error) {
    res.status(500).json({ message: 'Error updating faculty member', error });
  }
});

// Delete faculty member
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.facultyMember.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting faculty member', error });
  }
});

export default router;
