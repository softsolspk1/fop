const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEPARTMENTS = {
  PHT: "8fb847c8-40b4-4e8b-b634-d0c901f998b9", // Pharmaceutics
  PHC: "8603620f-4d92-4650-850e-a8fb837e04a1", // Pharmaceutical Chemistry
  PHL: "7cf7dcd3-0f27-41f8-83d1-49b015d69c0a", // Pharmacology
  PHG: "60e59e60-a93c-4f10-8930-f6cb72b7137c", // Pharmacognosy
  PHP: "ba18d111-e37b-494e-a25d-422116bfea65"  // Pharmacy Practice
};

const DEFAULT_TEACHER_ID = "234737d1-948d-404e-b1d9-bc8f0ebca3b7"; // Senior Professor

const COURSES = [
  // Second Professional - 1st Semester
  { code: "PHT-401", name: "Pharmaceutics-Pharmaceutical Dosage Forms-II", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
  { code: "PHT-403", name: "Pharmaceutics - Microbiology- I", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
  { code: "PHC-405", name: "Pharmaceutical Chemistry-Physical-I", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
  { code: "PHL-407", name: "Pharmacology- Physiology & Histology (Practical)", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
  { code: "PHL-409", name: "Pharmacology-Pharmacology & Therapeutics", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
  { code: "PHG-411", name: "Pharmacognosy- Herbal Quality Control Lab-I (Practical)", creditHours: "3", professional: "Second", semesterName: "1st Semester" },
  { code: "PHL-413", name: "Pharmacology-Pathology", creditHours: "2", professional: "Second", semesterName: "1st Semester" },

  // Second Professional - 2nd Semester
  { code: "PHT-402", name: "Pharmaceutics-Pharmaceutical Dosage Forms (Lab)", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
  { code: "PHT-404", name: "Pharmaceutics-Microbiology-II", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
  { code: "PHC-406", name: "Pharmaceutical Chemistry-Physical-I (Practical)", creditHours: "2", professional: "Second", semesterName: "2nd Semester" },
  { code: "PHC-408", name: "Pharmaceutical Chemistry- Physical-II", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
  { code: "PHL-410", name: "Pharmacology-Systemic Pharmacology - I", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
  { code: "PHG-412", name: "Pharmacognosy-Chemical Pharmacognosy-I", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },
  { code: "PHT-414", name: "Pharmaceutics-Physical Pharmacy", creditHours: "3", professional: "Second", semesterName: "2nd Semester" },

  // Third Professional - 1st Semester
  { code: "PHT-501", name: "Pharmaceutics – Pharmaceutical Microbiology (Lab.)", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
  { code: "PHC-503", name: "Pharmaceutical Chemistry- Physical-II (Practical)", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
  { code: "PHC-505", name: "Pharmaceutical Chemistry- Quality Control", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
  { code: "PHL-507", name: "Pharmacology- Systemic Pharmacology - II", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
  { code: "PHL-509", name: "Pharmacology - Pathology (Practical)", creditHours: "2", professional: "Third", semesterName: "1st Semester" },
  { code: "PHG-511", name: "Pharmacognosy - Chemical Pharmacognosy- II", creditHours: "3", professional: "Third", semesterName: "1st Semester" },
  { code: "PHT-513", name: "Pharmaceutics - Computer Application in Pharmacy", creditHours: "2", professional: "Third", semesterName: "1st Semester" },

  // Third Professional - 2nd Semester
  { code: "PHT-502", name: "Pharmaceutics - Physical Pharmacy (Lab)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
  { code: "PHT-504", name: "Pharmaceutics - Industrial Pharmacy- I (Unit Operations)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
  { code: "PHC-506", name: "Pharmaceutical Chemistry- Prep/Q.C. (Practical)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
  { code: "PHC-508", name: "Pharmaceutical Chemistry- Pharmaceutical Analysis- I", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
  { code: "PHL-510", name: "Pharmacology- Pharmacology (Practical)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
  { code: "PHG-512", name: "Pharmacognosy- Herbal Quality Control Lab -II (Practical)", creditHours: "3", professional: "Third", semesterName: "2nd Semester" },
  { code: "PHG-514", name: "Pharmacognosy - Natural Toxins", creditHours: "2", professional: "Third", semesterName: "2nd Semester" },

  // Fourth Professional - 1st Semester
  { code: "PHP-601", name: "Pharmacy Practice - I", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
  { code: "PHT-603", name: "Pharmaceutics - Industrial Pharmacy - II - Pharmaceutical Engineering", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
  { code: "PHT-605", name: "Pharmaceutics - Industrial Pharmacy (Lab)", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
  { code: "PHC-607", name: "Pharma. Chemistry- Pharmaceutical Analysis- I (Practical)", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
  { code: "PHL-609", name: "Pharmacology- Systemic Pharmacology - III", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
  { code: "PHG-611", name: "Pharmacognosy - Advance Pharmacognosy", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },
  { code: "PHT-613", name: "Pharmaceutics- Pharmaceutical Technology", creditHours: "3", professional: "Fourth", semesterName: "1st Semester" },

  // Fourth Professional - 2nd Semester
  { code: "PHP-602", name: "Pharmacy Practice-II", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
  { code: "PHT-604", name: "Pharmaceutics – Biopharmaceutics and Pharmacokinetics (I)", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
  { code: "PHT-606", name: "Pharmaceutics - Clinical Pharmacokinetics", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
  { code: "PHC-608", name: "Pharmaceutical Chemistry - Pharmaceutical Analysis-II", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
  { code: "PHC-610", name: "Pharmaceutical Chemistry- Medicinal- I", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
  { code: "PHL-612", name: "Pharmacology - Pharmacology Lab-II", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },
  { code: "PHT-614", name: "Pharmaceutics - Pharmaceutical Technology (Lab)", creditHours: "3", professional: "Fourth", semesterName: "2nd Semester" },

  // Fifth Professional - 1st Semester
  { code: "PHT-701", name: "Pharmaceutics - Biopharmaceutics & Pharmacokinetics (Lab)", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
  { code: "PHT-703", name: "Pharmaceutics - Forensic Pharmacy", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
  { code: "PHP-705", name: "Pharmacy Practice – III", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
  { code: "PHC-707", name: "Pharmaceutical Chemistry- Pharmaceutical Analysis- II (Practical)", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
  { code: "PHC-709", name: "Pharmaceutical Chemistry- Medicinal- II", creditHours: "3", professional: "Fifth", semesterName: "1st Semester" },
  { code: "PHL-711", name: "Pharmacology - Clinical Pharmacology", creditHours: "2", professional: "Fifth", semesterName: "1st Semester" },
  { code: "PHG-713", name: "Pharmacognosy - Clinical Pharmacognosy", creditHours: "2", professional: "Fifth", semesterName: "1st Semester" },

  // Fifth Professional - 2nd Semester
  { code: "PHT-702", name: "Pharmaceutics - Prescription & Community Pharmacy", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
  { code: "PHT-704", name: "Pharmaceutics - Pharma. Management & Marketing", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
  { code: "PHT-706", name: "Pharmaceutics - Prescription Pharmacy (Lab)", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
  { code: "PHT-708", name: "Pharmaceutics - Pharmaceutical Quality Management", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
  { code: "PHC-710", name: "Pharmaceutical Chemistry - Medicinal- III", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" },
  { code: "PHL-712", name: "Pharmacology – Toxicology", creditHours: "2", professional: "Fifth", semesterName: "2nd Semester" },
  { code: "PHP-714", name: "Pharmacy Practice – IV", creditHours: "3", professional: "Fifth", semesterName: "2nd Semester" }
];

async function main() {
  console.log(`Starting to add ${COURSES.length} courses...`);
  
  for (const c of COURSES) {
    const prefix = c.code.split('-')[0];
    const deptId = DEPARTMENTS[prefix];
    
    if (!deptId) {
      console.warn(`Warning: No department found for prefix ${prefix} in course ${c.code}`);
      continue;
    }

    try {
      const course = await prisma.course.upsert({
        where: { code: c.code },
        update: {
          name: c.name,
          creditHours: c.creditHours,
          professional: c.professional,
          semesterName: c.semesterName,
          departmentId: deptId,
          teacherId: DEFAULT_TEACHER_ID
        },
        create: {
          code: c.code,
          name: c.name,
          creditHours: c.creditHours,
          professional: c.professional,
          semesterName: c.semesterName,
          departmentId: deptId,
          teacherId: DEFAULT_TEACHER_ID
        }
      });
      console.log(`Successfully added/updated [${course.code}] ${course.name}`);
    } catch (e) {
      console.error(`Error adding/updating [${c.code}] ${c.name}:`, e.message);
    }
  }
  
  console.log('--- Course addition complete. ---');
}

main().catch(console.error).finally(() => prisma.$disconnect());
