import prisma from './prisma';

export async function sendNotification({
  title,
  content,
  courseId,
  senderId,
  targetRole = 'STUDENT'
}: {
  title: string;
  content: string;
  courseId: string;
  senderId: string;
  targetRole?: any;
}) {
  try {
    // We'll use the Announcement model as a "notification" for now
    await prisma.announcement.create({
      data: {
        title,
        content,
        courseId,
        senderId,
        targetRole,
        // We can also target by department if we fetch the course first
      }
    });
    console.log(`[Notification]: Created for course ${courseId}: ${title}`);
  } catch (error) {
    console.error('[Notification]: Error creating notification:', error);
  }
}
