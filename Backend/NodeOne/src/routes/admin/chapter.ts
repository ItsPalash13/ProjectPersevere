import express from 'express';
import { Chapter } from '../../models/Chapter';
import { Unit } from '../../models/Units';
import { Topic } from '../../models/Topic';
import { Request, Response } from 'express';

const router = express.Router();

// Create a new chapter
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, gameName, status, subjectId, thumbnailUrl } = req.body;
    const chapter = new Chapter({ name, description, gameName, status, subjectId, thumbnailUrl });
    await chapter.save();
    return res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Update a chapter
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, gameName, status, subjectId, thumbnailUrl } = req.body;
    const chapter = await Chapter.findByIdAndUpdate(
      id,
      { name, description, gameName, status, subjectId, thumbnailUrl },
      { new: true, runValidators: true }
    );
    if (!chapter) return res.status(404).json({ success: false, error: 'Chapter not found' });
    return res.status(200).json({ success: true, data: chapter });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Get a chapter with all its units, topics, and subject
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);
    if (!chapter) return res.status(404).json({ success: false, error: 'Chapter not found' });
    // Get all units for this chapter
    const units = await Unit.find({ chapterId: id });
    // For each unit, fetch its topics
    const unitsWithTopics = await Promise.all(units.map(async (unit) => {
      const unitTopics = await Topic.find({ _id: { $in: unit.topics } }).select('topic');
      return {
        ...unit.toObject(),
        topics: unitTopics.map(t => t.topic)
      };
    }));
    // Get chapter topics
    const topics = await Topic.find({ chapterId: id }).select('topic');
    return res.status(200).json({ success: true, data: { ...chapter.toObject(), units: unitsWithTopics, topics: topics.map(t => t.topic) } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
