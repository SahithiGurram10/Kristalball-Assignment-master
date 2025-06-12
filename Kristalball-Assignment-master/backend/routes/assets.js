const express = require('express');
const router = express.Router();
const { Asset, EquipmentType, Base } = require('../models/index');
const authenticateToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/rbacMiddleware');

// ✅ GET all assets
router.get('/', authenticateToken, authorizeRoles(['Admin', 'Base Commander', 'Logistics Officer']), async (req, res) => {
  try {
    const assets = await Asset.findAll({
      include: [EquipmentType, Base]
    });
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// ✅ POST create new asset
router.post('/', authenticateToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
  const { equipment_type_id, model_name, serial_number, current_base_id, quantity, status, is_fungible, current_balance } = req.body;
  try {
    const asset = await Asset.create({
      equipment_type_id,
      model_name,
      serial_number,
      current_base_id,
      quantity,
      status,
      is_fungible,
      current_balance
    });
    res.status(201).json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// ✅ PUT update asset
router.put('/:id', authenticateToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
  const assetId = req.params.id;
  try {
    const asset = await Asset.findByPk(assetId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    await asset.update(req.body);
    res.json(asset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// ✅ DELETE asset
router.delete('/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
  const assetId = req.params.id;
  try {
    const asset = await Asset.findByPk(assetId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    await asset.destroy();
    res.json({ message: 'Asset deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

module.exports = router;
