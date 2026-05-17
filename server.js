const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Core Middleware (Must run first)
app.use(cors());
app.use(express.json());

// 2. Database Connection Layer (Ensures MongoDB configurations wrap early)
const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://dipanshu_mib:reMfGYpep1mOMN99@cluster0.p6qtj2b.mongodb.net/showroomHub?retryWrites=true&w=majority';

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => {
    console.log('✅ MongoDB Database connected successfully.');
  })
  .catch((err) => {
    console.error('❌ Database connection error details:', err.message);
  });

// 3. Connect Routes to Application (Mounted after connection details initializes)
const inventoryRoutes = require('./routes/inventory');
const operationsRoutes = require('./routes/operations');

app.use('/api/inventory', inventoryRoutes);
app.use('/api/operations', operationsRoutes);

// Base landing route
app.get('/', (req, res) => {
  res.send('Showroom & Factory Operations Portal API Server is running...');
});

// Start listening for network traffic
app.listen(PORT, () => {
  console.log(`🚀 Server running smoothly on port ${PORT}`);
});