import express from 'express';
import { Topic } from '../../models/Topic';
import { Unit } from '../../models/Units';

const router = express.Router();

// List topics (optionally filter by chapterId)
router.get('/', async (req, res) => {
  try {
    const { chapterId } = req.query;
    const filter = chapterId ? { chapterId } : {};
    const topics = await Topic.find(filter);
    res.status(200).json({ success: true, data: topics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add topics (multi-add, check for duplicates)
router.post('/', async (req, res) => {
  try {
    const { chapterId, names } = req.body;
    if (!chapterId || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ success: false, error: 'chapterId and names (array) are required' });
    }
    // Find existing topics in this chapter
    const existingTopics = await Topic.find({ chapterId, topic: { $in: names } });
    const existingNames = new Set(existingTopics.map(t => t.topic));
    const toCreate = names.filter(name => !existingNames.has(name));
    const duplicates = names.filter(name => existingNames.has(name));
    // Create new topics
    const created = await Topic.insertMany(toCreate.map(name => ({ chapterId, topic: name })), { ordered: false }).catch(() => []);
    res.status(201).json({ success: true, created, duplicates });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update a topic
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const topic = await Topic.findByIdAndUpdate(id, { topic: name }, { new: true, runValidators: true });
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    res.status(200).json({ success: true, data: topic });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a topic (and remove from all units' topics arrays)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByIdAndDelete(id);
    if (!topic) return res.status(404).json({ success: false, error: 'Topic not found' });
    // Remove topic from all units' topics arrays
    await Unit.updateMany(
      { topics: id },
      { $pull: { topics: id } }
    );
    res.status(200).json({ success: true, message: 'Topic deleted and removed from units' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
