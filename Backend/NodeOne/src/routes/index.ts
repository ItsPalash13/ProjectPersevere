import express from 'express';
import reportRoutes from './report';
import chapterRoutes from './chapter';
import levelRoutes from './level';
const router = express.Router();

console.log("Routes loaded");
router.use('/report', reportRoutes);
router.use('/chapters', chapterRoutes);
router.use('/levels', levelRoutes);

export default router;

