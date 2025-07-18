import express from 'express';
import chapterRoutes from './chapter';
import levelRoutes from './level';
import performanceRoutes from './performance';
import adminRoutes from './admin';
const router = express.Router();

console.log("Routes loaded");
router.use('/chapters', chapterRoutes);
router.use('/levels', levelRoutes);
router.use('/performance', performanceRoutes);
router.use('/admin', adminRoutes);

export default router;

