const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const professionals = ["Second", "Third", "Fourth", "Fifth"];
  
  console.log('--- Verification Results ---');
  
  for (const prof of professionals) {
    const count = await prisma.course.count({
      where: { professional: prof }
    });
    console.log(`${prof} Professional: ${count} courses`);
  }

  const total = await prisma.course.count({
    where: { professional: { in: professionals } }
  });
  console.log(`Total Courses (2nd-5th): ${total}`);

  const depts = await prisma.department.findMany({
    include: { _count: { select: { courses: true } } }
  });
  
  console.log('\n--- Department Course Counts ---');
  depts.forEach(d => {
    console.log(`${d.name}: ${d._count.courses} courses`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
