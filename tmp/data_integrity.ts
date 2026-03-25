import dotenv from 'dotenv';
dotenv.config({ path: 'packages/api/.env' });
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- DATA INTEGRITY CHECK ---');
  
  try {
    console.log('Testing FULL Course query with includes...');
    const courses = await prisma.course.findMany({
      include: {
        department: true,
        _count: {
          select: { students: true }
        }
      }
    });
    console.log('Total Courses found with include:', courses.length);
  } catch (err: any) {
    console.error('FULL Course query FAILED:', err.message);
  }

  try {
    console.log('Testing Quiz query...');
    const oneQuiz = await prisma.quiz.findFirst();
    if (oneQuiz) {
       console.log('isExam field:', (oneQuiz as any).isExam);
    } else {
       console.log('No Quizzes found in DB.');
    }
  } catch (err: any) {
    console.error('Quiz query FAILED:', err.message);
  }
  
  try {
    console.log('Testing Class query...');
    const classes = await prisma.class.findMany();
    console.log('Total Classes:', classes.length);
  } catch (err: any) {
    console.error('Class query FAILED:', err.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
