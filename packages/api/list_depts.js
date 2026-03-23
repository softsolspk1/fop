const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ 
    where: { role: 'SUPER_ADMIN' },
    take: 1
  });
  if (users.length > 0) {
    console.log(users[0].id);
  } else {
    const anyUser = await prisma.user.findFirst();
    console.log(anyUser?.id);
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
