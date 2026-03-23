import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// 1. Dissolution Test Simulation
router.post('/dissolution/simulate', (req: Request, res: Response) => {
    const { rpm, timePoints, solubilityFactor } = req.body;

    const k = 5; // constant
    let results: any[] = [];

    if (Array.isArray(timePoints)) {
        timePoints.forEach(t => {
            let release = k * Math.sqrt(t) * (rpm / 50) * (solubilityFactor || 1);
            if (release > 100) release = 100;
            results.push({
                time: t,
                release: parseFloat(release.toFixed(2))
            });
        });
    }

    res.json(results);
});

// 2. Tablet Formulation Simulation
router.post('/tablet/simulate', (req: Request, res: Response) => {
    const { binder, disintegrant, lubricant } = req.body;

    let hardness = 5 + binder * 0.5 - lubricant * 0.2;
    let disintegration = 30 - disintegrant * 1.5 + binder * 0.5;
    let dissolution = 70 + disintegrant * 1.2 - binder * 0.7;

    res.json({
        hardness: parseFloat(hardness.toFixed(2)),
        disintegration: parseFloat(disintegration.toFixed(2)),
        dissolution: parseFloat(dissolution.toFixed(2))
    });
});

// 3. Emulsion Preparation Simulation
router.post('/emulsion/simulate', (req: Request, res: Response) => {
    const { oilRatio, emulsifier, speed } = req.body;

    let stabilityScore = 0;

    // Emulsifier effect
    if (emulsifier === "Tween") stabilityScore += 40;
    else if (emulsifier === "Span") stabilityScore += 30;
    else stabilityScore += 20;

    // Oil ratio effect
    stabilityScore += (100 - Math.abs(50 - oilRatio));

    // Mixing speed
    stabilityScore += speed * 0.5;

    let result = stabilityScore > 100 ? "Stable" : "Unstable";

    res.json({
        stabilityScore,
        result
    });
});

// Save Observation
// Using path '/' and authenticateToken to get user details
router.post('/save', authenticateToken, async (req: AuthRequest, res: Response) => {
    try {
        const { labType, data } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const observation = await prisma.labObservation.create({
            data: {
                userId,
                labType,
                data
            }
        });

        res.json({ message: "Saved", observation });
    } catch (error: any) {
        console.error("Error saving observation", error);
        res.status(500).json({ message: "Error saving observation", error: error.message });
    }
});

export default router;
