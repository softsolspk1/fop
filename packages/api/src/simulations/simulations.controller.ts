import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../auth/auth.middleware';
import { simulateDissolution, simulateTablet, simulateEmulsion } from './engine';

const router = Router();

// 1. Dissolution Test Simulation
router.post('/dissolution/simulate', authenticateToken, (req: Request, res: Response) => {
    try {
        const { temp, rpm, solubility, samplingInterval, totalTime } = req.body;
        const results = simulateDissolution({ 
            temp: temp || 37, 
            rpm: rpm || 50, 
            solubility: solubility || 0.5, 
            samplingInterval: samplingInterval || 5, 
            totalTime: totalTime || 60 
        });
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: "Dissolution simulation failed", error: error.message });
    }
});

// 2. Tablet Formulation Simulation
router.post('/tablet/simulate', authenticateToken, (req: Request, res: Response) => {
    try {
        const results = simulateTablet(req.body);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: "Tablet simulation failed", error: error.message });
    }
});

// 3. Emulsion Preparation Simulation
router.post('/emulsion/simulate', authenticateToken, (req: Request, res: Response) => {
    try {
        const results = simulateEmulsion(req.body);
        res.json(results);
    } catch (error: any) {
        res.status(500).json({ message: "Emulsion simulation failed", error: error.message });
    }
});

// Save Real-time Observation (Labster-style tracking)
router.post('/save-observation', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { labType, data } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const observation = await prisma.labObservation.create({
            data: {
                userId,
                labType,
                data: data || {}
            }
        });

        res.json({ message: "Observation captured", observation });
    } catch (error: any) {
        res.status(500).json({ message: "Error saving observation", error: error.message });
    }
});

/**
 * Advanced Analytics: Get student lab performance
 */
router.get('/analytics/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.params.userId as string;
        
        const observations = await prisma.labObservation.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        const experimentStats = await prisma.experiment.findMany({
            where: { studentId: userId },
            include: { lab: true }
        });

        res.json({
            observations,
            experiments: experimentStats,
            completionRate: experimentStats.length > 0 ? (experimentStats.filter(e => e.status === 'COMPLETED').length / experimentStats.length) * 100 : 0,
            averageScore: experimentStats.length > 0 ? experimentStats.reduce((acc, curr) => acc + (curr.grade || 0), 0) / experimentStats.length : 0
        });
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
});

/**
 * Submit Final Experiment Result
 */
router.post('/submit', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { labId, inputs, resultData, score } = req.body;
        const userId = req.user?.userId;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const experiment = await prisma.experiment.create({
            data: {
                labId,
                studentId: userId,
                status: 'COMPLETED',
                inputs: inputs || {},
                resultData: resultData || {},
                grade: score || 0,
                feedback: score >= 80 ? "Excellent Laboratory Work" : "Performance requires improvement"
            }
        });

        res.json({ message: "Experiment submitted successfully", experiment });
    } catch (error: any) {
        res.status(500).json({ message: "Error submitting experiment", error: error.message });
    }
});

export default router;
