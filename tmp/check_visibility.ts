import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- SESSION VISIBILITY DEBUG ---');
  
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    take: 5,
    select: { id: true, name: true, departmentId: true, year: true }
  });
  console.log('Sample Students:', JSON.stringify(students, null, 2));

  const courses = await prisma.course.findMany({
    take: 5,
    select: { id: true, name: true, departmentId: true, professional: true }
  });
  console.log('Sample Courses:', JSON.stringify(courses, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
