import { Router, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, authorizeRoles, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// Get all labs grouped by department
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const labs = await prisma.lab.findMany({
      include: {
        experiments: {
          where: { studentId: req.user?.userId }
        }
      }
    });
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching labs', error });
  }
});

// Get a specific lab with theory and experiments
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lab = await prisma.lab.findUnique({
      where: { id: String(id) },
      include: {
        experiments: {
          where: { studentId: req.user?.userId },
          include: { observations: true }
        },
        assessments: true
      }
    });
    if (!lab) return res.status(404).json({ message: 'Lab not found' });
    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lab details', error });
  }
});

// Start a new experiment
router.post('/:id/experiment', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { inputs } = req.body; // e.g., { tabletType: 'Paracetamol', rpm: 50, temp: 37 }
    
    // Logic for Simulation based on Lab Type
    const lab = await prisma.lab.findUnique({ where: { id: String(id) } });
    if (!lab) return res.status(404).json({ message: 'Lab not found' });

    let resultData = {};
    
    // Simulation Logic
    if (lab.title.includes('Dissolution')) {
      // Release (%) = k * sqrt(time) * (RPM/50)
      const timePoints = [0, 5, 10, 15, 30, 45, 60];
      const rpmFactor = (inputs.rpm || 50) / 50;
      const k = inputs.tabletType === 'Modified' ? 5 : 12;
      
      resultData = timePoints.map(t => ({
        time: t,
        release: Math.min(100, parseFloat((k * Math.sqrt(t) * rpmFactor).toFixed(2)))
      }));
    } else if (lab.title.includes('Tablet')) {
      const binder = inputs.binder || 5;
      const hardness = (binder * 2).toFixed(2);
      const disintegration = (20 / binder).toFixed(2);
      resultData = { hardness, disintegration, status: 'Success' };
    } else if (lab.title.includes('Titration')) {
      // Back titration: Content = (V_NaOH * C_NaOH - V_HCl * C_HCl) * MW_Aspirin
      const vNaOH = 50; // mL
      const cNaOH = 0.5; // M
      const vHCl = inputs.titrantVolume || 20; // Student input
      const cHCl = 0.5; // M
      const molesAspirin = (vNaOH * cNaOH - vHCl * cHCl) / 1000;
      const weightAspirin = molesAspirin * 180.16; // g
      const purity = (weightAspirin / 0.5) * 100; // Assumed 500mg tablet
      resultData = { purity: purity.toFixed(2), weight: weightAspirin.toFixed(3), status: purity > 95 ? 'Passed' : 'Failed' };
    } else if (lab.title.includes('Spectrophotometry')) {
      // Beer-Lambert: Abs = slope * Conc + intercept
      const conc = inputs.concentration || 10; // mcg/mL
      const absorbance = (0.052 * conc + 0.001).toFixed(3);
      resultData = { absorbance, wavelength: 243, unit: 'mcg/mL' };
    } else if (lab.title.includes('HPLC')) {
      // Simple peak area simulation
      const conc = inputs.concentration || 100;
      const area = (conc * 12500).toFixed(0);
      resultData = { retentionTime: 4.25, peakArea: area, resolution: 1.8 };
    } else if (lab.title.includes('Organ Bath')) {
      // Emax model: Effect = (Emax * C) / (EC50 + C)
      const dose = inputs.dose || 1e-6;
      const antagonist = inputs.atropine ? 1e-7 : 0;
      const ec50 = antagonist ? 5e-6 : 5e-7;
      const effect = (100 * dose) / (ec50 + dose);
      resultData = { contraction: effect.toFixed(2), unit: '%' };
    } else if (lab.title.includes('Emulsion')) {
      const isStable = inputs.oilRatio > 0.3 && inputs.oilRatio < 0.7;
      resultData = { stability: isStable ? 'Stable' : 'Unstable', score: isStable ? 85 : 30 };
    }

    const experiment = await prisma.experiment.create({
      data: {
        labId: String(id),
        studentId: req.user!.userId,
        status: 'COMPLETED',
        inputs,
        resultData
      }
    });

    res.status(201).json(experiment);
  } catch (error) {
    res.status(500).json({ message: 'Error starting simulation', error });
  }
});
 
