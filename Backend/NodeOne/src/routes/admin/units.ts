import express from 'express';
import { Unit } from '../../models/Units';

const router = express.Router();

// Create a unit
router.post('/', async (req, res) => {
  try {
    const { chapterId, name, description, topics, status } = req.body;
    if (!chapterId || !name || !description || !Array.isArray(topics)) {
      return res.status(400).json({ success: false, error: 'chapterId, name, description, and topics (array) are required' });
    }
    const unit = new Unit({ chapterId, name, description, topics, status: status ?? true });
    await unit.save();
    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Update a unit
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, topics, status } = req.body;
    const unit = await Unit.findByIdAndUpdate(
      id,
      { name, description, topics, status },
      { new: true, runValidators: true }
    );
    if (!unit) return res.status(404).json({ success: false, error: 'Unit not found' });
    res.status(200).json({ success: true, data: unit });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Delete a unit
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByIdAndDelete(id);
    if (!unit) return res.status(404).json({ success: false, error: 'Unit not found' });
    res.status(200).json({ success: true, message: 'Unit deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// List units (optionally filter by chapterId)
router.get('/', async (req, res) => {
  try {
    const { chapterId } = req.query;
    const filter = chapterId ? { chapterId } : {};
    const units = await Unit.find(filter);
    res.status(200).json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
