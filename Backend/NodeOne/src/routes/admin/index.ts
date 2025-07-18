import express from 'express';
import adminSubjectRoutes from './subject';
import adminChapterRoutes from './chapter';


const router = express.Router();

router.use('/subjects', adminSubjectRoutes);
router.use('/chapters', adminChapterRoutes);

export default router;