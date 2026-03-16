import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MOCK Plagiarism Detection Service (Simulating Copyleaks/Turnitin)
 */
export async function checkPlagiarism(submissionId: string) {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true, student: true }
    });

    if (!submission) return;

    console.log(`[Plagiarism Worker] Checking submission ${submissionId} for student: ${submission.student.name}`);

    // Simulate API processing delay
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Generate a random similarity score for demonstration
    const similarityScore = Math.floor(Math.random() * 15); // Usually low for legitimate students
    
    // In a real scenario, we would store this score in the DB
    // For now, let's assume we update the submission status or a metadata field
    console.log(`[Plagiarism Worker] Completed for ${submissionId}. Score: ${similarityScore}%`);

    return similarityScore;
  } catch (error) {
    console.error(`[Plagiarism Worker] Error checking ${submissionId}:`, error);
  }
}
