import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      role: true,
      status: true
    }
  });
  console.log('Current Database Users:');
  console.table(users);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
