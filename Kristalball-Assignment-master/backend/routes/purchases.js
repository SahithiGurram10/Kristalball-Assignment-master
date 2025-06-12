const express = require('express');
const router = express.Router();
const { Purchase, Asset, Base, User } = require('../models/index');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// ✅ GET all purchases
router.get('/', authenticateToken, authorizeRoles(['Admin', 'Base Commander', 'Logistics Officer']), async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      include: [Asset, Base, { model: User, as: 'recorded_by_user' }]
    });
    res.json(purchases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// ✅ POST new purchase
router.post('/', authenticateToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
  const { asset_id, quantity, unit_cost, total_cost, purchase_date, supplier_info, receiving_base_id, purchase_order_number } = req.body;
  try {
    const purchase = await Purchase.create({
      asset_id,
      quantity,
      unit_cost,
      total_cost,
      purchase_date,
      supplier_info,
      receiving_base_id,
      purchase_order_number,
      recorded_by_user_id: req.user.id
    });

    // Update Asset current_balance if fungible
    const asset = await Asset.findByPk(asset_id);
    if (asset && asset.is_fungible) {
      asset.current_balance += quantity;
      await asset.save();
    }

    res.status(201).json(purchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create purchase' });
  }
});

module.exports = router;
