import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get stats for HOD's department
router.get('/my-stats', authenticateToken, authorizeRoles('HOD', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const department = await prisma.department.findFirst({
      where: { hodId: userId },
      include: {
        _count: {
          select: { users: true, courses: true }
        }
      }
    });

    if (!department) return res.status(404).json({ message: 'Department not found for this HOD' });

    // Faculty members are users with role TEACHER in this dept
    const facultyCount = await prisma.user.count({
      where: { departmentId: department.id, role: 'TEACHER' }
    });

    res.json({
      departmentName: department.name,
      studentCount: department._count.users - facultyCount,
      facultyCount,
      courseCount: department._count.courses
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departmental stats', error });
  }
});

// Get all departments
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        hod: true,
        _count: {
          select: { users: true, courses: true }
        }
      }
    });
    console.log(`[Departments]: Fetched ${departments.length} departments for user ${req.user?.userId}`);
    res.json(departments);
  } catch (error: any) {
    console.error('[Departments]: Error fetching departments:', error);
    res.status(500).json({ 
      message: 'Error fetching departments', 
      error: error.message,
      details: error,
      stack: error.stack
    });
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

// Delete department (Super Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
});

export default router;
