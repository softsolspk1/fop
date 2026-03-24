import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', 'api', '.env') });

const prisma = new PrismaClient();

async function main() {
  const departments = await prisma.department.findMany();
  console.log('All Departments:', JSON.stringify(departments, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
