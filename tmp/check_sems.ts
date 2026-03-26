import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({ select: { semesterName: true } });
  const sems = Array.from(new Set(courses.map(c => c.semesterName)));
  console.log('Unique Semesters:', sems);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
