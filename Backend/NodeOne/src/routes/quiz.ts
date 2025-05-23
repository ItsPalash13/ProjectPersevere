import express, { Request, Response } from 'express';
import { Userts } from '../models/UserTs';
import { QuestionTs } from '../models/QuestionTs';
import { Question } from '../models/Questions';
import { UserQuesAnsLog } from '../models/UserQuesAnsLog';
import { getQuestionMuForWinProb} from '../utils/math';
import { Rating, rate_1vs1 } from 'ts-trueskill';
import authMiddleware from '../middleware/authMiddleware';

const router = express.Router();
router.use(authMiddleware);
router.get('/question', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const QUESTION_SIGMA = 300;  // Default question uncertainty

        const TARGET_WIN_PROB = Math.random() < 0.8
    ? Math.random() * (0.55 - 0.35) + 0.35  // 80%: 0.35 - 0.55
    : Math.random() < 0.5
        ? Math.random() * (0.35 - 0.20) + 0.20  // 10%: 0.20 - 0.35
        : Math.random() * (0.70 - 0.55) + 0.55; // 10%: 0.55 - 0.70



        // Get student's TrueSkill rating
        const student = await Userts.findOne({ userId });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Calculate target question mu for selected win probability
        const targetQuestionMu = getQuestionMuForWinProb(
            student.skill.mu,
            student.skill.sigma,
            TARGET_WIN_PROB,
            QUESTION_SIGMA
        );

        // Find one question with difficulty mu just greater than or equal to target
        const questionTs = await QuestionTs.findOne({
            'difficulty.mu': { $gte: targetQuestionMu }
        }).sort({ 'difficulty.mu': 1 }).populate('quesId');
        
        if (!questionTs) {
            return res.status(404).json({ error: 'No suitable question found for the given target win probability' });
        }

        // Get the full question details
        const question = await Question.findById(questionTs.quesId);
        if (!question) {
            return res.status(404).json({ error: 'Question details not found' });
        }

        return res.json({
            studentSkill: {
                mu: student.skill.mu,
                sigma: student.skill.sigma
            },
            targetQuestionMu,
            targetWinProb: TARGET_WIN_PROB,
            question: {
                id: question._id,
                text: question.ques,
                options: question.options,
                topic: question.topic,
                difficulty: questionTs.difficulty,
                correct: question.correct
            }
        });

    } catch (error) {
        console.error('Error fetching question:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/answer', async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { questionId, userAnswer } = req.body;

        // Get user's current TrueSkill rating
        const user = await Userts.findOne({ userId });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get question and its TrueSkill rating
        const questionTs = await QuestionTs.findOne({ quesId: questionId });
        if (!questionTs) {
            return res.status(404).json({ error: 'Question not found' });
        }

        // Get question details
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ error: 'Question details not found' });
        }

        // Check if answer is correct
        const isCorrect = userAnswer === question.correct;

        // Create ratings using Rating class with proper type handling
        const userRating = new Rating([user.skill.mu, user.skill.sigma]);
        const questionRating = new Rating([questionTs.difficulty.mu, questionTs.difficulty.sigma]);
        
        let newUserRating, newQuestionRating;
        if (isCorrect) {
            // User wins - user rating should increase, question rating should decrease
            [newUserRating, newQuestionRating] = rate_1vs1(userRating, questionRating);
        } else {
            // Question wins - user rating should decrease, question rating should increase
            [newQuestionRating, newUserRating] = rate_1vs1(questionRating, userRating);
        }
        
        // Save previous ratings for logging
        const userPrevTs = { mu: user.skill.mu, sigma: user.skill.sigma };
        const quesPrevTs = { mu: questionTs.difficulty.mu, sigma: questionTs.difficulty.sigma };

        // Update user's TrueSkill rating
        user.skill.mu = newUserRating.mu;
        user.skill.sigma = newUserRating.sigma;
        await user.save();

        // Update question's TrueSkill rating
        questionTs.difficulty.mu = newQuestionRating.mu;
        questionTs.difficulty.sigma = newQuestionRating.sigma;
        await questionTs.save();

        // Log the interaction
        const log = new UserQuesAnsLog({
            userId: userId,
            quesId: questionId,
            userPrevTs,
            userNewTs: { mu: newUserRating.mu, sigma: newUserRating.sigma },
            quesPrevTs,
            quesNewTs: { mu: newQuestionRating.mu, sigma: newQuestionRating.sigma },
            questionData: {
                options: question.options,
                correct: question.correct,
                userAns: userAnswer
            }
        });
        await log.save();

        return res.json({
            isCorrect,
            userNewRating: {
                mu: newUserRating.mu,
                sigma: newUserRating.sigma
            },
            questionNewRating: {
                mu: newQuestionRating.mu,
                sigma: newQuestionRating.sigma
            }
        });

    } catch (error) {
        console.error('Error processing answer:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
