import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@uok.edu.pk' } });
  if (!admin) {
    console.log('Admin user not found!');
    return;
  }
  
  const isMatch = await bcrypt.compare('123456', admin.password);
  console.log(`Password '123456' matches admin hash: ${isMatch}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