// Simulation Alias (Compatibility with Frontend)
router.post('/:id/simulate', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { ...inputs } = req.body;
    
    const lab = await prisma.lab.findUnique({ where: { id: String(id) } });
    if (!lab) return res.status(404).json({ message: 'Lab not found' });

    let resultData: any = {};
    
    if (lab.title.includes('Dissolution')) {
      const timePoints = [0, 5, 10, 15, 30, 45, 60];
      const rpmFactor = (inputs.rpm || 100) / 100;
      const k = inputs.type === 'Modified' ? 5 : 12;
      resultData = timePoints.map(t => ({
        time: t,
        release: Math.min(100, parseFloat((k * Math.sqrt(t) * rpmFactor).toFixed(2)))
      }));
    } else if (lab.title.includes('Tablet')) {
       const binder = inputs.binder || 5;
       resultData = { hardness: (binder * 2).toFixed(2), disintegration: (20 / binder).toFixed(2), status: 'Success' };
    } else if (lab.title.includes('Emulsion')) {
       const isStable = inputs.ratio === '4:2:1';
       resultData = { stability: isStable ? 'Stable' : 'Unstable', score: isStable ? 85 : 30 };
    } else {
       // Generic result for other labs
       resultData = { status: 'Simulation Complete', timestamp: new Date() };
    }

    // Save Experiment to DB
    const experiment = await prisma.experiment.create({
      data: {
        labId: String(id),
        studentId: req.user!.userId,
        status: 'IN_PROGRESS',
        inputs,
        resultData
      }
    });

    res.json({ results: resultData, resultData, experimentId: experiment.id });
  } catch (error) {
    res.status(500).json({ message: 'Error in simulation', error });
  }
});

// Save Observations (Digital Lab Notebook)
router.post('/:experimentId/observations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { experimentId } = req.params;
    const { observations } = req.body; // Array of { timeStep, reading, notes }

    if (!Array.isArray(observations)) {
      return res.status(400).json({ message: 'Observations must be an array' });
    }

    // Bulk create observations
    const created = await prisma.observation.createMany({
      data: observations.map(obs => ({
        experimentId: String(experimentId),
        timeStep: typeof obs.time === 'string' ? parseFloat(obs.time.replace('T+', '')) || 0 : obs.time || 0,
        reading: parseFloat(obs.reading) || 0,
        notes: obs.notes || ''
      }))
    });

    // Update experiment status
    await prisma.experiment.update({
      where: { id: String(experimentId) },
      data: { status: 'SUBMITTED' }
    });

    res.json({ message: 'Observations saved successfully', count: created.count });
  } catch (error) {
    res.status(500).json({ message: 'Error saving observations', error });
  }
});

// Get Submissions for Faculty
router.get('/submissions/all', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const submissions = await prisma.experiment.findMany({
      include: {
        lab: true,
        student: {
          select: { name: true, email: true, department: true }
        },
        observations: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching submissions', error });
  }
});

// Grade Experiment
router.post('/experiments/:id/grade', authenticateToken, authorizeRoles('SUPER_ADMIN', 'DEPT_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { grade, feedback } = req.body;

    const updated = await prisma.experiment.update({
      where: { id: String(id) },
      data: { 
        grade: parseFloat(grade),
        feedback,
        status: 'GRADED'
      }
    });

    res.json({ message: 'Experiment graded successfully', experiment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error grading experiment', error });
  }
});

// Update lab details (Super Admin or Teacher)
router.put('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, department, provider, difficulty, theory, objectives, safety, year, multimediaContent } = req.body;
    
    const lab = await prisma.lab.update({
      where: { id: String(id) },
      data: { title, description, department, provider, difficulty, theory, objectives, safety, year, multimediaContent }
    });
    
    res.json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Error updating lab', error });
  }
});

// Create new lab (Super Admin or Teacher)
router.post('/', authenticateToken, authorizeRoles('SUPER_ADMIN', 'TEACHER'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, department, provider, difficulty, theory, objectives, safety, year, multimediaContent } = req.body;
    
    const lab = await prisma.lab.create({
      data: { title, description, department, provider, difficulty, theory, objectives, safety, year, multimediaContent }
    });
    
    res.status(201).json(lab);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lab', error });
  }
});

// Student Manual Submission (Results & Observations)
router.post('/experiments/:id/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { studentResult, studentObservation } = req.body;

    const updated = await prisma.experiment.update({
      where: { id: String(id) },
      data: { 
        studentResult,
        studentObservation,
        status: 'SUBMITTED',
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Manual submission recorded', experiment: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error recording manual submission', error });
  }
});

// Submit Assessment (Existing - Keep for compatibility)
router.post('/:id/assessment/:assessmentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { answers, score } = req.body;
    
    const result = await prisma.assessmentResult.create({
      data: {
        assessmentId: String(assessmentId),
        studentId: req.user!.userId,
        score,
        answers
      }
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error submitting assessment', error });
  }
});

// Delete lab (Super Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('SUPER_ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.lab.delete({
      where: { id: String(id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lab', error });
  }
});

export default router;
