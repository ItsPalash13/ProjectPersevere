import express from 'express';
import adminSubjectRoutes from './subject';
import adminChapterRoutes from './chapter';
import adminTopicRoutes from './topics';
import adminUnitRoutes from './units';
import adminQuestionRoutes from './questions';
import adminLevelRoutes from './levels';
import adminUserRoutes from './users';
import adminBadgeRoutes from './badge';

const router = express.Router();

router.use('/subjects', adminSubjectRoutes);
router.use('/chapters', adminChapterRoutes);
router.use('/topics', adminTopicRoutes);
router.use('/units', adminUnitRoutes);
router.use('/questions', adminQuestionRoutes);
router.use('/levels', adminLevelRoutes);
router.use('/users', adminUserRoutes);
router.use('/badges', adminBadgeRoutes);

export default router;