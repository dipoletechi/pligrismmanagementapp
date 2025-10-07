const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const SupportTicket = require('../models/SupportTicket');

const router = express.Router();

// List tickets (admins see all; users see own)
router.get('/', protect, async (req, res) => {
  try {
    const where = (req.user.role === 'superadmin' || req.user.role === 'admin')
      ? {}
      : { user_id: req.user.id };
    const tickets = await SupportTicket.findAll({ where, order: [['created_at', 'DESC']] });
    res.json({ success: true, data: { items: tickets } });
  } catch (e) {
    console.error('List tickets error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create ticket (any authenticated)
router.post('/', protect, [
  body('subject').trim().notEmpty(),
  body('priority').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const payload = { ...req.body, user_id: req.user.id };
    const ticket = await SupportTicket.create(payload);
    res.status(201).json({ success: true, data: ticket });
  } catch (e) {
    console.error('Create ticket error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update ticket (owner can update description/subject; admins can update all incl. status/assigned_to)
router.put('/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Not found' });

    const isAdmin = (req.user.role === 'superadmin' || req.user.role === 'admin');
    if (!isAdmin && ticket.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const allowed = isAdmin
      ? ['subject', 'description', 'priority', 'status', 'assigned_to']
      : ['subject', 'description'];
    const dataToUpdate = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    await SupportTicket.update(dataToUpdate, { where: { id: ticket.id } });
    const updated = await SupportTicket.findByPk(ticket.id);
    res.json({ success: true, data: updated });
  } catch (e) {
    console.error('Update ticket error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete ticket (admins only)
router.delete('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
  try {
    await SupportTicket.destroy({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Delete ticket error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;


