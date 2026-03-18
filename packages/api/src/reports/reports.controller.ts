import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get academic report/transcript for a student
router.get('/:userId', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.params.userId as string;
    
    // Check if the requester is the student or an admin/teacher
    if (req.user.userId !== userId && !['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized to view this report' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        department: true,
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
            quizzes: {
              include: {
                results: {
                  where: { userId: userId }
                }
              }
            }
          }
        },
        attendances: {
          include: {
            class: {
              include: { course: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Process reporting data
    const courseReports = user.studentCourses.map(course => {
      // Calculate Grade Average
      const submissions = course.assignments.flatMap(a => a.submissions);
      const grades = submissions.filter(s => s.grade).map(s => s.grade!.score);
      const avgGrade = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length) : null;

      // Calculate Quiz Average
      const quizResults = course.quizzes.flatMap(q => q.results);
      const quizScores = quizResults.map(r => r.score);
      const avgQuiz = quizScores.length > 0 ? (quizScores.reduce((a, b) => a + b, 0) / quizScores.length) : null;

      // Calculate Attendance for this course
      const courseAttendance = user.attendances.filter(a => a.class.courseId === course.id);
      const presentCount = courseAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendancePercentage = courseAttendance.length > 0 ? (presentCount / courseAttendance.length) * 100 : null;

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        averageGrade: avgGrade,
        averageQuiz: avgQuiz,
        attendancePercentage,
        totalClasses: courseAttendance.length,
        submissionsCount: submissions.length,
      };
    });

    res.json({
      student: {
        id: user.id,
        name: user.name,
        rollNumber: user.rollNumber,
        department: user.department?.name,
      },
      courses: courseReports,
      overallGPA: calculateGPA(courseReports) // Helper logic
    });

  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error });
  }
});

function calculateGPA(courses: any[]) {
    // Mock GPA calculation based on grade averages
    const validGrades = courses.map(c => c.averageGrade).filter(g => g !== null);
    if (validGrades.length === 0) return 0;
    return (validGrades.reduce((a, b) => a + b, 0) / validGrades.length / 25).toFixed(2); // Assuming score is out of 100
}

export default router;
