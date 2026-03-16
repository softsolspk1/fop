import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Transcription Mock (Whisper API Integration entry point)
router.post('/transcribe', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { recordingId } = req.body;
    
    // Simulate Whisper API latency
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTranscript = "This lecture covers the fundamental principles of pharmacology, focusing on pharmacokinetics and pharmacodynamics. We discuss how drugs move through the body and how they interact with receptors to produce biological effects.";
    
    const updatedRecording = await prisma.recording.update({
      where: { id: recordingId },
      data: { transcript: mockTranscript }
    });
    
    res.json({ message: 'Transcription complete', recording: updatedRecording });
  } catch (error) {
    res.status(500).json({ message: 'Error during transcription', error });
  }
});

// Plagiarism Check Mock
router.post('/check-plagiarism', authenticateToken, authorizeRoles('TEACHER', 'DEPT_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.body;
    
    // Simulate checking against database/web
    const plagiarismScore = Math.floor(Math.random() * 15); // Random score between 0 and 15%
    
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { plagiarism: plagiarismScore }
    });
    
    res.json({ message: 'Plagiarism check complete', score: plagiarismScore, submission: updatedSubmission });
  } catch (error) {
    res.status(500).json({ message: 'Error during plagiarism check', error });
  }
});

export default router;
