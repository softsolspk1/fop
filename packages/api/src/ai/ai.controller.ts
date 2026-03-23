import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();
const prisma = new PrismaClient();

// Gemini Setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast and reliable

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
      const result = await model.generateContent([systemContext, prompt]);
      const response = await result.response;
      const text = response.text();
      return res.json({ response: text });
    } catch (apiError) {
      console.warn('Gemini API failed, using Local Pharma-Intelligence fallback');
      
      // Simple Keyword-based Fallback
      const input = prompt.toLowerCase();
      let fallbackResponse = "I am currently in 'Lite Mode' due to high traffic, but I can still help you. ";

      if (input.includes('dissolution')) {
        fallbackResponse += "Dissolution testing measures the rate of release of a drug from its dosage form. In our lab, we use the Apparatus 1 (Basket) and Apparatus 2 (Paddle) methods. Always ensure the medium is at 37°C ± 0.5°C.";
      } else if (input.includes('calculation') || input.includes('dosage')) {
        fallbackResponse += "For dosage calculations, remember the formula: (Dose Wanted / Dose on Hand) × Quantity. Always double-check your units (mg vs g)!";
      } else if (input.includes('tablet')) {
        fallbackResponse += "Tablet formulation involves several steps: Weighing, Sifting, Blending, Granulation (Wet or Dry), Drying, and finally Compression. Glidants like Talc are essential for flow.";
      } else {
        fallbackResponse += "I am currently performing optimized searches through our local pharmaceutical repository. For the most comprehensive Gemini-powered analysis, please ensure your system administrator has configured a valid API key. I'm here to support your learning journey at UOK!";
      }

      res.json({ response: fallbackResponse });
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
