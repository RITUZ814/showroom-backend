const express = require('express');
const router = express.Router();
const { Inventory } = require('../models/schema');

// 1. ADD NEW STOCK WITH INCOMING TRACKING
router.post('/add', async (req, res) => {
  try {
    const { itemName, sku, quantity, hub, operatorName } = req.body;
    const cleanOperator = operatorName || 'Anonymous Staff';
    const volume = Number(quantity);

    // Look for existing item with the same SKU in the exact same hub location
    let item = await Inventory.findOne({ sku, hub });

    if (item) {
      // If item exists, increase stock volume
      item.quantity += volume;
      item.history.push({
        actionType: 'Incoming',
        quantity: volume,
        operatorName: cleanOperator,
        timestamp: new Date()
      });
      await item.save();
      return res.status(200).json({ success: true, message: `Added ${volume} units to existing SKU record!`, data: item });
    }

    // Otherwise, create a brand new product card configuration
    const newItem = new Inventory({
      itemName,
      sku,
      quantity: volume,
      hub,
      history: [{
        actionType: 'Incoming',
        quantity: volume,
        operatorName: cleanOperator,
        timestamp: new Date()
      }]
    });

    await newItem.save();
    res.status(201).json({ success: true, message: `Item successfully created in ${hub}!`, data: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding item to inventory.', error: error.message });
  }
});

// 2. GET INVENTORY BY HUB TYPE
router.get('/hub/:hubName', async (req, res) => {
  try {
    const { hubName } = req.params;
    const items = await Inventory.find({ hub: hubName }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, hub: hubName, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching inventory data.', error: error.message });
  }
});

// 3. DEDUCT / ISSUE OUT STOCK WITH AUDIT SIGNATURE
router.post('/deduct', async (req, res) => {
  try {
    const { sku, quantityToDeduct, operatorName } = req.body;
    const cleanOperator = operatorName || 'Anonymous Staff';
    const volume = Number(quantityToDeduct);

    const item = await Inventory.findOne({ sku, hub: 'Factory' });
    
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in Factory inventory.' });
    }

    if (item.quantity < volume) {
      return res.status(400).json({ success: false, message: 'Insufficient stock reserves available.' });
    }

    // Deduct stock balance and inject the record tracking item
    item.quantity -= volume;
    item.history.push({
      actionType: 'Issued Out',
      quantity: volume,
      operatorName: cleanOperator,
      timestamp: new Date()
    });
    
    await item.save();
    res.status(200).json({ success: true, message: 'Stock successfully issued out!', data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error processing stock deduction.', error: error.message });
  }
});

module.exports = router;