require('dotenv').config();
const express = require('express');
const cors    = require('cors');

// Initialize DB
require('./db/database');

const app = express();

//Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

//Routes
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/products',  require('./routes/productRoutes'));
app.use('/api/orders',    require('./routes/orderRoutes'));
app.use('/api/payments',  require('./routes/paymentRoutes'));
app.use('/api/reports',   require('./routes/reportRoutes'));
app.use('/api/managers',  require('./routes/managerRoutes'));
app.use('/api/admins',    require('./routes/adminRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/auth',      require('./routes/authRoutes'));

//Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

//404
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

//Error Handler
app.use(require('./middleware/errorHandler'));

//Start
const PORT = process.env.PORT || 8000;
app.listen(PORT, '0.0.0.0', () => {console.log('Server running on port', PORT);});

module.exports = app;
