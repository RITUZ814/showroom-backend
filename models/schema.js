const mongoose = require('mongoose');

// 1. USER SCHEMA (For admins, managers, and employees)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['Admin', 'Manager', 'Employee'], default: 'Employee' },
  assignedLocation: { type: String, enum: ['Factory', 'Showroom', 'Both'], required: true }
});

// 2. INVENTORY SCHEMA (Separates Factory and Showroom stock)
const InventorySchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  quantity: { type: Number, required: true, default: 0 },
  hub: { type: String, enum: ['Factory', 'Showroom'], required: true }, 
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// 3. ATTENDANCE SCHEMA (Captures precise GPS location on login/logout)
const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date },
  loginLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  logoutLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  }
});

// 4. TASK SCHEMA (With mandatory logout updates and deadlines)
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateForTask: { type: String, required: true }, // Allows assigning for 'Today' or 'Tomorrow'
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  employeeNotesOnLogout: { type: String } 
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', UserSchema),
  Inventory: mongoose.model('Inventory', InventorySchema),
  Attendance: mongoose.model('Attendance', AttendanceSchema),
  Task: mongoose.model('Task', TaskSchema)
};