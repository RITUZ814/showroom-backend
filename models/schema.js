const mongoose = require('mongoose');

// Detailed Log Entry Schema for Auditing
const TransactionHistorySchema = new mongoose.Schema({
  actionType: { type: String, enum: ['Incoming', 'Issued Out'], required: true },
  quantity: { type: Number, required: true },
  operatorName: { type: String, required: true }, // Name of who received or issued it
  timestamp: { type: Date, default: Date.now }
});

// Unified Inventory Schema for both Showroom and Factory
const InventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  hub: { type: String, required: true, enum: ['Factory', 'Showroom'] },
  history: [TransactionHistorySchema] // Keeps a chronological running log of all movements
}, { timestamps: true });

// User Schema for Admin panel references
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ['Staff', 'Manager'] }
});

const Inventory = mongoose.model('Inventory', InventorySchema);
const User = mongoose.model('User', UserSchema);
// New Showroom Visit Schema for Customer Analytics
const VisitSchema = new mongoose.Schema({
  visitorName: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  requirement: { type: String, required: true }, // e.g., Bed, Sofa, Dining Table
  comments: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true, collection: 'ShowroomVisits' }); // <-- Add this explicit collection rule here

const Visit = mongoose.model('Visit', VisitSchema);

// Make sure to add Visit to your exports at the bottom!
module.exports = { Inventory, User, Visit };
module.exports = { Inventory, User };