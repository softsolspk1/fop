import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// 1. Get Materials for a Course
router.get('/courses/:courseId/materials', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userRole = req.user?.role;

    let whereClause: any = { courseId };

    // Students only see APPROVED materials
    if (userRole === 'STUDENT') {
      whereClause.status = 'APPROVED';
    }

    const materials = await prisma.material.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: { name: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching materials', error });
  }
});

// 2. Upload Material (Teacher or Admin)
router.post('/materials', authenticateToken, authorizeRoles('TEACHER', 'SUPER_ADMIN', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, url, type, courseId } = req.body;
    const userId = req.user?.userId;

    const material = await prisma.material.create({
      data: {
        title,
        url,
        type,
        courseId,
        uploadedById: userId,
        status: 'PENDING' // Always starts as PENDING for approval
      }
    });

    res.status(201).json(material);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading material', error });
  }
});

// 3. Get Pending Materials (HOD or Super Admin)
router.get('/pending', authenticateToken, authorizeRoles('DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user?.userId } });
    
    let whereClause: any = { status: 'PENDING' };
    
    // HOD only sees materials for their department
    if (req.user?.role === 'DEPT_ADMIN' && user?.departmentId) {
      whereClause.course = { departmentId: user.departmentId };
    }

    const pending = await prisma.material.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true, code: true } },
        uploadedBy: { select: { name: true } }
      }
    });

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending materials', error });
  }
});

// 4. Approve/Reject Material (HOD or Super Admin)
router.put('/materials/:id/status', authenticateToken, authorizeRoles('DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const material = await prisma.material.update({
      where: { id },
      data: { status }
    });

    res.json({ message: `Material ${status.toLowerCase()} successfully`, material });
  } catch (error) {
    res.status(500).json({ message: 'Error updating material status', error });
  }
});

// 5. Delete Material
router.delete('/materials/:id', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN', 'SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.material.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting material', error });
  }
});

export default router;
