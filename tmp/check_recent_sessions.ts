import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.class.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      course: {
        select: {
          name: true,
          professional: true,
          departmentId: true
        }
      }
    }
  });
  console.log('Recent Sessions:', JSON.stringify(sessions, null, 2));
  
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: { id: true, name: true, year: true, departmentId: true },
    take: 10
  });
  console.log('Students Sample Data:', JSON.stringify(students, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
