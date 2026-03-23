import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import OpenAI from 'openai';

const router = Router();
const prisma = new PrismaClient();

// OpenAI Setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// AI Tutor Chat
router.post('/tutor', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const systemContext = `
      You are the official AI Pharma-Tutor for the Faculty of Pharmacy & Pharmaceutical Sciences, University of Karachi (UOK).
      Your role is to assist students with:
      1. Pharmaceutics calculations (Dosage, Allegation, Isotonicity).
      2. Virtual Lab experiments (Dissolution, Tablet Formulation, Emulsion).
      3. Pharmacology and Pharmacognosy concepts.
      4. Clarifying lecture notes and exam preparation.

      Guidelines:
      - Always provide accurate, evidence-based pharmaceutical information.
      - Use professional, academic, yet encouraging language.
      - If you are unsure about a specific UOK policy, advise the student to consult their Department Head.
      - Support formatting with markdown for clear steps and equations.
    `;

    try {
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-...') {
        return res.json({ 
          response: "I am ready to assist you! However, my 'OpenAI Brain' is currently disconnected. Please ask your administrator to add a valid OPENAI_API_KEY to the server environment variables. Once connected, I can provide full pharmaceutical analysis and calculations." 
        });
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemContext },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
      });

      const text = completion.choices[0].message.content;
      return res.json({ response: text });
    } catch (apiError: any) {
      console.error('OpenAI API Error:', apiError);
      return res.status(503).json({ 
        message: 'AI Service Temporarily Unavailable',
        error: apiError.message,
        response: "I'm having trouble reaching my OpenAI knowledge base. This usually happens if the API key is invalid or the quota is exceeded. Please check the server logs."
      });
    }
  } catch (error) {
    console.error('AI Tutor Critical Error:', error);
    res.status(500).json({ message: 'Pharma-Tutor is experiencing a system restart. Please try again in a few minutes.' });
  }
});


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
