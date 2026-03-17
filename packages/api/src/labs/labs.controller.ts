import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get all labs
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const labs = await prisma.lab.findMany();
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching labs', error });
  }
});

// Create lab (Super Admin only)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, department, provider, difficulty, url } = req.body;
    const lab = await prisma.lab.create({
      data: { title, description, department, provider, difficulty, url }
    });
    res.status(201).json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lab', error });
  }
});

// Update lab
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, department, provider, difficulty, url } = req.body;
    const lab = await prisma.lab.update({
      where: { id: String(id) },
      data: { title, description, department, provider, difficulty, url }
    });
    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lab', error });
  }
});

// Delete lab
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.lab.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lab', error });
  }
});

export default router;
