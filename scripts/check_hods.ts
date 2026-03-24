import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany({
    select: { id: true, name: true, hodId: true }
  });
  console.log('Departments:', JSON.stringify(departments, null, 2));

  const namesToSearch = [
    "Prof. Dr. Syed Muhammad Farid Hasan",
    "Prof. Dr. Asia Naz Awan",
    "Dr.Muhammad Mohtasheem ul Hasan",
    "Dr. Azra Riaz",
    "Prof. Dr. Iyad Naeem Muhammad"
  ];

  const users = await prisma.user.findMany({
    where: {
      name: { in: namesToSearch, mode: 'insensitive' }
    },
    select: { id: true, name: true, email: true }
  });
  console.log('Found Users:', JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
