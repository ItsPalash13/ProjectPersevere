import express from 'express';
import adminSubjectRoutes from './subject';
import adminChapterRoutes from './chapter';
import adminTopicRoutes from './topics';
import adminUnitRoutes from './units';

const router = express.Router();

router.use('/subjects', adminSubjectRoutes);
router.use('/chapters', adminChapterRoutes);
router.use('/topics', adminTopicRoutes);
router.use('/units', adminUnitRoutes);

export default router;