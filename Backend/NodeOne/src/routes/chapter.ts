import express from 'express';
import { Chapter } from '../models/Chapter';

const router = express.Router();

// Get all chapters
router.get('/', async (_, res) => {
  try {
    const chapters = await Chapter.find()
      .select('name description gameName topics status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

export default router;
