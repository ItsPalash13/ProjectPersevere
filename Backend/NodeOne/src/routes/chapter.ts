import express from 'express';
import { Chapter } from '../models/Chapter';
import { Subject } from '../models/Subject';

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

// Get chapters by subject slug
router.get('/subject/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Find subject by slug
    const subject = await Subject.findOne({ slug: slug.toLowerCase() });
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    // Get all chapters for this subject
    const chapters = await Chapter.find({ subjectId: subject._id })
      .select('name description gameName topics status thumbnailUrl')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      subject: {
        name: subject.name,
        slug: subject.slug,
        description: subject.description
      },
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    console.error('Error fetching chapters by subject slug:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
});

export default router;
