import express from 'express';
import quizRoutes from './quiz';
import reportRoutes from './report';
const router = express.Router();

console.log("Routes loaded");
router.use('/quiz', quizRoutes);
router.use('/report', reportRoutes);

export default router;

