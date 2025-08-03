import express from 'express';
import { Subject } from '../../models/Subject';
import { Request, Response } from 'express';

const router = express.Router();

// Get all subjects
router.get('/', async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: subjects.length, data: subjects });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Create a new subject
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, description, slug, status } = req.body;
    const subject = new Subject({ name, description, slug, status });
    await subject.save();
    return res.status(201).json({ success: true, data: subject });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Update a subject
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, slug, status } = req.body;
    const subject = await Subject.findByIdAndUpdate(
      id,
      { name, description, slug, status },
      { new: true, runValidators: true }
    );
    if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
    return res.status(200).json({ success: true, data: subject });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a subject
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
    return res.status(200).json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

export default router;
