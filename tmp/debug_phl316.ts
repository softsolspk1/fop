import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({ 
    where: { code: 'PHL-316' },
    include: {
      materials: true,
      assignments: true,
      quizzes: true
    }
  });

  console.log('--- COURSES FOUND with code PHL-316 ---');
  courses.forEach(c => {
    console.log(`ID: ${c.id}, Name: ${c.name}, Prof: ${c.professional}, Active: ${c.isActive}`);
    console.log(`  Materials: ${c.materials.length}`);
    c.materials.forEach(m => console.log(`    - ${m.title} (${m.status})`));
    console.log(`  Assignments: ${c.assignments.length}`);
    c.assignments.forEach(a => console.log(`    - ${a.title}`));
    console.log(`  Quizzes: ${c.quizzes.length}`);
    c.quizzes.forEach(q => console.log(`    - ${q.title} (${q.status})`));
  });

  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    take: 5,
    select: { id: true, name: true, year: true, departmentId: true }
  });
  console.log('--- SAMPLE STUDENTS ---');
  students.forEach(s => console.log(JSON.stringify(s)));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
