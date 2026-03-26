import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const asgns = await prisma.assignment.findMany({
    where: {
      OR: [
        { title: { contains: 'Anatomy', mode: 'insensitive' } },
        { title: { contains: 'Histology', mode: 'insensitive' } },
        { title: { contains: 'Lab', mode: 'insensitive' } }
      ]
    },
    include: { course: true }
  });

  console.log('--- MATCHING ASSIGNMENTS ---');
  asgns.forEach(a => {
    console.log(`Title: ${a.title}, Course: ${a.course.code} (${a.course.name}), ID: ${a.id}`);
  });

  const mats = await prisma.material.findMany({
    where: {
      OR: [
        { title: { contains: 'Anatomy', mode: 'insensitive' } },
        { title: { contains: 'Histology', mode: 'insensitive' } }
      ]
    },
    include: { course: true }
  });
  console.log('--- MATCHING MATERIALS ---');
  mats.forEach(m => {
    console.log(`Title: ${m.title}, Course: ${m.course.code}, ID: ${m.id}, Status: ${m.status}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
