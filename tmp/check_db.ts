import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const deptCount = await prisma.department.count();
  const courseCount = await prisma.course.count();
  const classCount = await prisma.class.count();
  const userCount = await prisma.user.count();
  
  console.log('--- DATABASE STATUS ---');
  console.log('Departments:', deptCount);
  console.log('Courses:', courseCount);
  console.log('Classes:', classCount);
  console.log('Total Users:', userCount);
  
  if (courseCount > 0) {
    const courseStats = await prisma.course.groupBy({
      by: ['semesterName', 'professional'],
      _count: true
    });
    console.log('Course Distribution:', JSON.stringify(courseStats, null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
