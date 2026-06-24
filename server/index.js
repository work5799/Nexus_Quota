require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/accounts');
const quotaRoutes = require('./routes/quota');

// Initialize database
require('./lib/db');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountsRoutes);
app.use('/api/quota', quotaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('✅ Server starting...');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend should be at http://localhost:5173`);
  console.log('✅ Database created automatically!');
});
