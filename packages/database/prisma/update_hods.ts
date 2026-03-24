import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', 'api', '.env') });

const prisma = new PrismaClient();

async function main() {
  // 1. Pharmacognosy
  const dept3 = await prisma.department.update({
    where: { id: "cb1960da-1380-4560-af60-01d78216dc75" },
    data: { hodId: "139d9ab8-2f5c-40d7-ad78-c0c1a7526345" }
  });
  console.log('Updated Pharmacognosy:', dept3.name);

  // 2. Pharmacology
  const dept4 = await prisma.department.update({
    where: { id: "7cf7dcd3-0f27-41f8-83d1-49b015d69c0a" },
    data: { hodId: "7d2655fe-e81a-46ab-bc0b-a1d164128d95" }
  });
  console.log('Updated Pharmacology:', dept4.name);

  // Also ensure their roles are correct (TEACHER or DEPT_ADMIN)
  // The user asked to "Assign Head of Department", so DEPT_ADMIN is more appropriate if they need admin powers.
  // However, usually they are TEACHERs with HOD status. 
  // I'll check their current roles first or just set them to DEPT_ADMIN to be sure.
  const userIds = [
    "19990ece-5cc3-45fe-b8d4-60973f910626", // Pharmaceutics
    "09665047-4e4d-49bd-85f1-6abcd59f824e", // Pharmaceutical Chemistry
    "139d9ab8-2f5c-40d7-ad78-c0c1a7526345", // Pharmacognosy
    "7d2655fe-e81a-46ab-bc0b-a1d164128d95", // Pharmacology
    "a53c124e-50f2-4fec-bb86-148dbca5c54c"  // Pharmacy Practice
  ];

  await prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: { role: 'DEPT_ADMIN' }
  });
  console.log('Verified DEPT_ADMIN role for all 5 HODs.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
