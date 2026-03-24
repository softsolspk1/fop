import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Activate specific user if they exist
    const mhj = await prisma.user.updateMany({
      where: { 
        email: { in: ['mhshoaib@uok.edu.pk', 'mhshoaib@uo.edu.pk'] },
        status: { not: 'APPROVED' } 
      },
      data: { status: 'APPROVED' }
    });

    // Also approve any other pending faculty/admin roles as per user request
    const pendingFaculty = await prisma.user.updateMany({
      where: { 
        role: { in: ['SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'] },
        status: { not: 'APPROVED' } 
      },
      data: { status: 'APPROVED' }
    });

    const results = await prisma.user.findMany({
      where: { email: { in: ['mhshoaib@uok.edu.pk', 'mhshoaib@uo.edu.pk'] } },
      select: { email: true, status: true, name: true }
    });

    return NextResponse.json({ 
      message: 'Approval operation complete', 
      mhShoaibResult: mhj.count,
      pendingFacultyApproved: pendingFaculty.count,
      currentUserStatus: results
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Approval failed', error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
