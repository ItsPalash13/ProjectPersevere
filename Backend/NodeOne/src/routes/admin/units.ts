import express from 'express';
import { Unit } from '../../models/Units';
import { Level } from '../../models/Level';
import { Request, Response } from 'express';

const router = express.Router();

// Create a unit
router.post('/', async (req: Request, res: Response) => {
  try {
    const { chapterId, name, description, topics, status } = req.body;
    if (!chapterId || !name || !description || !Array.isArray(topics)) {
      return res.status(400).json({ success: false, error: 'chapterId, name, description, and topics (array) are required' });
    }
    const unit = new Unit({ chapterId, name, description, topics, status: status ?? true });
    await unit.save();
    return res.status(201).json({ success: true, data: unit });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Update a unit
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, topics, status } = req.body;
    const unit = await Unit.findByIdAndUpdate(
      id,
      { name, description, topics, status },
      { new: true, runValidators: true }
    );
    if (!unit) return res.status(404).json({ success: false, error: 'Unit not found' });
    return res.status(200).json({ success: true, data: unit });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a unit
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) return res.status(404).json({ success: false, error: 'Unit not found' });
    return res.status(200).json({ success: true, message: 'Unit deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// List units (optionally filter by chapterId)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.query;
    const filter = chapterId ? { chapterId } : {};
    const units = await Unit.find(filter);
    return res.status(200).json({ success: true, data: units });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get all levels for a unit (with difficulty params)
router.get('/:unitId/levels', async (req: Request, res: Response) => {
  try {
    const { unitId } = req.params;
    const levels = await Level.find({ unitId })
      .select('name levelNumber difficultyParams');
      return res.status(200).json({ success: true, data: levels });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
