import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', 'api', '.env') });

const prisma = new PrismaClient();

const hodNames = [
  "Prof. Dr. Syed Muhammad Farid Hasan",
  "Prof. Dr. Asia Naz Awan",
  "Dr. Muhammad Mohtasheem ul Hasan",
  "Dr. Azra Riaz",
  "Prof. Dr. Iyad Naeem Muhammad",
  "Dr.Muhammad Mohtasheem ul Hasan" // variant
];

async function main() {
  const users = await prisma.user.findMany({
    where: {
      OR: hodNames.map(name => ({ name: { contains: name.split(' ').pop() } }))
    },
    select: { id: true, name: true, role: true }
  });
  console.log('TARGET USERS:');
  console.log(JSON.stringify(users, null, 2));

  const depts = await prisma.department.findMany({
    select: { id: true, name: true }
  });
  console.log('DEPTS:');
  console.log(JSON.stringify(depts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
