import { PrismaClient, Role, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  console.log('--- Starting University Database Seeding ---');

  // 1. Seed Departments if not exist
  const depts = [
    { name: 'Department of Pharmaceutical Chemistry' },
    { name: 'Department of Pharmaceutics' },
    { name: 'Department of Pharmacognosy' },
    { name: 'Department of Pharmacology' },
    { name: 'Department of Pharmacy Practice' },
  ];

  for (const d of depts) {
    await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d
    });
  }
  
  const pharmaDept = await prisma.department.findFirst({ where: { name: 'Department of Pharmacology' } });

  // 2. Seed Essential Users
  const users = [
    {
      email: 'admin@uok.edu.pk',
      name: 'System Administrator',
      role: Role.SUPER_ADMIN,
      status: EnrollmentStatus.APPROVED
    },
    {
      email: 'teacher@uok.edu.pk',
      name: 'Senior Professor',
      role: Role.TEACHER,
      status: EnrollmentStatus.APPROVED
    },
    {
      email: 'student@uok.edu.pk',
      name: 'Test Student',
      role: Role.STUDENT,
      status: EnrollmentStatus.APPROVED
    }
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        status: EnrollmentStatus.APPROVED
      },
      create: {
        ...u,
        password: hashedPassword,
        departmentId: pharmaDept?.id
      }
    });
    console.log(`✓ Seeded account: ${u.email} (${u.role})`);
  }

  console.log('--- Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
