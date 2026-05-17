const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import our custom route modules
const inventoryRoutes = require('./routes/inventory');
const operationsRoutes = require('./routes/operations');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON payloads from phone widgets
app.use(cors());
app.use(express.json());

// Connect our routes to the application
app.use('/api/inventory', inventoryRoutes);
app.use('/api/operations', operationsRoutes);

// Database Connection String Setup
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://dipanshu_mib:reMfGYpep1mOMN99@cluster0.p6qtj2b.mongodb.net/showroomHub?retryWrites=true&w=majority';

// Single clean connection logic with server timeout safety
mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ MongoDB Database connected successfully.');
  })
  .catch((err) => {
    console.error('❌ Database connection error details:', err.message);
  });

// Base landing route
app.get('/', (req, res) => {
  res.send('Showroom & Factory Operations Portal API Server is running...');
});

// Start listening for network traffic
app.listen(PORT, () => {
  console.log(`🚀 Server running smoothly on port ${PORT}`);
});