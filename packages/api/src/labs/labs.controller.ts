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
      where: { id },
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
    const lab = await prisma.lab.findUnique({ where: { id } });
    if (!lab) return res.status(404).json({ message: 'Lab not found' });

    let resultData = {};
    
    // Simulation Logic
    if (lab.title.includes('Dissolution')) {
      // Release (%) = k * sqrt(time) * (RPM/50)
      const timePoints = [0, 5, 10, 15, 30, 45, 60];
      const rpmFactor = (inputs.rpm || 50) / 50;
      const k = inputs.tabletType === 'Sustained' ? 5 : 12;
      
      resultData = timePoints.map(t => ({
        time: t,
        release: Math.min(100, parseFloat((k * Math.sqrt(t) * rpmFactor).toFixed(2)))
      }));
    } else if (lab.title.includes('Tablet')) {
      const binder = inputs.binder || 5;
      const hardness = (binder * 2).toFixed(2);
      const disintegration = (20 / binder).toFixed(2);
      resultData = { hardness, disintegration, status: 'Success' };
    } else if (lab.title.includes('Emulsion')) {
      const isStable = inputs.oilRatio > 0.3 && inputs.oilRatio < 0.7;
      resultData = { stability: isStable ? 'Stable' : 'Unstable', score: isStable ? 85 : 30 };
    }

    const experiment = await prisma.experiment.create({
      data: {
        labId: id,
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

// Submit Assessment
router.post('/:id/assessment/:assessmentId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { assessmentId } = req.params;
    const { answers, score } = req.body;
    
    const result = await prisma.assessmentResult.create({
      data: {
        assessmentId,
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

export default router;
