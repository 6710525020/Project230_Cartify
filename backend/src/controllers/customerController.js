const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET  = process.env.JWT_SECRET     || 'changeme';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password are required' });
    const hash = bcrypt.hashSync(password, 10);
    const row = await db.get2(
      `INSERT INTO Customer (cname, email, password) VALUES ($1, $2, $3) RETURNING customer_id`,
      [name, email, hash]
    );
    const token = jwt.sign({ id: row.customer_id, role: 'customer' }, SECRET, { expiresIn: EXPIRES });
    res.status(201).json({ token, user: { id: row.customer_id, name, email, role: 'customer' } });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });
    const customer = await db.get2('SELECT * FROM Customer WHERE email = $1', [email]);
    if (!customer || !bcrypt.compareSync(password, customer.password))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: customer.customer_id, role: 'customer' }, SECRET, { expiresIn: EXPIRES });
    res.json({ token, user: { id: customer.customer_id, name: customer.cname, email: customer.email, role: 'customer' } });
  } catch (err) { next(err); }
}

async function getAll(req, res, next) {
  try {
    res.json(await db.all2('SELECT customer_id, cname, email, address, phone_number FROM Customer'));
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const row = await db.get2(
      'SELECT customer_id, cname, email, address, phone_number FROM Customer WHERE customer_id = $1',
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: 'Customer not found' });
    res.json(row);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { cname, email, address, phone_number } = req.body;
    const { changes } = await db.run2(
      `UPDATE Customer
       SET cname        = COALESCE($1, cname),
           email        = COALESCE($2, email),
           address      = COALESCE($3, address),
           phone_number = COALESCE($4, phone_number)
       WHERE customer_id = $5`,
      [cname ?? null, email ?? null, address ?? null, phone_number ?? null, req.params.id]
    );
    if (changes === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Updated successfully' });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { changes } = await db.run2('DELETE FROM Customer WHERE customer_id = $1', [req.params.id]);
    if (changes === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { register, login, getAll, getOne, update, remove };