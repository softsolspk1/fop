import { PrismaClient, Role, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  console.log('--- Starting University Database Seeding ---');

  // 1. Seed Departments
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
  const chemDept = await prisma.department.findFirst({ where: { name: 'Department of Pharmaceutical Chemistry' } });
  const ceuticsDept = await prisma.department.findFirst({ where: { name: 'Department of Pharmaceutics' } });
  const cognosyDept = await prisma.department.findFirst({ where: { name: 'Department of Pharmacognosy' } });

  // 2. Seed Admin User
  await prisma.user.upsert({
    where: { email: 'admin@uok.edu.pk' },
    update: { password: hashedPassword },
    create: {
      email: 'admin@uok.edu.pk',
      name: 'System Administrator',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      status: EnrollmentStatus.APPROVED,
      departmentId: pharmaDept?.id
    }
  });

  // 3. Seed Faculty Members
  const faculty = [
    { name: 'Dr. Sarah Ahmed', designation: 'Professor', department: 'Pharmacology' },
    { name: 'Dr. John Doe', designation: 'Associate Professor', department: 'Pharmaceutics' },
    { name: 'Dr. Jane Smith', designation: 'Assistant Professor', department: 'Pharmaceutical Chemistry' },
  ];

  for (const f of faculty) {
    await prisma.facultyMember.create({ data: f });
  }

  // 4. Seed Labs
  const labs = [
    { 
      title: 'Pharmacokinetic Modeling', 
      description: 'Simulate drug absorption and elimination processes.',
      department: 'Pharmacology', 
      provider: 'PharmaSimuleX',
      difficulty: 'Intermediate'
    },
    { 
      title: 'Titration Analysis', 
      description: 'Perform precise acid-base titrations.',
      department: 'Pharmaceutical Chemistry', 
      provider: 'PraxiLabs',
      difficulty: 'Beginner'
    }
  ];

  for (const l of labs) {
    await prisma.lab.create({ data: l });
  }

  // 5. Seed Real Courses (from PDF)
  const teacher = await prisma.user.findFirst({ where: { role: Role.SUPER_ADMIN } });
  if (!teacher) return;

  const courses = [
    { name: 'Pharmaceutics - Fundamental of Pharmacy', code: 'PHT-301', departmentId: ceuticsDept!.id },
    { name: 'Pharmaceutical Chemistry - Organic', code: 'PHC-303', departmentId: chemDept!.id },
    { name: 'Pharmacology - Islamic learning/Pak Studies', code: 'PHL-305', departmentId: pharmaDept!.id },
    { name: 'Pharmacology - Physiology & Histology - I', code: 'PHL-307', departmentId: pharmaDept!.id },
    { name: 'Pharmacology - Biochemistry-I', code: 'PHL-309', departmentId: pharmaDept!.id },
    { name: 'Pharmaceutical Mathematics', code: 'PHC-313', departmentId: chemDept!.id },
    { name: 'Pharmaceutics - Pharmaceutical Dosage Forms-I', code: 'PHT-302', departmentId: ceuticsDept!.id },
    { name: 'Pharmaceutical Statistics', code: 'PHC-306', departmentId: chemDept!.id },
    { name: 'Pharmacognosy - General Pharmacognosy', code: 'PHG-312', departmentId: cognosyDept!.id }
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: {
        ...c,
        teacherId: teacher.id
      }
    });
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
