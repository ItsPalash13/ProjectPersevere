import express from 'express';
import adminSubjectRoutes from './subject';
import adminChapterRoutes from './chapter';
import adminTopicRoutes from './topics';

const router = express.Router();

router.use('/subjects', adminSubjectRoutes);
router.use('/chapters', adminChapterRoutes);
router.use('/topics', adminTopicRoutes);

export default router;