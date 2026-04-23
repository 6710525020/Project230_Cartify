const db = require('../db/database');

function periodDays(period) {
  const key = String(period || '').toLowerCase();
  if (key === 'week')    return 7;
  if (key === 'quarter') return 90;
  if (key === 'year')    return 365;
  return 30;
}

async function sales(req, res, next) {
  try {
    const days = periodDays(req.query.period);
    const rows = await db.all2(
      `SELECT
         TO_CHAR(order_date, 'YYYY-MM-DD')      AS name,
         ROUND(SUM(total_price)::numeric, 2)    AS sales,
         COUNT(order_id)                        AS orders
       FROM "Order"
       WHERE order_date >= CURRENT_DATE - $1::int * INTERVAL '1 day'
       GROUP BY TO_CHAR(order_date, 'YYYY-MM-DD')
       ORDER BY name ASC`,
      [days]
    );

    const chart = rows.map((r) => ({
      name: r.name,
      'ยอดขาย': r.sales   ?? 0,
      'คำสั่งซื้อ': r.orders ?? 0,
    }));

    const summary = await db.get2(
      `SELECT
         COALESCE(ROUND(SUM(total_price)::numeric, 2), 0) AS "totalRevenue",
         COUNT(order_id)                                  AS "totalOrders"
       FROM "Order"
       WHERE order_date >= CURRENT_DATE - $1::int * INTERVAL '1 day'`,
      [days]
    );

    res.json({ ...summary, chart });
  } catch (err) { next(err); }
}

async function products(req, res, next) {
  try {
    const days = periodDays(req.query.period);
    const topProducts = await db.all2(
      `SELECT
         p.pname                                        AS name,
         SUM(oi.count)                                  AS sold,
         ROUND(SUM(oi.count * p.price)::numeric, 2)    AS revenue
       FROM OrderItem oi
       JOIN Product p ON p.product_id = oi.product_id
       JOIN "Order" o ON o.order_id   = oi.order_id
       WHERE o.order_date >= CURRENT_DATE - $1::int * INTERVAL '1 day'
       GROUP BY p.product_id, p.pname
       ORDER BY sold DESC
       LIMIT 5`,
      [days]
    );

    const categories = await db.all2(
      `SELECT
         COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized') AS name,
         COUNT(*)                                              AS value
       FROM Product
       GROUP BY COALESCE(NULLIF(TRIM(category), ''), 'Uncategorized')
       ORDER BY value DESC`
    );

    const totalRow = await db.get2('SELECT COUNT(*) AS total FROM Product');
    res.json({ total: Number(totalRow.total), topProducts, categories });
  } catch (err) { next(err); }
}

async function customers(req, res, next) {
  try {
    const days = periodDays(req.query.period);
    const rows = await db.all2(
      `SELECT
         TO_CHAR(o.order_date, 'YYYY-MM-DD') AS name,
         COUNT(DISTINCT CASE WHEN c.customer_id IS NOT NULL THEN c.customer_id END) AS new_customers,
         COUNT(DISTINCT CASE WHEN cx.order_count > 1 THEN cx.customer_id END)       AS returning_customers
       FROM "Order" o
       LEFT JOIN Customer c ON c.customer_id = o.customer_id
       LEFT JOIN (
         SELECT customer_id, COUNT(*) AS order_count
         FROM "Order"
         GROUP BY customer_id
       ) cx ON cx.customer_id = o.customer_id
       WHERE o.order_date >= CURRENT_DATE - $1::int * INTERVAL '1 day'
       GROUP BY TO_CHAR(o.order_date, 'YYYY-MM-DD')
       ORDER BY name ASC`,
      [days]
    );

    const chart = rows.map((r) => ({
      name: r.name,
      'ใหม่': r.new_customers       ?? 0,
      'กลับมา': r.returning_customers ?? 0,
    }));

    const summary = await db.get2(
      `SELECT
         COUNT(*)                                                              AS total,
         COALESCE((
           SELECT COUNT(*) FROM Customer
           WHERE customer_id IN (
             SELECT customer_id FROM "Order"
             WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
           )
         ), 0)                                                                 AS "newThisMonth",
         COALESCE((
           SELECT COUNT(*) FROM (
             SELECT customer_id FROM "Order"
             GROUP BY customer_id HAVING COUNT(*) > 1
           ) sub
         ), 0)                                                                 AS returning,
         COALESCE((
           SELECT ROUND(AVG(total_price)::numeric, 2) FROM "Order"
         ), 0)                                                                 AS "avgOrderValue"
       FROM Customer`
    );

    const returnRate = summary.total > 0
      ? Number(((summary.returning / summary.total) * 100).toFixed(1))
      : 0;

    res.json({ ...summary, returnRate, chart });
  } catch (err) { next(err); }
}

async function getAll(req, res, next) {
  try {
    const rows = await db.all2(`
      SELECT r.*, o.status AS order_status, o.total_price
      FROM Report r
      JOIN "Order" o ON o.order_id = r.order_id
    `);
    res.json(rows);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const report = await db.get2(
      `SELECT r.*, o.status AS order_status, o.total_price
       FROM Report r
       JOIN "Order" o ON o.order_id = r.order_id
       WHERE r.report_id = $1`,
      [req.params.id]
    );
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const managers = await db.all2(
      `SELECT m.manager_id, m.mname
       FROM Manager_Report mr
       JOIN Manager m ON m.manager_id = mr.manager_id
       WHERE mr.report_id = $1`,
      [req.params.id]
    );

    res.json({ ...report, managers });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { order_id, report_type, manager_ids } = req.body;
    if (!order_id || !report_type)
      return res.status(400).json({ error: 'order_id and report_type are required' });

    const row = await db.get2(
      'INSERT INTO Report (order_id, report_type) VALUES ($1, $2) RETURNING report_id',
      [order_id, report_type]
    );
    const report_id = row.report_id;

    if (Array.isArray(manager_ids)) {
      for (const mid of manager_ids) {
        await db.run2(
          'INSERT INTO Manager_Report (manager_id, report_id) VALUES ($1, $2)',
          [mid, report_id]
        );
      }
    }

    res.status(201).json({ report_id, order_id, report_type });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { changes } = await db.run2('DELETE FROM Report WHERE report_id = $1', [req.params.id]);
    if (changes === 0) return res.status(404).json({ error: 'Report not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { sales, products, customers, getAll, getOne, create, remove };