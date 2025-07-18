import express from 'express';
import { Subject } from '../../models/Subject';

const router = express.Router();

// Get all subjects
router.get('/', async (_req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Create a new subject
router.post('/', async (req, res) => {
  try {
    const { name, description, slug, status } = req.body;
    const subject = new Subject({ name, description, slug, status });
    await subject.save();
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update a subject
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, slug, status } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      id,
      { name, description, slug, status },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
    res.status(200).json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a subject
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
    res.status(200).json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
