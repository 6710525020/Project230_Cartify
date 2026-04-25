const db = require('../db/database');
const { loadCart } = require('./cartController');

const ORDER_STATUSES = [
  'pending',
  'payment_completed',
  'shipping_in_progress',
  'delivered',
  'cancelled',
];

function toOrderItemDTO(row) {
  return {
    product_id: row.product_id,
    name: row.pname,
    price: row.price,
    quantity: row.count,
  };
}

function parseAddress(value) {
  if (!value) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); }
  catch { return { address: value }; }
}

async function getPaymentForOrder(orderId) {
  return db.get2(
    `SELECT payment_id, amount, payment_method, slip_attachment, payment_date
     FROM Payment WHERE order_id = $1`,
    [orderId]
  );
}
async function enrichOrder(order) {
  const items = await db.all2(
    `SELECT oi.product_id, oi.count, p.pname, p.price
     FROM OrderItem oi
     JOIN Product p ON p.product_id = oi.product_id
     WHERE oi.order_id = $1`,
    [order.order_id]
  );
  const payment = await getPaymentForOrder(order.order_id);

  return {
    id: order.order_id,
    _id: order.order_id,
    customer_id: order.customer_id,
    customerName: order.cname || null,
    orderDate: order.order_date,
    createdAt: order.order_date,
    status: order.status,
    total: order.total_price,
    total_price: order.total_price,
    paymentMethod: payment?.payment_method || order.payment_method,
    shippingAddress: parseAddress(order.delivery_address),
    items: items.map(toOrderItemDTO),
    payment: payment ? {
      id: payment.payment_id,
      amount: payment.amount,
      method: payment.payment_method,
      slipAttachment: payment.slip_attachment,
      paidAt: payment.payment_date,
    } : null,
  };
}

async function recalcTotal(order_id) {
  const row = await db.get2(
    `SELECT COALESCE(SUM(oi.count * p.price), 0) AS total
     FROM OrderItem oi
     JOIN Product p ON p.product_id = oi.product_id
     WHERE oi.order_id = $1`,
    [order_id]
  );
  await db.run2('UPDATE "Order" SET total_price = $1 WHERE order_id = $2', [row.total, order_id]);
  return row.total;
}

