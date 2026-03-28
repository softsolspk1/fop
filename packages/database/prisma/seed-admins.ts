import { PrismaClient, Role, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Softsols@123', 10);
  
  console.log('--- Provisioning Official Administrative Accounts ---');

  const adminAccounts = [
    {
      email: 'vc@uok.edu.pk',
      name: 'Vice Chancellor',
      role: Role.MAIN_ADMIN,
    },
    {
      email: 'sysadmin@uok.edu.pk',
      name: 'System Administrator',
      role: Role.MAIN_ADMIN,
    },
    {
      email: 'dean@uok.edu.pk',
      name: 'Dean Faculty of Pharmacy',
      role: Role.MAIN_ADMIN,
    },
    {
      email: 'hod.pharma@uok.edu.pk',
      name: 'HOD Pharmacology',
      role: Role.HOD,
    }
  ];

  for (const acc of adminAccounts) {
    await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        role: acc.role,
        status: EnrollmentStatus.APPROVED
      },
      create: {
        ...acc,
        password: hashedPassword,
        status: EnrollmentStatus.APPROVED
      }
    });
    console.log(`✓ Provisioned: ${acc.email} (${acc.role})`);
  }

  console.log('--- Administrative Provisioning Completed ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
