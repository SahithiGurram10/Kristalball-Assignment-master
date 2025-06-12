const express = require('express');
const router = express.Router();
const { Transfer, Asset, Base, User } = require('../models/index');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// ✅ GET all transfers
router.get('/', authenticateToken, authorizeRoles(['Admin', 'Base Commander', 'Logistics Officer']), async (req, res) => {
  try {
    const transfers = await Transfer.findAll({
      include: [Asset, 
        { model: Base, as: 'source_base' },
        { model: Base, as: 'destination_base' },
        { model: User, as: 'initiated_by_user' },
        { model: User, as: 'received_by_user' }]
    });
    res.json(transfers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// ✅ POST initiate a transfer
router.post('/', authenticateToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
  const { asset_id, asset_serial_number, quantity, source_base_id, destination_base_id, transfer_date, reason } = req.body;
  try {
    const transfer = await Transfer.create({
      asset_id,
      asset_serial_number,
      quantity,
      source_base_id,
      destination_base_id,
      transfer_date,
      reason,
      status: 'Initiated',
      initiated_by_user_id: req.user.id
    });

    // If asset is fungible — decrease quantity from source asset balance
    const asset = await Asset.findByPk(asset_id);
    if (asset && asset.is_fungible) {
      asset.current_balance -= quantity;
      await asset.save();
    }

    res.status(201).json(transfer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate transfer' });
  }
});

// ✅ PUT to mark transfer as received
router.put('/:id/receive', authenticateToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
  const transferId = req.params.id;
  try {
    const transfer = await Transfer.findByPk(transferId);
    if (!transfer) return res.status(404).json({ error: 'Transfer not found' });

    transfer.status = 'Received';
    transfer.completed_at = new Date();
    transfer.received_by_user_id = req.user.id;
    await transfer.save();

    // Update asset's current_base_id if non-fungible, or increase balance if fungible
    const asset = await Asset.findByPk(transfer.asset_id);
    if (asset) {
      if (asset.is_fungible) {
        asset.current_balance += transfer.quantity;
      } else {
        asset.current_base_id = transfer.destination_base_id;
      }
      await asset.save();
    }

    res.json(transfer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to complete transfer' });
  }
});

module.exports = router;
