const db = require('../db/database');

function toCartItemDTO(row) {
  return {
    id: row.cart_item_id,
    _id: row.cart_item_id,
    product_id: row.product_id,
    name: row.pname,
    price: row.price,
    image: row.image,
    stock: row.stock,
    quantity: row.quantity,
  };
}

async function ensureCart(customerId) {
  let cart = await db.get2('SELECT cart_id FROM Cart WHERE customer_id = $1', [customerId]);
  if (!cart) {
    cart = await db.get2(
      'INSERT INTO Cart (customer_id) VALUES ($1) RETURNING cart_id',
      [customerId]
    );
  }
  return cart.cart_id;
}

async function loadCart(customerId) {
  const cartId = await ensureCart(customerId);
  const items = await db.all2(
    `SELECT ci.cart_item_id, ci.product_id, ci.quantity, p.pname, p.price, p.image, p.stock
     FROM CartItem ci
     JOIN Product p ON p.product_id = ci.product_id
     WHERE ci.cart_id = $1
     ORDER BY ci.cart_item_id DESC`,
    [cartId]
  );
  return { cartId, items: items.map(toCartItemDTO) };
}

async function getCart(req, res, next) {
  try {
    const cart = await loadCart(req.user.id);
    res.json({
      items: cart.items,
      total: cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    });
  } catch (err) { next(err); }
}

async function addItem(req, res, next) {
  try {
    const productId = Number(req.body.productId ?? req.body.product_id);
    const quantity  = Math.max(Number(req.body.quantity ?? 1), 1);

    if (!Number.isInteger(productId))
      return res.status(400).json({ error: 'productId is required' });

    const product = await db.get2('SELECT product_id, stock FROM Product WHERE product_id = $1', [productId]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ error: 'Not enough stock available' });

    const cartId = await ensureCart(req.user.id);
    const existing = await db.get2(
      'SELECT cart_item_id, quantity FROM CartItem WHERE cart_id = $1 AND product_id = $2',
      [cartId, productId]
    );

    if (existing) {
      const nextQty = existing.quantity + quantity;
      if (product.stock < nextQty) return res.status(400).json({ error: 'Not enough stock available' });
      await db.run2('UPDATE CartItem SET quantity = $1 WHERE cart_item_id = $2', [nextQty, existing.cart_item_id]);
    } else {
      await db.run2(
        'INSERT INTO CartItem (cart_id, product_id, quantity) VALUES ($1, $2, $3)',
        [cartId, productId, quantity]
      );
    }

    res.status(201).json(await loadCart(req.user.id));
  } catch (err) { next(err); }
}

async function updateItem(req, res, next) {
  try {
    const itemId   = Number(req.params.itemId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ error: 'Valid quantity is required' });

    const item = await db.get2(
      `SELECT ci.cart_item_id, ci.cart_id, ci.product_id, c.customer_id, p.stock
       FROM CartItem ci
       JOIN Cart    c ON c.cart_id    = ci.cart_id
       JOIN Product p ON p.product_id = ci.product_id
       WHERE ci.cart_item_id = $1`,
      [itemId]
    );

    if (!item || String(item.customer_id) !== String(req.user.id))
      return res.status(404).json({ error: 'Cart item not found' });
    if (item.stock < quantity)
      return res.status(400).json({ error: 'Not enough stock available' });

    await db.run2('UPDATE CartItem SET quantity = $1 WHERE cart_item_id = $2', [quantity, itemId]);
    res.json(await loadCart(req.user.id));
  } catch (err) { next(err); }
}

async function removeItem(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    const item = await db.get2(
      `SELECT ci.cart_item_id, c.customer_id
       FROM CartItem ci
       JOIN Cart c ON c.cart_id = ci.cart_id
       WHERE ci.cart_item_id = $1`,
      [itemId]
    );

    if (!item || String(item.customer_id) !== String(req.user.id))
      return res.status(404).json({ error: 'Cart item not found' });

    await db.run2('DELETE FROM CartItem WHERE cart_item_id = $1', [itemId]);
    res.json(await loadCart(req.user.id));
  } catch (err) { next(err); }
}

async function clearCart(req, res, next) {
  try {
    const cartId = await ensureCart(req.user.id);
    await db.run2('DELETE FROM CartItem WHERE cart_id = $1', [cartId]);
    res.json({ items: [], total: 0 });
  } catch (err) { next(err); }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, loadCart };