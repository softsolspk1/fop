const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const departmentId = '8fb847c8-40b4-4e8b-b634-d0c901f998b9';
const teacherId = '003bab66-29e8-4ce9-a115-6bc42177dff9';

const courses = [
  // First Semester
  { code: 'PHT-301', name: 'Physical Pharmacy - I', creditHours: '3', category: 'Core', professional: 'First', semesterName: '1st Semester' },
  { code: 'PHT-303', name: 'Physical Pharmacy (Lab) - I', creditHours: '1', category: 'Core', professional: 'First', semesterName: '1st Semester' },
  { code: 'PHT-401', name: 'Drug Delivery and Formulation Science - I', creditHours: '3', category: 'Core', professional: 'Second', semesterName: '1st Semester' },
  { code: 'PHT-403', name: 'Drug Delivery and Formulation Science (Lab) - I', creditHours: '1', category: 'Core', professional: 'Second', semesterName: '1st Semester' },
  { code: 'PHT-417', name: 'Basic Pharmaceutical Microbiology', creditHours: '2', category: 'General Edu.', professional: 'Second', semesterName: '1st Semester' },
  { code: 'PHT-419', name: 'Basic Pharmaceutical Microbiology (Lab)', creditHours: '1', category: 'General Edu.', professional: 'Second', semesterName: '1st Semester' },
  { code: 'PHT-601', name: 'Industrial Pharmacy - I', creditHours: '3', category: 'Core', professional: 'Fourth', semesterName: '1st Semester' },
  { code: 'PHT-603', name: 'Industrial Pharmacy (Lab) - I', creditHours: '1', category: 'Core', professional: 'Fourth', semesterName: '1st Semester' },
  { code: 'PHT-605', name: 'Biopharmaceutics and Pharmacokinetics - I', creditHours: '3', category: 'Core', professional: 'Fourth', semesterName: '1st Semester' },
  { code: 'PHT-607', name: 'Biopharmaceutics and Pharmacokinetics (Lab) - I', creditHours: '1', category: 'Core', professional: 'Fourth', semesterName: '1st Semester' },
  { code: 'PHT-613', name: 'Expository Writing', creditHours: '3', category: 'General Edu.', professional: 'Fourth', semesterName: '1st Semester' },
  { code: 'PHT-615', name: 'Entrepreneurship', creditHours: '2', category: 'General Edu.', professional: 'Fourth', semesterName: '1st Semester' },
  { code: 'PHT-617', name: 'Pharmaceutical Marketing and Management', creditHours: '2', category: 'General Edu.', professional: 'Fourth', semesterName: '1st Semester' },
  { code: 'PHT-701', name: 'Pharmaceutical Technology - I', creditHours: '3', category: 'Core', professional: 'Fifth', semesterName: '1st Semester' },
  { code: 'PHT-703', name: 'Pharmaceutical Technology (Lab) - I', creditHours: '1', category: 'Core', professional: 'Fifth', semesterName: '1st Semester' },
  { code: 'PHT-705', name: 'Pharmaceutical Quality Management Systems', creditHours: '3', category: 'Core', professional: 'Fifth', semesterName: '1st Semester' },

  // Second Semester
  { code: 'PHT-302', name: 'Physical Pharmacy - II', creditHours: '3', category: 'Core', professional: 'First', semesterName: '2nd Semester' },
  { code: 'PHT-304', name: 'Physical Pharmacy (Lab) - II', creditHours: '1', category: 'Core', professional: 'First', semesterName: '2nd Semester' },
  { code: 'PHT-402', name: 'Drug Delivery and Formulation Science - II', creditHours: '3', category: 'Core', professional: 'Second', semesterName: '2nd Semester' },
  { code: 'PHT-404', name: 'Drug Delivery and Formulation Science (Lab) - II', creditHours: '1', category: 'Core', professional: 'Second', semesterName: '2nd Semester' },
  { code: 'PHT-406', name: 'Applied Pharmaceutical Microbiology and Immunology', creditHours: '3', category: 'Core', professional: 'Second', semesterName: '2nd Semester' },
  { code: 'PHT-408', name: 'Applied Pharmaceutical Microbiology and Immunology (Lab)', creditHours: '1', category: 'Core', professional: 'Second', semesterName: '2nd Semester' },
  { code: 'PHT-516', name: 'Application of ICT {Information and Communication Technologies}', creditHours: '2', category: 'General Edu.', professional: 'Third', semesterName: '2nd Semester' },
  { code: 'PHT-518', name: 'Application of ICT (Lab)', creditHours: '1', category: 'General Edu.', professional: 'Third', semesterName: '2nd Semester' },
  { code: 'PHT-602', name: 'Industrial Pharmacy - II', creditHours: '3', category: 'Core', professional: 'Fourth', semesterName: '2nd Semester' },
  { code: 'PHT-604', name: 'Industrial Pharmacy (Lab) - II', creditHours: '1', category: 'Core', professional: 'Fourth', semesterName: '2nd Semester' },
  { code: 'PHT-606', name: 'Biopharmaceutics and Pharmacokinetics - II', creditHours: '3', category: 'Core', professional: 'Fourth', semesterName: '2nd Semester' },
  { code: 'PHT-608', name: 'Biopharmaceutics and Pharmacokinetics (Lab) - II', creditHours: '1', category: 'Core', professional: 'Fourth', semesterName: '2nd Semester' },
  { code: 'PHT-702', name: 'Pharmaceutical Technology - II', creditHours: '3', category: 'Core', professional: 'Fifth', semesterName: '2nd Semester' },
  { code: 'PHT-704', name: 'Pharmaceutical Technology (Lab) - II', creditHours: '1', category: 'Core', professional: 'Fifth', semesterName: '2nd Semester' },
];

async function main() {
  console.log('Starting Pharmaceutics course synchronization...');
  
  for (const courseData of courses) {
    const upserted = await prisma.course.upsert({
      where: { code: courseData.code },
      update: {
        name: courseData.name,
        creditHours: courseData.creditHours,
        category: courseData.category,
        professional: courseData.professional,
        semesterName: courseData.semesterName,
        departmentId: departmentId,
        teacherId: teacherId,
      },
      create: {
        code: courseData.code,
        name: courseData.name,
        creditHours: courseData.creditHours,
        category: courseData.category,
        professional: courseData.professional,
        semesterName: courseData.semesterName,
        departmentId: departmentId,
        teacherId: teacherId,
      },
    });
    console.log(`Synced: [${upserted.code}] ${upserted.name}`);
  }
  
  console.log('Synchronization complete.');
}

main()
  .catch((e) => {
    console.error('Error during synchronization:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
