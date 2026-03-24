import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', 'api', '.env') });

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('USERS:');
  console.log(JSON.stringify(users, null, 2));

  const depts = await prisma.department.findMany();
  console.log('DEPARTMENTS:');
  console.log(JSON.stringify(depts, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
