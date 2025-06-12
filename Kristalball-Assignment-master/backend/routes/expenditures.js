const express = require('express');
const router = express.Router();
const { Expenditure, Asset, Base, User } = require('../models/index');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');
const logger = require('../utils/logger');

// ✅ GET all expenditures
router.get('/', authenticateToken, authorizeRoles(['Admin', 'Base Commander', 'Logistics Officer']), async (req, res) => {
  try {
    const expenditures = await Expenditure.findAll({
      include: [Asset, Base, { model: User, as: 'reported_by_user' }]
    });
    res.json(expenditures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch expenditures' });
  }
});

// ✅ POST create a new expenditure
router.post('/', authenticateToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
  const { asset_id, quantity_expended, expenditure_date, base_id, reason } = req.body;
  try {
    // Create expenditure record
    const expenditure = await Expenditure.create({
      asset_id,
      quantity_expended,
      expenditure_date,
      base_id,
      reason,
      reported_by_user_id: req.user.id
    });

    // Deduct quantity from asset balance (if fungible)
    const asset = await Asset.findByPk(asset_id);
    if (asset && asset.is_fungible) {
      asset.current_balance -= quantity_expended;
      await asset.save();
    }

    logger.info('EXPENDITURE_RECORDED', {
    meta: {
    user_id: req.user.id,
    asset_id: asset_id,
    quantity: quantity_expended,
    base_id: base_id,
    reason: reason,
    ip: req.ip
    }
    });

    res.status(201).json(expenditure);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to record expenditure' });
  }
});

module.exports = router;