async function getAll(req, res, next) {
  try {
    let query = `
      SELECT o.*, c.cname, a.aname
      FROM "Order" o
      LEFT JOIN Customer c ON c.customer_id = o.customer_id
      LEFT JOIN Admin    a ON a.admin_id    = o.admin_id
    `;
    let params = [];

    if (req.user.role === 'customer') {
      query += ` WHERE o.customer_id = $1`;
      params = [req.user.id];
    }

    if (req.query.status && ORDER_STATUSES.includes(req.query.status)) {
      const statusParam = `$${params.length + 1}`;
      query += params.length === 0 ? ` WHERE o.status = ${statusParam}` : ` AND o.status = ${statusParam}`;
      params.push(req.query.status);
    }

    query += ' ORDER BY o.order_id DESC';
    const rows   = await db.all2(query, params);
    const orders = await Promise.all(rows.map(enrichOrder));
    res.json({ orders });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const order = await db.get2(`
      SELECT o.*, c.cname
      FROM "Order" o
      LEFT JOIN Customer c ON c.customer_id = o.customer_id
      LEFT JOIN Admin    a ON a.admin_id    = o.admin_id
      WHERE o.order_id = $1
    `, [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (req.user.role === 'customer' && String(order.customer_id) !== String(req.user.id))
      return res.status(403).json({ error: 'Forbidden' });
    res.json(await enrichOrder(order));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const customer_id      = req.user.id;
    const shippingAddress  = req.body.shippingAddress || req.body.address || null;
    const paymentMethod    = String(req.body.paymentMethod || 'cash').toLowerCase();
    const slipAttachment   = req.body.slipAttachment || null;
    const incomingItems    = Array.isArray(req.body.items) ? req.body.items : [];
    const cart             = await loadCart(customer_id);
    const validPaymentMethods = ['cash', 'credit_card', 'promptpay'];

    const normalizedItems = incomingItems.map((item) => ({
      product_id: Number(item.product_id ?? item.productId),
      qty: Number(item.qty ?? item.quantity),
    }));

    const items = normalizedItems.length > 0
      ? normalizedItems
      : cart.items.map((item) => ({ product_id: Number(item.product_id), qty: Number(item.quantity) }));

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'items[] required' });

    if (!validPaymentMethods.includes(paymentMethod))
      return res.status(400).json({ error: `paymentMethod must be one of: ${validPaymentMethods.join(', ')}` });

    if (paymentMethod === 'promptpay' && !slipAttachment)
      return res.status(400).json({ error: 'PromptPay payments require a slip attachment' });

    for (const item of items) {
      if (!Number.isInteger(item.product_id) || !Number.isInteger(item.qty) || item.qty < 1)
        return res.status(400).json({ error: 'Each item needs product_id and qty' });

      const product = await db.get2('SELECT stock FROM Product WHERE product_id = $1', [item.product_id]);
      if (!product) return res.status(404).json({ error: `Product ${item.product_id} not found` });
      if (product.stock < item.qty)
        return res.status(400).json({ error: `Not enough stock for product ${item.product_id}` });
    }

    const orderPaymentMethod = paymentMethod === 'cash' ? 'cod' : 'debit';
    const initialStatus      = paymentMethod === 'cash' ? 'pending' : 'payment_completed';

    const orderRow = await db.get2(
      `INSERT INTO "Order" (customer_id, admin_id, delivery_address, payment_method, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING order_id`,
      [customer_id, null, shippingAddress ? JSON.stringify(shippingAddress) : null, orderPaymentMethod, initialStatus]
    );
    const order_id = orderRow.order_id;

    for (const item of items) {
      await db.run2(
        'INSERT INTO OrderItem (order_id, product_id, count) VALUES ($1, $2, $3)',
        [order_id, item.product_id, item.qty]
      );
      await db.run2(
        'UPDATE Product SET stock = stock - $1 WHERE product_id = $2',
        [item.qty, item.product_id]
      );
    }

    const total_price = await recalcTotal(order_id);
    await db.run2(
      `INSERT INTO Payment (order_id, employee_id, amount, payment_method, slip_attachment)
       VALUES ($1, $2, $3, $4, $5)`,
      [order_id, null, total_price, paymentMethod, slipAttachment]
    );

    const cartRow = await db.get2('SELECT cart_id FROM Cart WHERE customer_id = $1', [customer_id]);
    if (cartRow?.cart_id) {
      await db.run2('DELETE FROM CartItem WHERE cart_id = $1', [cartRow.cart_id]);
    }

    const order = await db.get2('SELECT * FROM "Order" WHERE order_id = $1', [order_id]);
    res.status(201).json({
      message: 'Order created successfully',
      order_id,
      total_price,
      order: await enrichOrder(order),
    });
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status))
      return res.status(400).json({ error: `status must be one of: ${ORDER_STATUSES.join(', ')}` });
    const { changes } = await db.run2(
      `UPDATE "Order" SET status = $1 WHERE order_id = $2`,
      [status, req.params.id]
    );
    if (changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Status updated', status });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const { changes } = await db.run2(`DELETE FROM "Order" WHERE order_id = $1`, [req.params.id]);
    if (changes === 0) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
}

async function addItem(req, res, next) {
  try {
    const { id: order_id } = req.params;
    const { product_id, count } = req.body;
    if (!product_id || !count)
      return res.status(400).json({ error: 'product_id and count required' });

    const order = await db.get2('SELECT customer_id FROM "Order" WHERE order_id = $1', [order_id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.customer_id) !== String(req.user.id))
      return res.status(403).json({ error: 'Forbidden' });

    const existing = await db.get2(
      'SELECT count FROM OrderItem WHERE order_id = $1 AND product_id = $2',
      [order_id, product_id]
    );
    if (existing) {
      await db.run2(
        'UPDATE OrderItem SET count = $1 WHERE order_id = $2 AND product_id = $3',
        [existing.count + count, order_id, product_id]
      );
    } else {
      await db.run2(
        'INSERT INTO OrderItem (order_id, product_id, count) VALUES ($1, $2, $3)',
        [order_id, product_id, count]
      );
    }
    const total_price = await recalcTotal(order_id);
    res.json({ message: 'Item added', total_price });
  } catch (err) { next(err); }
}

async function removeItem(req, res, next) {
  try {
    const { id: order_id, productId: product_id } = req.params;
    const order = await db.get2('SELECT customer_id FROM "Order" WHERE order_id = $1', [order_id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (String(order.customer_id) !== String(req.user.id))
      return res.status(403).json({ error: 'Forbidden' });

    const { changes } = await db.run2(
      'DELETE FROM OrderItem WHERE order_id = $1 AND product_id = $2',
      [order_id, product_id]
    );
    if (changes === 0) return res.status(404).json({ error: 'Item not found' });
    const total_price = await recalcTotal(order_id);
    res.json({ message: 'Item removed', total_price });
  } catch (err) { next(err); }
}

module.exports = { getAll, getOne, create, updateStatus, remove, addItem, removeItem };
