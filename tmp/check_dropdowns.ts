import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- DROPDOWN DATA DEBUG ---');
  
  const depts = await prisma.department.findMany({
    select: { id: true, name: true }
  });
  console.log('Departments:', depts.length, depts.slice(0, 3));

  const courses = await prisma.course.findMany({
    select: { id: true, name: true }
  });
  console.log('Courses:', courses.length, courses.slice(0, 3));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
