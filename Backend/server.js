const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); 

const app = express();

app.use(cors()); 
app.use(express.json()); 

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Link the authentication routes
const authRoutes = require('./Routes/authRoutes'); 
app.use('/api/auth', authRoutes);

// --- ADD THE CUSTOMER ROUTES HERE ---
const customerRoutes = require('./Routes/customerRoutes');
app.use('/api/customer', customerRoutes);

// Add these right below your customerRoutes!
const vendorRoutes = require('./Routes/vendorRoutes');
app.use('/api/vendor', vendorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
