import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function verify() {
  console.log('--- Verifying Demo Accounts & Roles ---');
  const users = await prisma.user.findMany({
    select: { email: true, role: true, name: true }
  });

  const expectedRoles = ['MAIN_ADMIN', 'SUPER_ADMIN', 'SUB_ADMIN', 'HOD', 'FACULTY', 'STUDENT'];
  const foundRoles = new Set(users.map(u => u.role));

  console.log('Found Users:', users.length);
  users.forEach(u => console.log(`- ${u.email}: ${u.role}`));

  const missingRoles = expectedRoles.filter(r => !foundRoles.has(r as any));
  if (missingRoles.length === 0) {
    console.log('✅ All requested roles are present in the database.');
  } else {
    console.error('❌ Missing roles:', missingRoles);
  }

  const resetTokens = await prisma.passwordResetToken.count();
  console.log('Password Reset Tokens model accessible:', resetTokens >= 0 ? '✅' : '❌');
}

verify()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
