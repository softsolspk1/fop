import { PrismaClient, Role, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  console.log('--- Starting University Database Seeding (New Hierarchy) ---');

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
  const ceuticsDept = await prisma.department.findFirst({ where: { name: 'Department of Pharmaceutics' } });

  // 2. Seed Demo Accounts for All Roles
  const demoUsers = [
    { email: 'vc@uok.edu.pk', name: 'Vice Chancellor (Main Admin)', role: Role.MAIN_ADMIN },
    { email: 'dean@uok.edu.pk', name: 'Dean (Super Admin)', role: Role.SUPER_ADMIN },
    { email: 'office@uok.edu.pk', name: 'Dean Office (Sub-Admin)', role: Role.SUB_ADMIN },
    { email: 'hod@uok.edu.pk', name: 'Department Head (HOD)', role: Role.HOD, departmentId: pharmaDept?.id },
    { email: 'teacher@uok.edu.pk', name: 'Faculty Member', role: Role.FACULTY, departmentId: pharmaDept?.id },
    { email: 'student@uok.edu.pk', name: 'Demo Student', role: Role.STUDENT, departmentId: pharmaDept?.id, year: "Second" },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { password: hashedPassword, role: u.role, status: EnrollmentStatus.APPROVED },
      create: {
        ...u,
        password: hashedPassword,
        status: EnrollmentStatus.APPROVED
      }
    });
    console.log(`Seeded user: ${u.email} (${u.role})`);
  }

  // 3. Seed Professional Courses
  const teacher = await prisma.user.findFirst({ where: { role: Role.FACULTY } });
  if (!teacher) {
     console.error("No teacher found to assign courses!");
     return;
  }

  // Re-adding the 56 courses from the previous task
  const coursesToSeed = [
    { code: "PHT-401", name: "Pharmaceutics-Pharmaceutical Dosage Forms-II", creditHours: "3", professional: "Second", semesterName: "1st Semester", departmentName: "Department of Pharmaceutics" },
    { code: "PHT-403", name: "Pharmaceutics - Microbiology- I", creditHours: "3", professional: "Second", semesterName: "1st Semester", departmentName: "Department of Pharmaceutics" },
    { code: "PHC-405", name: "Pharmaceutical Chemistry-Physical-I", creditHours: "3", professional: "Second", semesterName: "1st Semester", departmentName: "Department of Pharmaceutical Chemistry" },
    { code: "PHL-407", name: "Pharmacology- Physiology & Histology (Practical)", creditHours: "3", professional: "Second", semesterName: "1st Semester", departmentName: "Department of Pharmacology" },
    { code: "PHL-409", name: "Pharmacology-Pharmacology & Therapeutics", creditHours: "3", professional: "Second", semesterName: "1st Semester", departmentName: "Department of Pharmacology" },
    { code: "PHG-411", name: "Pharmacognosy- Herbal Quality Control Lab-I (Practical)", creditHours: "3", professional: "Second", semesterName: "1st Semester", departmentName: "Department of Pharmacognosy" },
    { code: "PHL-413", name: "Pharmacology-Pathology", creditHours: "2", professional: "Second", semesterName: "1st Semester", departmentName: "Department of Pharmacology" },
    { code: "PHT-402", name: "Pharmaceutics-Pharmaceutical Dosage Forms (Lab)", creditHours: "3", professional: "Second", semesterName: "2nd Semester", departmentName: "Department of Pharmaceutics" },
    { code: "PHT-404", name: "Pharmaceutics-Microbiology-II", creditHours: "3", professional: "Second", semesterName: "2nd Semester", departmentName: "Department of Pharmaceutics" },
    { code: "PHC-406", name: "Pharmaceutical Chemistry-Physical-I (Practical)", creditHours: "2", professional: "Second", semesterName: "2nd Semester", departmentName: "Department of Pharmaceutical Chemistry" },
    { code: "PHC-408", name: "Pharmaceutical Chemistry- Physical-II", creditHours: "3", professional: "Second", semesterName: "2nd Semester", departmentName: "Department of Pharmaceutical Chemistry" },
    { code: "PHL-410", name: "Pharmacology-Systemic Pharmacology - I", creditHours: "3", professional: "Second", semesterName: "2nd Semester", departmentName: "Department of Pharmacology" },
    { code: "PHG-412", name: "Pharmacognosy-Chemical Pharmacognosy-I", creditHours: "3", professional: "Second", semesterName: "2nd Semester", departmentName: "Department of Pharmacognosy" },
    { code: "PHT-414", name: "Pharmaceutics-Physical Pharmacy", creditHours: "3", professional: "Second", semesterName: "2nd Semester", departmentName: "Department of Pharmaceutics" },
  ];

  for (const c of coursesToSeed) {
    const dept = await prisma.department.findUnique({ where: { name: c.departmentName } });
    if (dept) {
      await prisma.course.upsert({
        where: { code: c.code },
        update: {},
        create: {
          code: c.code,
          name: c.name,
          creditHours: c.creditHours,
          professional: c.professional,
          semesterName: c.semesterName,
          departmentId: dept.id,
          teacherId: teacher.id
        }
      });
    }
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
