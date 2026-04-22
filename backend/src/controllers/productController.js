const db = require('../db/database');

function toProductDTO(row) {
  return {
    product_id: row.product_id,
    id: row.product_id,
    pname: row.pname,
    name: row.pname,
    description: row.description,
    category: row.category,
    image: row.image,
    stock: row.stock,
    price: row.price,
  };
}

async function getAll(req, res, next) {
  try {
    const rows = await db.all2('SELECT * FROM Product ORDER BY product_id DESC');
    res.json(rows.map(toProductDTO));
  }
  catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const row = await db.get2('SELECT * FROM Product WHERE product_id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(toProductDTO(row));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const name = req.body.name ?? req.body.pname;
    const price = req.body.price;
    const stock = req.body.stock ?? 0;
    const { description, category, image } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name/pname and price are required' });
    }

    const { lastID } = await db.run2(
      `INSERT INTO Product (pname, description, category, image, stock, price)
       VALUES (?,?,?,?,?,?)`,
      [name, description ?? null, category ?? null, image ?? null, stock, price]
    );
    const created = await db.get2('SELECT * FROM Product WHERE product_id = ?', [lastID]);
    res.status(201).json(toProductDTO(created));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const pname = req.body.pname ?? req.body.name;
    const { price, description, category, image, stock } = req.body;
    const { changes } = await db.run2(
      `UPDATE Product
       SET pname = COALESCE(?,pname),
           price = COALESCE(?,price),
           description = COALESCE(?,description),
           category = COALESCE(?,category),
           image = COALESCE(?,image),
           stock = COALESCE(?,stock)
       WHERE product_id = ?`,
      [pname ?? null, price ?? null, description ?? null, category ?? null, image ?? null, stock ?? null, req.params.id]
    );
    if (changes === 0) return res.status(404).json({ error: 'Product not found' });
    const updated = await db.get2('SELECT * FROM Product WHERE product_id = ?', [req.params.id]);
    res.json(toProductDTO(updated));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { changes } = await db.run2('DELETE FROM Product WHERE product_id = ?', [req.params.id]);
    if (changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, update, remove };
