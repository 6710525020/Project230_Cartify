const db = require('../db/database');

function toProductDTO(row) {
  return {
    product_id:  row.product_id,
    id:          row.product_id,
    pname:       row.pname,
    name:        row.pname,
    description: row.description,
    category:    row.category,
    image:       row.image,
    stock:       row.stock,
    price:       row.price,
  };
}

async function getAll(req, res, next) {
  try {
    const q        = String(req.query.q        || '').trim();
    const category = String(req.query.category || '').trim();
    const sort     = String(req.query.sort     || 'createdAt');
    const page     = Math.max(parseInt(req.query.page  || '1',  10), 1);
    const limit    = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 100);
    const offset   = (page - 1) * limit;

    const where  = [];
    const params = [];
    let   idx    = 1;

    if (q) {
      where.push(`(LOWER(pname) LIKE LOWER($${idx}) OR LOWER(description) LIKE LOWER($${idx+1}) OR LOWER(category) LIKE LOWER($${idx+2}))`);
      const like = `%${q}%`;
      params.push(like, like, like);
      idx += 3;
    }

    if (category) {
      where.push(`category = $${idx++}`);
      params.push(category);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sortMap = {
      createdAt:  'product_id DESC',
      newest:     'product_id DESC',
      price_asc:  'price ASC,  pname ASC',
      price_desc: 'price DESC, pname ASC',
      name:       'pname ASC',
      name_asc:   'pname ASC',
    };
    const orderBy = sortMap[sort] || sortMap.createdAt;

    const totalRow = await db.get2(`SELECT COUNT(*) AS total FROM Product ${whereSql}`, params);
    const rows     = await db.all2(
      `SELECT * FROM Product ${whereSql} ORDER BY ${orderBy} LIMIT $${idx} OFFSET $${idx+1}`,
      [...params, limit, offset]
    );

    res.json({
      products: rows.map(toProductDTO),
      total:    Number(totalRow?.total || 0),
      page,
      limit,
    });
  } catch (err) { next(err); }
}

async function getCategories(req, res, next) {
  try {
    const rows = await db.all2(
      `SELECT DISTINCT category
       FROM Product
       WHERE category IS NOT NULL AND TRIM(category) <> ''
       ORDER BY category ASC`
    );
    res.json(rows.map((row) => row.category));
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const row = await db.get2('SELECT * FROM Product WHERE product_id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(toProductDTO(row));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const name  = req.body.name ?? req.body.pname;
    const price = req.body.price;
    const stock = req.body.stock ?? 0;
    const { description, category, image } = req.body;

    if (!name || price === undefined)
      return res.status(400).json({ error: 'name/pname and price are required' });

    const row = await db.get2(
      `INSERT INTO Product (pname, description, category, image, stock, price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING product_id`,
      [name, description ?? null, category ?? null, image ?? null, stock, price]
    );
    const created = await db.get2('SELECT * FROM Product WHERE product_id = $1', [row.product_id]);
    res.status(201).json(toProductDTO(created));
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const pname = req.body.pname ?? req.body.name;
    const { price, description, category, image, stock } = req.body;

    const { changes } = await db.run2(
      `UPDATE Product
       SET pname       = COALESCE($1, pname),
           price       = COALESCE($2, price),
           description = COALESCE($3, description),
           category    = COALESCE($4, category),
           image       = COALESCE($5, image),
           stock       = COALESCE($6, stock)
       WHERE product_id = $7`,
      [pname ?? null, price ?? null, description ?? null, category ?? null, image ?? null, stock ?? null, req.params.id]
    );
    if (changes === 0) return res.status(404).json({ error: 'Product not found' });
    const updated = await db.get2('SELECT * FROM Product WHERE product_id = $1', [req.params.id]);
    res.json(toProductDTO(updated));
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { changes } = await db.run2('DELETE FROM Product WHERE product_id = $1', [req.params.id]);
    if (changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { getAll, getCategories, getOne, create, update, remove };