import { Router } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { normalizeYear } from '../lib/utils';
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
      
      const year = normalizeYear(student?.year) || "First";

      const [
        totalCourses,
        totalLabs,
        totalExams,
        attendanceCount,
        submissionsCount,
        allAssignments,
        upcomingQuizzes,
        allResults
      ] = await Promise.all([
        prisma.course.count({ where: { professional: year, isActive: true } }),
        prisma.lab.count({ where: { year: year } }),
        prisma.exam.count({ where: { course: { professional: year } } }),
        prisma.attendance.count({ where: { userId: req.user.userId, status: 'PRESENT' } }),
        prisma.submission.count({ where: { studentId: req.user.userId } }),
        prisma.assignment.count({ where: { course: { professional: year } } }),
        prisma.quiz.count({ 
          where: { 
            course: { professional: year },
            endTime: { gt: new Date() },
            status: 'APPROVED'
          } 
        }),
        prisma.result.findMany({ where: { studentId: req.user.userId } })
      ]);

      const gradeToGPA: any = { 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D': 1.0, 'F': 0.0 };
      const gpa = allResults.length > 0 
        ? (allResults.reduce((acc, curr) => acc + (gradeToGPA[curr.grade.toUpperCase()] || 0), 0) / allResults.length).toFixed(2)
        : "0.0";

      return res.json({
        courses: totalCourses,
        labs: totalLabs,
        exams: totalExams,
        attendance: attendanceCount,
        assignments: allAssignments - submissionsCount, // Simplified pending
        upcomingQuizzes: upcomingQuizzes,
        gpa: gpa,
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
