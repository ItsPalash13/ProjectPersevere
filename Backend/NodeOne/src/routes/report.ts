import express, { Request, Response } from 'express';
import { UserQuesAnsLog } from '../models/UserQuesAnsLog';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();
router.use(authMiddleware);

router.get('/history', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        
        // Get the last 50 interactions for the user
        const history = await UserQuesAnsLog.find({ userId })
            .sort({ timestamp: 1 })
            .limit(50)
            .populate('quesId', 'ques');

        const userHistory = history.map(log => ({
            timestamp: log.timestamp,
            mu: log.userNewTs.mu,
            sigma: log.userNewTs.sigma
        }));

        const questionHistory = history.map(log => ({
            timestamp: log.timestamp,
            questionId: log.quesId,
            questionText: (log.quesId as any).ques,
            mu: log.quesPrevTs.mu,
            sigma: log.quesPrevTs.sigma
        }));

        return res.json({
            userHistory,
            questionHistory
        });

    } catch (error) {
        console.error('Error fetching report history:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
