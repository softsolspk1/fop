const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteCourseCascade(courseId) {
  // ChatGroups
  await prisma.message.deleteMany({ where: { group: { courseId } } });
  await prisma.chatGroup.deleteMany({ where: { courseId } });

  // Materials
  await prisma.material.deleteMany({ where: { courseId } });

  // Results
  await prisma.result.deleteMany({ where: { courseId } });

  // Labs
  const labs = await prisma.lab.findMany({ where: { courseId }, select: { id: true } });
  for (const lab of labs) {
    await prisma.assessmentResult.deleteMany({ where: { assessment: { labId: lab.id } } });
    await prisma.assessment.deleteMany({ where: { labId: lab.id } });
    await prisma.observation.deleteMany({ where: { experiment: { labId: lab.id } } });
    await prisma.experiment.deleteMany({ where: { labId: lab.id } });
  }
  await prisma.lab.deleteMany({ where: { courseId } });

  // Quizzes
  const quizzes = await prisma.quiz.findMany({ where: { courseId }, select: { id: true } });
  for (const q of quizzes) {
    await prisma.quizResult.deleteMany({ where: { quizId: q.id } });
    await prisma.question.deleteMany({ where: { quizId: q.id } });
  }
  await prisma.quiz.deleteMany({ where: { courseId } });

  // Assignments
  const assignments = await prisma.assignment.findMany({ where: { courseId }, select: { id: true } });
  for (const a of assignments) {
     const submissions = await prisma.submission.findMany({ where: { assignmentId: a.id }, select: { id: true } });
     for (const sub of submissions) {
         await prisma.grade.deleteMany({ where: { submissionId: sub.id } });
     }
     await prisma.submission.deleteMany({ where: { assignmentId: a.id } });
  }
  await prisma.assignment.deleteMany({ where: { courseId } });

  // Exams
  const exams = await prisma.exam.findMany({ where: { courseId }, select: { id: true } });
  for (const e of exams) {
      await prisma.examResult.deleteMany({ where: { examId: e.id } });
  }
  await prisma.exam.deleteMany({ where: { courseId } });

  // Classes
  const classes = await prisma.class.findMany({ where: { courseId }, select: { id: true } });
  for (const c of classes) {
      await prisma.attendance.deleteMany({ where: { classId: c.id } });
      await prisma.recording.deleteMany({ where: { classId: c.id } });
  }
  await prisma.class.deleteMany({ where: { courseId } });

  // Finally delete course
  await prisma.course.delete({ where: { id: courseId } });
}

async function main() {
  const targetProfs = ["Second", "Third", "Fourth", "Fifth"];
  
  const coursesToRemove = await prisma.course.findMany({
    where: { professional: { in: targetProfs } },
    select: { id: true, code: true, name: true, professional: true }
  });

  console.log(`Found ${coursesToRemove.length} Old Courses to delete...`);
  
  for (const c of coursesToRemove) {
    console.log(`Deleting [${c.code}] ${c.name} (${c.professional} Prof)`);
    try {
      await deleteCourseCascade(c.id);
      console.log(` -> Deleted Successfully.`);
    } catch (e) {
      console.error(` -> Failed to delete ${c.code}:`, e.message);
    }
  }

  console.log('\n--- Wipe Complete. ---');
  console.log('Courses successfully purged from Second to Fifth Professional.');
}

main().catch(console.error);
