const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const deptIds = {
  PHT: '8fb847c8-40b4-4e8b-b634-d0c901f998b9',
  PHC: '8603620f-4d92-4650-850e-a8fb837e04a1',
  PHL: '7cf7dcd3-0f27-41f8-83d1-49b015d69c0a',
  PHG: '60e59e60-a93c-4f10-8930-f6cb72b7137c',
  PHP: 'ba18d111-e37b-494e-a25d-422116bfea65'
};

const teacherId = '003bab66-29e8-4ce9-a115-6bc42177dff9';

const courses = [
  // First Professional - 1st Semester
  { code: 'PHT-301', name: 'Physical Pharmacy - I', cr: '3', cat: 'Core', prof: 'First', sem: '1st Semester' },
  { code: 'PHT-303', name: 'Physical Pharmacy (Lab) - I', cr: '1', cat: 'Core', prof: 'First', sem: '1st Semester' },
  { code: 'PHC-305', name: 'Organic Chemistry - I', cr: '3', cat: 'Core', prof: 'First', sem: '1st Semester' },
  { code: 'PHC-307', name: 'Organic Chemistry (Lab) - I', cr: '1', cat: 'Core', prof: 'First', sem: '1st Semester' },
  { code: 'PHC-309', name: 'Biochemistry - I', cr: '2', cat: 'Core', prof: 'First', sem: '1st Semester' },
  { code: 'PHC-311', name: 'Biochemistry (Lab) - I', cr: '1', cat: 'Core', prof: 'First', sem: '1st Semester' },
  { code: 'PHL-313', name: 'Physiology - I', cr: '3', cat: 'Allied/Inter.', prof: 'First', sem: '1st Semester' },
  { code: 'PHL-315', name: 'Physiology (Lab) - I', cr: '1', cat: 'Allied/Inter.', prof: 'First', sem: '1st Semester' },
  { code: 'PHG-317', name: 'Functional English', cr: '3', cat: 'General Edu.', prof: 'First', sem: '1st Semester' },

  // First Professional - 2nd Semester
  { code: 'PHT-302', name: 'Physical Pharmacy - II', cr: '3', cat: 'Core', prof: 'First', sem: '2nd Semester' },
  { code: 'PHT-304', name: 'Physical Pharmacy (Lab) - II', cr: '1', cat: 'Core', prof: 'First', sem: '2nd Semester' },
  { code: 'PHC-306', name: 'Organic Chemistry - II', cr: '3', cat: 'Core', prof: 'First', sem: '2nd Semester' },
  { code: 'PHC-308', name: 'Organic Chemistry (Lab) - II', cr: '1', cat: 'Core', prof: 'First', sem: '2nd Semester' },
  { code: 'PHC-310', name: 'Biochemistry - II', cr: '2', cat: 'Core', prof: 'First', sem: '2nd Semester' },
  { code: 'PHC-312', name: 'Biochemistry (Lab) - II', cr: '1', cat: 'Core', prof: 'First', sem: '2nd Semester' },
  { code: 'PHL-314', name: 'Anatomy and Histology', cr: '2', cat: 'Allied/Inter.', prof: 'First', sem: '2nd Semester' },
  { code: 'PHL-316', name: 'Anatomy and Histology (Lab)', cr: '1', cat: 'Allied/Inter.', prof: 'First', sem: '2nd Semester' },
  { code: 'PHL-318', name: 'Physiology - II', cr: '3', cat: 'Allied/Inter.', prof: 'First', sem: '2nd Semester' },
  { code: 'PHL-320', name: 'Physiology (Lab) - II', cr: '1', cat: 'Allied/Inter.', prof: 'First', sem: '2nd Semester' },
  { code: 'PHL-322', name: 'Islamic Studies', cr: '2', cat: 'General Edu.', prof: 'First', sem: '2nd Semester' },

  // Second Professional - 1st Semester
  { code: 'PHT-401', name: 'Drug Delivery and Formulation Science - I', cr: '3', cat: 'Core', prof: 'Second', sem: '1st Semester' },
  { code: 'PHT-403', name: 'Drug Delivery and Formulation Science (Lab) - I', cr: '1', cat: 'Core', prof: 'Second', sem: '1st Semester' },
  { code: 'PHL-405', name: 'Pharmacology and Therapeutics - I', cr: '3', cat: 'Core', prof: 'Second', sem: '1st Semester' },
  { code: 'PHL-407', name: 'Pharmacology and Therapeutics (Lab) - I', cr: '1', cat: 'Core', prof: 'Second', sem: '1st Semester' },
  { code: 'PHG-409', name: 'Pharmacognosy (Basic) - I', cr: '3', cat: 'Core', prof: 'Second', sem: '1st Semester' },
  { code: 'PHG-411', name: 'Pharmacognosy (Basic) (Lab) - I', cr: '1', cat: 'Core', prof: 'Second', sem: '1st Semester' },
  { code: 'PHL-413', name: 'Pathology', cr: '2', cat: 'Allied/Inter.', prof: 'Second', sem: '1st Semester' },
  { code: 'PHL-415', name: 'Pathology (Lab)', cr: '1', cat: 'Allied/Inter.', prof: 'Second', sem: '1st Semester' },
  { code: 'PHT-417', name: 'Basic Pharmaceutical Microbiology', cr: '2', cat: 'General Edu.', prof: 'Second', sem: '1st Semester' },
  { code: 'PHT-419', name: 'Basic Pharmaceutical Microbiology (Lab)', cr: '1', cat: 'General Edu.', prof: 'Second', sem: '1st Semester' },

  // Second Professional - 2nd Semester
  { code: 'PHT-402', name: 'Drug Delivery and Formulation Science - II', cr: '3', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHT-404', name: 'Drug Delivery and Formulation Science (Lab) - II', cr: '1', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHT-406', name: 'Applied Pharmaceutical Microbiology and Immunology', cr: '3', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHT-408', name: 'Applied Pharmaceutical Microbiology and Immunology (Lab)', cr: '1', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHL-410', name: 'Pharmacology and Therapeutics - II', cr: '3', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHL-412', name: 'Pharmacology and Therapeutics (Lab) - II', cr: '1', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHG-414', name: 'Pharmacognosy Basic - II', cr: '3', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHG-416', name: 'Pharmacognosy Basic (Lab) - II', cr: '1', cat: 'Core', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHL-418', name: 'Fehm-e-Quran - I', cr: '1', cat: 'General Edu.', prof: 'Second', sem: '2nd Semester' },
  { code: 'PHG-420', name: 'Pakistan Studies', cr: '2', cat: 'General Edu.', prof: 'Second', sem: '2nd Semester' },

  // Third Professional - 1st Semester
  { code: 'PHC-501', name: 'Pharmaceutical Analysis - I', cr: '3', cat: 'Core', prof: 'Third', sem: '1st Semester' },
  { code: 'PHC-503', name: 'Pharmaceutical Analysis (Lab) - I', cr: '1', cat: 'Core', prof: 'Third', sem: '1st Semester' },
  { code: 'PHL-505', name: 'Pharmacology and Therapeutics - III', cr: '3', cat: 'Core', prof: 'Third', sem: '1st Semester' },
  { code: 'PHL-507', name: 'Pharmacology and Therapeutics (Lab) - III', cr: '1', cat: 'Core', prof: 'Third', sem: '1st Semester' },
  { code: 'PHG-509', name: 'Pharmacognosy (Applied)', cr: '3', cat: 'Core', prof: 'Third', sem: '1st Semester' },
  { code: 'PHG-511', name: 'Pharmacognosy (Applied) (Lab)', cr: '1', cat: 'Core', prof: 'Third', sem: '1st Semester' },
  { code: 'PHP-513', name: 'Social and Administrative Pharmacy - I', cr: '2', cat: 'Core', prof: 'Third', sem: '1st Semester' },
  { code: 'PHC-515', name: 'Quantitative Reasoning - I (Maths)', cr: '3', cat: 'General Edu.', prof: 'Third', sem: '1st Semester' },
  { code: 'PHG-517', name: 'Ideology and Constitution of Pakistan', cr: '2', cat: 'General Edu.', prof: 'Third', sem: '1st Semester' },
  { code: 'PHL-519', name: 'Fehm-e-Quran - II', cr: '1', cat: 'General Edu.', prof: 'Third', sem: '1st Semester' },

  // Third Professional - 2nd Semester
  { code: 'PHC-502', name: 'Pharmaceutical Analysis - II', cr: '3', cat: 'Core', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHC-504', name: 'Pharmaceutical Analysis (Lab) - II', cr: '1', cat: 'Core', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHL-506', name: 'Pharmacology and Therapeutics - IV', cr: '3', cat: 'Core', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHL-508', name: 'Pharmacology and Therapeutics (Lab) - IV', cr: '1', cat: 'Core', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHG-510', name: 'Pharmacognosy (Advanced)', cr: '3', cat: 'Core', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHG-512', name: 'Pharmacognosy (Advanced) (Lab)', cr: '1', cat: 'Core', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHP-514', name: 'Social and Administrative Pharmacy - II', cr: '2', cat: 'Core', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHT-516', name: 'Application of ICT {Information and Communication Technology}', cr: '2', cat: 'General Edu.', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHT-518', name: 'Application of ICT (Lab)', cr: '1', cat: 'General Edu.', prof: 'Third', sem: '2nd Semester' },
  { code: 'PHC-520', name: 'Quantitative Reasoning - II (Biostats)', cr: '3', cat: 'General Edu.', prof: 'Third', sem: '2nd Semester' },

  // Fourth Professional - 1st Semester
  { code: 'PHT-601', name: 'Industrial Pharmacy - I', cr: '3', cat: 'Core', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHT-603', name: 'Industrial Pharmacy (Lab) - I', cr: '1', cat: 'Core', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHT-605', name: 'Biopharmaceutics and Pharmacokinetics - I', cr: '3', cat: 'Core', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHT-607', name: 'Biopharmaceutics and Pharmacokinetics (Lab) - I', cr: '1', cat: 'Core', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHP-609', name: 'Clinical Pharmacy - I', cr: '3', cat: 'Core', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHP-611', name: 'Clinical Pharmacy (Lab) - I', cr: '1', cat: 'Core', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHT-613', name: 'Expository Writing', cr: '3', cat: 'General Edu.', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHT-615', name: 'Entrepreneurship', cr: '2', cat: 'General Edu.', prof: 'Fourth', sem: '1st Semester' },
  { code: 'PHT-617', name: 'Pharmaceutical Marketing and Management', cr: '2', cat: 'General Edu.', prof: 'Fourth', sem: '1st Semester' },

  // Fourth Professional - 2nd Semester
  { code: 'PHT-602', name: 'Industrial Pharmacy - II', cr: '3', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHT-604', name: 'Industrial Pharmacy (Lab) - II', cr: '1', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHT-606', name: 'Biopharmaceutics and Pharmacokinetics - II', cr: '3', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHT-608', name: 'Biopharmaceutics and Pharmacokinetics (Lab) - II', cr: '1', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHC-610', name: 'Pharmaceutical Quality Control', cr: '2', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHC-612', name: 'Pharmaceutical Quality Control (Lab)', cr: '1', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHP-614', name: 'Clinical Pharmacy - II', cr: '3', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHP-616', name: 'Clinical Pharmacy - II (Lab)', cr: '1', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHP-618', name: 'Civics and Community Engagement', cr: '1', cat: 'General Edu.', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHP-620', name: 'Civics and Community Engagement (Lab)', cr: '1', cat: 'General Edu.', prof: 'Fourth', sem: '2nd Semester' },
  { code: 'PHP-622', name: 'Pharmacy Practice Experience, PPE (Clinical Clerkship)', cr: '3', cat: 'Core', prof: 'Fourth', sem: '2nd Semester' },

  // Fifth Professional - 1st Semester
  { code: 'PHT-701', name: 'Pharmaceutical Technology - I', cr: '3', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHT-703', name: 'Pharmaceutical Technology (Lab) - I', cr: '1', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHT-705', name: 'Pharmaceutical Quality Management Systems', cr: '3', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHC-707', name: 'Medicinal Chemistry - I', cr: '3', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHC-709', name: 'Medicinal Chemistry (Lab) - I', cr: '1', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHL-711', name: 'Clinical Pharmacology', cr: '2', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHL-713', name: 'Clinical Pharmacology (Lab)', cr: '1', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHP-715', name: 'Advanced Clinical Pharmacy - I', cr: '3', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHP-717', name: 'Advanced Clinical Pharmacy - I (Lab)', cr: '1', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },
  { code: 'PHP-719', name: 'Pharmaceutical Regulatory Science - I', cr: '3', cat: 'Core', prof: 'Fifth', sem: '1st Semester' },

  // Fifth Professional - 2nd Semester
  { code: 'PHT-702', name: 'Pharmaceutical Technology - II', cr: '3', cat: 'Core', prof: 'Fifth', sem: '2nd Semester' },
  { code: 'PHT-704', name: 'Pharmaceutical Technology (Lab) - II', cr: '1', cat: 'Core', prof: 'Fifth', sem: '2nd Semester' },
  { code: 'PHC-706', name: 'Medicinal Chemistry - II', cr: '3', cat: 'Core', prof: 'Fifth', sem: '2nd Semester' },
  { code: 'PHC-708', name: 'Medicinal Chemistry (Lab) - II', cr: '1', cat: 'Core', prof: 'Fifth', sem: '2nd Semester' },
  { code: 'PHP-710', name: 'Advanced Clinical Pharmacy - II', cr: '3', cat: 'Core', prof: 'Fifth', sem: '2nd Semester' },
  { code: 'PHP-712', name: 'Advanced Clinical Pharmacy - II (Lab)', cr: '1', cat: 'Core', prof: 'Fifth', sem: '2nd Semester' },
  { code: 'PHP-714', name: 'Pharmaceutical Regulatory Science - II', cr: '3', cat: 'Core', prof: 'Fifth', sem: '2nd Semester' },
  { code: 'PHL-716', name: 'Bioethics', cr: '2', cat: 'General Edu.', prof: 'Fifth', sem: '2nd Semester' },
];

async function main() {
  console.log('Starting Global Curriculum synchronization...');
  
  for (const c of courses) {
    const prefix = c.code.split('-')[0];
    const departmentId = deptIds[prefix];
    
    if (!departmentId) {
      console.warn(`No department ID found for prefix: ${prefix} (Course: ${c.code})`);
      continue;
    }

    const upserted = await prisma.course.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        creditHours: c.cr,
        category: c.cat,
        professional: c.prof,
        semesterName: c.sem,
        departmentId: departmentId,
        teacherId: teacherId,
      },
      create: {
        code: c.code,
        name: c.name,
        creditHours: c.cr,
        category: c.cat,
        professional: c.prof,
        semesterName: c.sem,
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
