import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get academic report for a student
router.get('/:userId/report', authenticateToken, async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure student can only see their own report unless Admin/Teacher
    if (req.user.role === 'STUDENT' && req.user.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const user = await (prisma.user.findUnique as any)({
      where: { id: userId },
      include: {
        studentCourses: {
          include: {
            assignments: {
              include: {
                submissions: {
                  where: { studentId: userId },
                  include: { grade: true }
                }
              }
            },
            classes: {
              include: {
                attendance: {
                  where: { userId }
                }
              }
            }
          }
        },
        department: true
      }
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    // Calculate stats per course
    const report = (user as any).studentCourses.map((course: any) => {
      const grades = course.assignments
        .flatMap((a: any) => a.submissions.map((s: any) => s.grade?.score))
        .filter((score: any) => score !== undefined) as number[];
      
      const avgGrade = grades.length > 0 ? grades.reduce((a, b) => a + b, 0) / grades.length : null;
      
      const totalClasses = course.classes.length;
      const presentCount = course.classes.filter((c: any) => c.attendance.some((a: any) => a.status === 'PRESENT')).length;
      const attendancePct = totalClasses > 0 ? (presentCount / totalClasses) * 100 : 100;

      return {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        averageGrade: avgGrade,
        attendancePercentage: attendancePct,
      };
    });

    res.json({
      student: {
        name: user.name,
        rollNumber: user.rollNumber,
        department: (user as any).department?.name,
        year: user.year,
        shift: user.shift
      },
      courses: report
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
});

export default router;
