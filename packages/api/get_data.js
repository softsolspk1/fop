const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  try {
    const depts = await prisma.department.findMany({ select: { id: true, name: true } });
    const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' }, select: { id: true, name: true } });
    console.log('Departments:', JSON.stringify(depts, null, 2));
    console.log('Teachers:', JSON.stringify(teachers, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}
run();
