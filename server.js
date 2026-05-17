const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware configuration
app.use(cors());
app.use(express.json());

// Database connection layer
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connection secure and active.'))
  .catch((err) => console.error('Database connection breakdown:', err));

// --- ROUTE ROUTING REGISTERED HOOKS ---
const inventoryRoutes = require('./routes/inventory');
const operationsRoutes = require('./routes/operations'); // <-- 1. CRITICAL IMPORT

app.use('/api/inventory', inventoryRoutes);
app.use('/api/operations', operationsRoutes); // <-- 2. CRITICAL BINDING

// Base sanity checkpoint endpoint
app.get('/', (req, res) => {
  res.send('Showroom Operations Cloud API Server running cleanly.');
});

app.listen(PORT, () => {
  console.log(`Server monitoring ports on: ${PORT}`);
});