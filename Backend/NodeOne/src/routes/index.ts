import express from 'express';
import reportRoutes from './report';
import chapterRoutes from './chapter';
import levelRoutes from './level';
import inventoryRoutes from './inventory';

const router = express.Router();

console.log("Routes loaded");
router.use('/report', reportRoutes);
router.use('/chapters', chapterRoutes);
router.use('/levels', levelRoutes);
router.use('/inventory', inventoryRoutes);

export default router;

