import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', 'api', '.env') });

const prisma = new PrismaClient();

async function main() {
  const assignments = [
    { deptId: "60e59e60-a93c-4f10-8930-f6cb72b7137c", hodId: "139d9ab8-2f5c-40d7-ad78-c0c1a7526345", name: "Pharmacognosy" },
    { deptId: "7cf7dcd3-0f27-41f8-83d1-49b015d69c0a", hodId: "7d2655fe-e81a-46ab-bc0b-a1d164128d95", name: "Pharmacology" },
    { deptId: "ba18d111-e37b-494e-a25d-422116bfea65", hodId: "a53c124e-50f2-4fec-bb86-148dbca5c54c", name: "Pharmacy Practice" },
    { deptId: "8603620f-4d92-4650-850e-a8fb837e04a1", hodId: "09665047-4e4d-49bd-85f1-6abcd59f824e", name: "Pharmaceutical Chemistry" },
    { deptId: "8fb847c8-40b4-4e8b-b634-d0c901f998b9", hodId: "19990ece-5cc3-45fe-b8d4-60973f910626", name: "Pharmaceutics" }
  ];

  for (const a of assignments) {
     await prisma.department.update({
       where: { id: a.deptId },
       data: { hodId: a.hodId }
     });
     console.log(`Assigned HOD to ${a.name}`);
  }

  const hIds = assignments.map(a => a.hodId);
  await prisma.user.updateMany({
    where: { id: { in: hIds } },
    data: { role: 'DEPT_ADMIN' }
  });
  console.log('Finalized DEPT_ADMIN roles.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
