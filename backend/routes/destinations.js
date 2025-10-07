const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Destination = require('../models/Destination');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// List destinations with pagination and search
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const where = {};
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { address: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Destination.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { items: rows, pagination: { page, total: count } } });
  } catch (e) {
    console.error('List destinations error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create destination (admin/superadmin)
router.post('/', protect, authorize('superadmin', 'admin'), [
  body('title').trim().notEmpty(),
  body('address').trim().notEmpty(),
  body('latitude').optional().isFloat(),
  body('longitude').optional().isFloat()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const dest = await Destination.create(req.body);
    res.status(201).json({ success: true, data: dest });
  } catch (e) {
    console.error('Create destination error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update destination
router.put('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Destination.update(req.body, { where: { id: req.params.id } });
    const dest = await Destination.findByPk(req.params.id);
    res.json({ success: true, data: dest });
  } catch (e) {
    console.error('Update destination error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete destination
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await Destination.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete destination error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


