const express = require('express');
const router = express.Router();
const { Inventory } = require('../models/Schema');

// 1. ADD NEW ITEM TO INVENTORY (Factory or Showroom)
router.post('/add', async (req, res) => {
  try {
    const { itemName, sku, quantity, hub, userId } = req.body;
    
    const newItem = new Inventory({
      itemName,
      sku,
      quantity,
      hub, // Must be 'Factory' or 'Showroom'
      lastUpdatedBy: userId
    });

    await newItem.save();
    res.status(201).json({ success: true, message: `Item successfully added to ${hub}!`, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding item to inventory.', error: error.message });
  }
});

// 2. GET INVENTORY BY HUB TYPE (Separate view for Factory vs Showroom)
router.get('/hub/:hubName', async (req, res) => {
  try {
    const { hubName } = req.params; // Expects 'Factory' or 'Showroom'
    const items = await Inventory.find({ hub: hubName }).populate('lastUpdatedBy', 'name');
    res.status(200).json({ success: true, hub: hubName, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inventory data.', error: error.message });
  }
});

// 3. TRANSFER STOCK BETWEEN HUB (e.g., Moving finished furniture from Factory to Showroom)
router.post('/transfer', async (req, res) => {
  try {
    const { sku, quantityToTransfer, fromHub, toHub, userId } = req.body;

    // Find item in source hub
    const sourceItem = await Inventory.findOne({ sku, hub: fromHub });
    if (!sourceItem || sourceItem.quantity < quantityToTransfer) {
      return res.status(400).json({ success: false, message: 'Insufficient stock or item not found in source hub.' });
    }

    // Deduct stock from source hub
    sourceItem.quantity -= quantityToTransfer;
    sourceItem.lastUpdatedBy = userId;
    await sourceItem.save();

    // Check if item already exists in target hub, if yes add quantity, if no create entry
    let targetItem = await Inventory.findOne({ sku, hub: toHub });
    if (targetItem) {
      targetItem.quantity += Number(quantityToTransfer);
      targetItem.lastUpdatedBy = userId;
    } else {
      targetItem = new Inventory({
        itemName: sourceItem.itemName,
        sku: sourceItem.sku,
        quantity: quantityToTransfer,
        hub: toHub,
        lastUpdatedBy: userId
      });
    }
    await targetItem.save();

    res.status(200).json({ success: true, message: `Successfully transferred ${quantityToTransfer} items from ${fromHub} to ${toHub}.` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error executing inventory transfer.', error: error.message });
  }
});

module.exports = router;