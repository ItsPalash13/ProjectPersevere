import express from 'express';
import Badge from '../../models/Badge';

const router = express.Router();

// Create Badge
router.post('/', async (req, res) => {
  try {
    const badgeData = req.body;
    // Ensure badgelevel is an array of objects if provided
    if (badgeData.badgelevel && Array.isArray(badgeData.badgelevel)) {
      badgeData.badgelevel = badgeData.badgelevel.map((lvl: any) => ({
        milestone: Number(lvl.milestone),
        badgeImage: lvl.badgeImage,
      }));
    }
    const badge = new Badge(badgeData);
    await badge.save();
    res.status(201).json(badge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update Badge
router.put('/:id', async (req, res) => {
  try {
    const badgeData = req.body;
    if (badgeData.badgelevel && Array.isArray(badgeData.badgelevel)) {
      badgeData.badgelevel = badgeData.badgelevel.map((lvl: any) => ({
        milestone: Number(lvl.milestone),
        badgeImage: lvl.badgeImage,
      }));
    }
    const badge = await Badge.findByIdAndUpdate(req.params.id, badgeData, { new: true });
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json(badge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Badge
router.delete('/:id', async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return res.status(404).json({ error: 'Badge not found' });
    res.json({ message: 'Badge deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all Badges
router.get('/', async (req, res) => {
  try {
    const badges = await Badge.find();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
