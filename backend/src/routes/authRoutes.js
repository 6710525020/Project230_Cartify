const router = require('express').Router();
const customerCtrl = require('../controllers/customerController');
const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticate } = require('../middleware/auth');

const SECRET = process.env.JWT_SECRET || 'changeme';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function signToken(id, role) {
  return jwt.sign({ id, role }, SECRET, { expiresIn: EXPIRES });
}

async function login(req, res, next) {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }

    const normalizedRole = role ? String(role).toLowerCase() : null;

    if (!normalizedRole || normalizedRole === 'customer') {
      const customer = await db.get2('SELECT * FROM Customer WHERE email = $1', [email]);
      if (customer && bcrypt.compareSync(password, customer.password)) {
        const token = signToken(customer.customer_id, 'customer');
        return res.json({
          token,
          user: {
            id: customer.customer_id,
            name: customer.cname,
            email: customer.email,
            role: 'customer',
          },
        });
      }
    }

    if (!normalizedRole || normalizedRole === 'admin') {
      const admin = await db.get2('SELECT * FROM Admin WHERE aname = $1', [email]);
      if (admin && bcrypt.compareSync(password, admin.password)) {
        const token = signToken(admin.admin_id, 'admin');
        return res.json({
          token,
          user: {
            id: admin.admin_id,
            name: admin.aname,
            email: admin.aname,
            role: 'admin',
          },
        });
      }
    }

    if (!normalizedRole || normalizedRole === 'manager') {
      const manager = await db.get2(
        'SELECT * FROM Manager WHERE email = $1 OR mname = $1',
        [email]
      );
      if (manager && manager.password && bcrypt.compareSync(password, manager.password)) {
        const token = signToken(manager.manager_id, 'manager');
        return res.json({
          token,
          user: {
            id: manager.manager_id,
            name: manager.mname,
            email: manager.email,
            role: 'manager',
          },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    if (req.user.role === 'customer') {
      const customer = await db.get2(
        'SELECT customer_id, cname, email FROM Customer WHERE customer_id = $1',
        [req.user.id]
      );
      if (!customer) return res.status(404).json({ error: 'User not found' });
      return res.json({
        id: customer.customer_id,
        name: customer.cname,
        email: customer.email,
        role: 'customer',
      });
    }

    if (req.user.role === 'admin') {
      const admin = await db.get2('SELECT admin_id, aname FROM Admin WHERE admin_id = $1', [req.user.id]);
      if (!admin) return res.status(404).json({ error: 'User not found' });
      return res.json({
        id: admin.admin_id,
        name: admin.aname,
        email: admin.aname,
        role: 'admin',
      });
    }

    if (req.user.role === 'manager') {
      const manager = await db.get2(
        'SELECT manager_id, mname, email FROM Manager WHERE manager_id = $1',
        [req.user.id]
      );
      if (!manager) return res.status(404).json({ error: 'User not found' });
      return res.json({
        id: manager.manager_id,
        name: manager.mname,
        email: manager.email,
        role: 'manager',
      });
    }

    return res.status(403).json({ error: 'Unsupported role' });
  } catch (err) {
    next(err);
  }
}

router.post('/register', customerCtrl.register);
router.post('/login', login);
router.post('/logout',   (req, res) => res.json({ message: 'Logged out' }));
router.get('/me', authenticate, me);

module.exports = router;
