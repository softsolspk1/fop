import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const departments = [
    { name: 'Department of Pharmaceutical Chemistry' },
    { name: 'Department of Pharmaceutics' },
    { name: 'Department of Pharmacognosy' },
    { name: 'Department of Pharmacology' },
    { name: 'Department of Pharmacy Practice' },
  ];

  console.log('Seeding official departments...');

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: {
        name: dept.name,
      },
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
