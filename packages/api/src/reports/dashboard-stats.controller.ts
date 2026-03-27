import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { authenticateToken } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get overall dashboard statistics
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    // Only admins/teachers should probably see full stats, but users might see some.
    // Let's keep it open for now or restrict to ADMINs.
    // if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'HOD') {
    //   return res.status(403).json({ message: 'Forbidden' });
    // }

    const isStudent = req.user?.role === 'STUDENT';

    if (isStudent) {
      const student = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { year: true }
      });
      
      const year = student?.year || "First";

      const [
        totalCourses,
        totalLabs,
        totalExams,
        attendanceCount,
        assignmentsCount
      ] = await Promise.all([
        prisma.course.count({ where: { professional: year, isActive: true } }),
        prisma.lab.count({ where: { year: year } }),
        prisma.exam.count({ where: { course: { professional: year } } }),
        prisma.attendance.count({ where: { userId: req.user.userId, status: 'PRESENT' } }),
        prisma.submission.count({ where: { studentId: req.user.userId } })
      ]);

      return res.json({
        courses: totalCourses,
        labs: totalLabs,
        exams: totalExams,
        attendance: attendanceCount,
        assignments: assignmentsCount,
        professionalYear: year,
        lastUpdated: new Date()
      });
    }

    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalDepartments,
      totalLabs,
      pendingEnrollments
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' as any } }),
      prisma.user.count({ where: { role: 'FACULTY' as any } }),
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
