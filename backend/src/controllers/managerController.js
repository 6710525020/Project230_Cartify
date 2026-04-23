const db = require('../db/database');
const bcrypt = require('bcryptjs');

async function getAll(req, res, next) {
  try { res.json(await db.all2('SELECT manager_id, mname, email FROM Manager')); }
  catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const row = await db.get2(
      'SELECT manager_id, mname, email FROM Manager WHERE manager_id = $1',
      [req.params.id]
    );
    if (!row) return res.status(404).json({ error: 'Manager not found' });
    res.json(row);
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { mname, email, password } = req.body;
    if (!mname) return res.status(400).json({ error: 'mname is required' });
    const hash = password ? bcrypt.hashSync(password, 10) : null;
    const row = await db.get2(
      'INSERT INTO Manager (mname, email, password) VALUES ($1, $2, $3) RETURNING manager_id',
      [mname, email ?? null, hash]
    );
    res.status(201).json({ manager_id: row.manager_id, mname, email: email ?? null });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const hashedPassword = req.body.password ? bcrypt.hashSync(req.body.password, 10) : null;
    const { changes } = await db.run2(
      `UPDATE Manager
       SET mname    = COALESCE($1, mname),
           email    = COALESCE($2, email),
           password = COALESCE($3, password)
       WHERE manager_id = $4`,
      [req.body.mname ?? null, req.body.email ?? null, hashedPassword, req.params.id]
    );
    if (changes === 0) return res.status(404).json({ error: 'Manager not found' });
    res.json({ message: 'Updated' });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { changes } = await db.run2('DELETE FROM Manager WHERE manager_id = $1', [req.params.id]);
    if (changes === 0) return res.status(404).json({ error: 'Manager not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove };