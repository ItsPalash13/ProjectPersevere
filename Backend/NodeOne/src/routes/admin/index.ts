import express from 'express';
import adminSubjectRoutes from './subject';
import adminChapterRoutes from './chapter';
import adminTopicRoutes from './topics';
import adminUnitRoutes from './units';
import adminQuestionRoutes from './questions';

const router = express.Router();

router.use('/subjects', adminSubjectRoutes);
router.use('/chapters', adminChapterRoutes);
router.use('/topics', adminTopicRoutes);
router.use('/units', adminUnitRoutes);
router.use('/questions', adminQuestionRoutes);

export default router;