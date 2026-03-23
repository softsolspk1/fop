import { PrismaClient, Role, EnrollmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Softsols@123', 10);
  
  console.log('--- Starting Refined Database Seeding ---');

  // 1. Read extracted data
  const dataPath = path.join(__dirname, '../../../scripts/extracted_details.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Extracted data file not found at:', dataPath);
    return;
  }
  const extractedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 2. Ensure Departments exist
  const deptNames = [
    'Department of Pharmaceutics',
    'Department of Pharmaceutical Chemistry',
    'Department of Pharmacognosy',
    'Department of Pharmacology',
    'Department of Pharmacy Practice'
  ];

  const deptsMap: Record<string, string> = {};
  for (const name of deptNames) {
    const d = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    deptsMap[name] = d.id;
  }

  // 3. Seed Faculty Members
  console.log(`Seeding ${extractedData.faculty.length} faculty members...`);
  const facultyList = [];
  for (const f of extractedData.faculty) {
    // Standardize department name
    let deptId = deptsMap['Department of Pharmaceutics'];
    if (f.department && deptsMap[`Department of ${f.department}`]) {
        deptId = deptsMap[`Department of ${f.department}`];
    } else if (f.department && deptsMap[f.department]) {
        deptId = deptsMap[f.department];
    }

    const user = await prisma.user.upsert({
      where: { email: f.email.toLowerCase() },
      update: {
        name: f.name,
        designation: f.designation,
        qualification: f.qualification,
        role: Role.TEACHER,
        status: EnrollmentStatus.APPROVED,
        departmentId: deptId,
        yearOfAssociation: "2024" // Default
      },
      create: {
        email: f.email.toLowerCase(),
        password: hashedPassword,
        name: f.name,
        designation: f.designation,
        qualification: f.qualification,
        role: Role.TEACHER,
        status: EnrollmentStatus.APPROVED,
        departmentId: deptId,
        yearOfAssociation: "2024"
      }
    });
    facultyList.push(user);
  }

  // 4. Seed Courses
  console.log(`Seeding ${extractedData.courses.length} courses...`);
  const defaultTeacherId = facultyList[0]?.id || (await prisma.user.findFirst({ where: { role: Role.TEACHER } }))?.id;
  
  if (!defaultTeacherId) {
    console.error('No teacher found to assign courses to!');
    return;
  }

  // Delete existing courses to ensure clean state as requested
  // await prisma.course.deleteMany({}); // Uncomment if full purge is desired

  for (const c of extractedData.courses) {
    // Find department by code prefix or title
    let deptId = deptsMap['Department of Pharmaceutics']; // Default
    if (c.code.startsWith('PHT')) deptId = deptsMap['Department of Pharmaceutics'];
    else if (c.code.startsWith('PHC')) deptId = deptsMap['Department of Pharmaceutical Chemistry'];
    else if (c.code.startsWith('PHG')) deptId = deptsMap['Department of Pharmacognosy'];
    else if (c.code.startsWith('PHL')) deptId = deptsMap['Department of Pharmacology'];
    else if (c.code.startsWith('PHP')) deptId = deptsMap['Department of Pharmacy Practice'];

    await prisma.course.upsert({
      where: { code: c.code },
      update: {
        name: c.title,
        creditHours: c.creditHours,
        professional: c.professional,
        category: c.category,
        semesterName: c.semesterName === "Unknown" ? "1st Semester" : c.semesterName, // Fallback
        outcomes: c.outcomes,
        contents: c.contents,
        readings: c.readings,
        departmentId: deptId
      },
      create: {
        code: c.code,
        name: c.title,
        creditHours: c.creditHours,
        professional: c.professional,
        category: c.category,
        semesterName: c.semesterName === "Unknown" ? "1st Semester" : c.semesterName,
        outcomes: c.outcomes,
        contents: c.contents,
        readings: c.readings,
        departmentId: deptId,
        teacherId: defaultTeacherId
      }
    });
  }

  // 5. Seed Virtual Labs (Only the 3 requested)
  console.log('Seeding Virtual Labs...');
  
  const labs = [
    {
      title: 'Dissolution Test',
      description: 'Study the rate of drug release from tablet dosage forms using USP Dissolution Apparatus.',
      department: 'Pharmaceutics',
      provider: 'UOK Virtual Lab',
      difficulty: 'Intermediate',
      theory: 'Dissolution is the process by which a solid substance enters into a solvent to yield a solution. The rate of dissolution is critical for drug absorption.',
      objectives: 'To determine the percentage of drug release over time and understand the effect of RPM and tablet type.',
      safety: 'Wear lab coat and gloves. Handle dissolution media carefully.',
      year: 3
    },
    {
      title: 'Tablet Formulation',
      description: 'Simulate the process of wet and dry granulation to produce pharmaceutical tablets.',
      department: 'Pharmaceutics',
      provider: 'UOK Virtual Lab',
      difficulty: 'Advanced',
      theory: 'Granulation is the process of collecting particles together by creating bonds between them. Bonds are formed by compression or by using a binding agent.',
      objectives: 'Evaluate the effect of binder and disintegrant concentration on tablet hardness and disintegration.',
      safety: 'Ensure proper handling of API and excipients. Use mask to avoid inhalation of dust.',
      year: 4
    },
    {
      title: 'Emulsion Prep',
      description: 'Prepare oil-in-water and water-in-oil emulsions and evaluate their stability.',
      department: 'Pharmaceutics',
      provider: 'UOK Virtual Lab',
      difficulty: 'Beginner',
      theory: 'An emulsion is a system consisting of two immiscible liquid phases, one of which is dispersed as globules in the other.',
      objectives: 'Identify the type of emulsion and determine the stability score based on mixing speed and emulsifier.',
      safety: 'Avoid contact with eyes. Dispose of oily waste properly.',
      year: 2
    }
  ];

  // Clean existing labs and related data
  console.log('Cleaning up old labs and experiments...');
  const existingLabsToKeep = labs.map(l => l.title);
  
  // Find labs to delete
  const labsToDelete = await prisma.lab.findMany({
    where: { title: { notIn: existingLabsToKeep } },
    select: { id: true }
  });
  const labIdsToDelete = labsToDelete.map(l => l.id);

  if (labIdsToDelete.length > 0) {
    // Delete dependent observations first
    await prisma.observation.deleteMany({
      where: { experiment: { labId: { in: labIdsToDelete } } }
    });
    // Delete dependent experiments
    await prisma.experiment.deleteMany({
      where: { labId: { in: labIdsToDelete } }
    });
    // Finally delete the labs
    await prisma.lab.deleteMany({
      where: { id: { in: labIdsToDelete } }
    });
  }

  for (const l of labs) {
    await prisma.lab.upsert({
      where: { title: l.title },
      update: l,
      create: l
    });
  }

  console.log('--- Refined Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
