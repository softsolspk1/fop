import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get overall dashboard statistics
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    // Only admins/teachers should probably see full stats, but users might see some.
    // Let's keep it open for now or restrict to ADMINs.
    // if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'DEPT_ADMIN') {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalDepartments,
      totalLabs,
      pendingEnrollments
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.course.count(),
      prisma.department.count(),
      prisma.lab.count(),
      prisma.user.count({ where: { status: 'PENDING' } })
    ]);

    res.json({
      students: totalStudents,
      faculty: totalFaculty,
      courses: totalCourses,
      departments: totalDepartments,
      labs: totalLabs,
      pendingEnrollments: pendingEnrollments,
      lastUpdated: new Date()
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
