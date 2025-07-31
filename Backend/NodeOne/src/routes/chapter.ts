import express from 'express';
import { Chapter } from '../models/Chapter';
import { Subject } from '../models/Subject';
import { Topic } from '../models/Topic';

const router = express.Router();

// Get all chapters
router.get('/', async (_req, res) => {
  try {
    const chapters = await Chapter.find()
      .select('name description gameName status subjectId thumbnailUrl')
      .sort({ createdAt: -1 });

    // Fetch topics and subject for each chapter
    const chaptersWithTopics = await Promise.all(
      chapters.map(async (chapter) => {
        const topics = await Topic.find({ chapterId: chapter._id }).select('topic');
        const subject = await Subject.findById(chapter.subjectId).select('name _id slug');
        return {
          ...chapter.toObject(),
          topics: topics.map(topic => topic.topic),
          subject,
          isActive: chapter.status === true
        };
      })
    );

    res.status(200).json({
      success: true,
      count: chaptersWithTopics.length,
      data: chaptersWithTopics
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
      .select('name description gameName status thumbnailUrl subjectId')
      .sort({ createdAt: -1 });

    // Fetch topics and subject for each chapter
    const chaptersWithTopics = await Promise.all(
      chapters.map(async (chapter) => {
        const topics = await Topic.find({ chapterId: chapter._id }).select('topic');
        return {
          ...chapter.toObject(),
          topics: topics.map(topic => topic.topic),
          subject,
          isActive: chapter.status === true
        };
      })
    );

    res.status(200).json({
      success: true,
      subject: {
        name: subject.name,
        slug: subject.slug,
        description: subject.description
      },
      count: chaptersWithTopics.length,
      data: chaptersWithTopics
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
