// src/routes/authRoutes.js
const router = require('express').Router();
const customerCtrl = require('../controllers/customerController');

router.post('/register', customerCtrl.register);
router.post('/login',    customerCtrl.login);
router.post('/logout',   (req, res) => res.json({ message: 'Logged out' }));
router.get('/me',        require('../middleware/auth').authenticate, async (req, res) => {
  const db = require('../db/database');
  const customer = await db.get2('SELECT customer_id, cname, email FROM Customer WHERE customer_id = ?', [req.user.id]);
  if (!customer) return res.status(404).json({ error: 'User not found' });
  res.json({ id: customer.customer_id, name: customer.cname, email: customer.email, role: 'customer' });
});

module.exports = router;