import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const c = await prisma.course.findFirst({ 
    where: { code: 'PHL-316' },
    include: {
      materials: true,
      assignments: true,
      quizzes: true
    }
  });
  if(!c) { console.log('Course not found'); return; }
  console.log('Course:', c.name, c.id);
  console.log('Materials:', c.materials.map(m =>({title: m.title, status: m.status})));
  console.log('Assignments:', c.assignments.map(a =>({title: a.title, count: 1})));
  console.log('Quizzes:', c.quizzes.map(q =>({title: q.title, status: q.status})));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
