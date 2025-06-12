const express = require('express');
const router = express.Router();
const { Assignment, Asset, Base, User } = require('../models/index');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// ✅ GET all assignments
router.get('/', authenticateToken, authorizeRoles(['Admin', 'Base Commander', 'Logistics Officer']), async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      include: [Asset, 
        { model: User, as: 'assigned_to_user' },
        { model: Base, as: 'base_of_assignment' },
        { model: User, as: 'recorded_by_user' }]
    });
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// ✅ POST create a new assignment
router.post('/', authenticateToken, authorizeRoles(['Admin', 'Base Commander', 'Logistics Officer']), async (req, res) => {
  const { asset_id, assigned_to_user_id, assignment_date, base_of_assignment_id, purpose, expected_return_date } = req.body;
  try {
    const assignment = await Assignment.create({
      asset_id,
      assigned_to_user_id,
      assignment_date,
      base_of_assignment_id,
      purpose,
      expected_return_date,
      is_active: true,
      recorded_by_user_id: req.user.id
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// ✅ PUT mark an assignment as returned
router.put('/:id/return', authenticateToken, authorizeRoles(['Admin', 'Base Commander', 'Logistics Officer']), async (req, res) => {
  const assignmentId = req.params.id;
  try {
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.is_active = false;
    assignment.returned_date = new Date();
    await assignment.save();

    res.json(assignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark assignment as returned' });
  }
});

module.exports = router;
