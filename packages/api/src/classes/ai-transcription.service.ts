import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * MOCK AI Service to simulate Whispher/Deepgram transcription
 */
export async function transcribeAudio(recordingId: string) {
  try {
    const recording = await prisma.recording.findUnique({
      where: { id: recordingId },
      include: { class: true }
    });

    if (!recording) return;

    console.log(`[AI Worker] Transcribing recording ${recordingId} for class: ${recording.class.title}`);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockTranscript = `Transcript for ${recording.class.title}:
    Teacher: Welcome class. Today we will discuss the mechanism of action for Beta Blockers.
    Teacher: Beta blockers, also known as beta-adrenergic blocking agents, are medications that reduce blood pressure.
    Teacher: They work by blocking the effects of the hormone epinephrine, also known as adrenaline.
    Teacher: When you take beta blockers, your heart beats more slowly and with less force, which lowers blood pressure.
    Teacher: Let's look at the specific receptors involved...`;

    await prisma.recording.update({
      where: { id: recordingId },
      data: { transcript: mockTranscript }
    });

    console.log(`[AI Worker] Transcription completed for ${recordingId}`);
  } catch (error) {
    console.error(`[AI Worker] Error transcribing ${recordingId}:`, error);
  }
}
