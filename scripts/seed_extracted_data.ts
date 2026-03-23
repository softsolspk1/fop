import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log("Starting seed process for extracted data...");

    // 1. Get or create Department of Pharmaceutics
    let dept = await prisma.department.findUnique({
        where: { name: 'Pharmaceutics' }
    });
    
    if (!dept) {
        dept = await prisma.department.create({
            data: { name: 'Pharmaceutics' }
        });
        console.log("Created department: Pharmaceutics");
    } else {
        console.log("Found department: Pharmaceutics");
    }

    // 2. Read JSON
    const facultyData = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted_faculty.json'), 'utf-8'));
    const coursesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted_courses.json'), 'utf-8'));

    // 3. Process Faculty
    console.log(`Processing ${facultyData.length} faculty members...`);
    const teacherIds: string[] = [];
    
    for (const fac of facultyData) {
        if (!fac.email || !fac.email.includes('@')) continue; // skip invalid emails
        
        let user = await prisma.user.findUnique({
            where: { email: fac.email }
        });
        
        if (!user) {
            user = await prisma.user.create({
                data: {
                    name: fac.name || fac.email.split('@')[0],
                    email: fac.email,
                    password: "Softsols@123", // Default password per requirements
                    role: "TEACHER",
                    departmentId: dept.id,
                    designation: fac.designation || null,
                    qualification: fac.qualification || null,
                    yearOfAssociation: fac.yearOfAssociation || null,
                    phoneNumber: fac.phone || null,
                }
            });
            console.log(`Created teacher: ${user.name} (${user.email})`);
        } else {
            console.log(`Found teacher: ${user.name}`);
        }
        teacherIds.push(user.id);
    }

    // 4. Process Courses
    console.log(`Processing ${coursesData.length} courses...`);
    let idx = 0;
    for (const course of coursesData) {
        if (!course.code || !course.title) continue;
        
        // Randomly assign a teacher for demo, or assign the first one
        const teacherId = teacherIds[idx % teacherIds.length] || null;
        if (!teacherId) break;

        const creditHours = parseFloat(course.creditHours) || 0;

        let dbCourse = await prisma.course.findUnique({
            where: { code: course.code }
        });

        if (!dbCourse) {
            dbCourse = await prisma.course.create({
                data: {
                    name: course.title,
                    code: course.code,
                    departmentId: dept.id,
                    teacherId: teacherId,
                    professional: course.professional,
                    semesterName: course.semester,
                    creditHours: creditHours,
                    category: course.category
                }
            });
            console.log(`Created course: ${dbCourse.code}`);
        } else {
            // Update existing with new fields
            await prisma.course.update({
                where: { id: dbCourse.id },
                data: {
                    professional: course.professional,
                    semesterName: course.semester,
                    creditHours: creditHours,
                    category: course.category
                }
            });
            console.log(`Updated course: ${dbCourse.code}`);
        }
        idx++;
    }

    console.log("Seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
