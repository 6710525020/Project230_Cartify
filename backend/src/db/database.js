const { Pool } = require('pg');

const ORDER_STATUS_VALUES = ['pending', 'payment_completed', 'shipping_in_progress', 'delivered', 'cancelled'];

// Connect
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false
}});

pool.on('connect', () => console.log('🐘 PostgreSQL connected'));
pool.on('error',   (err) => console.error('PostgreSQL error:', err.message));

// Promisified Helpers
pool.run2 = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return {
    lastID:  result.rows[0]?.id ?? null,
    changes: result.rowCount,
    rows:    result.rows,
  };
};

pool.all2 = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows;
};

pool.get2 = async (sql, params = []) => {
  const result = await pool.query(sql, params);
  return result.rows[0] ?? null;
};

// Schema
const SCHEMA = `
CREATE TABLE IF NOT EXISTS Manager (
  manager_id  SERIAL PRIMARY KEY,
  mname       TEXT NOT NULL,
  email       TEXT UNIQUE,
  password    TEXT
);

CREATE TABLE IF NOT EXISTS Admin (
  admin_id  SERIAL PRIMARY KEY,
  aname     TEXT NOT NULL,
  password  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Customer (
  customer_id  SERIAL PRIMARY KEY,
  cname        TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,
  password     TEXT NOT NULL,
  address      TEXT,
  phone_number TEXT
);

CREATE TABLE IF NOT EXISTS Product (
  product_id  SERIAL PRIMARY KEY,
  pname       TEXT NOT NULL,
  description TEXT,
  category    TEXT,
  image       TEXT,
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price       NUMERIC NOT NULL           CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS "Order" (
  order_id         SERIAL PRIMARY KEY,
  customer_id      INTEGER NOT NULL,
  admin_id         INTEGER,
  order_date       DATE    NOT NULL DEFAULT CURRENT_DATE,
  status           TEXT    NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','payment_completed','shipping_in_progress','delivered','cancelled')),
  total_price      NUMERIC NOT NULL DEFAULT 0,
  delivery_address TEXT,
  payment_method   TEXT    DEFAULT 'debit'
                   CHECK (payment_method IN ('debit','cod')),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE RESTRICT,
  FOREIGN KEY (admin_id)    REFERENCES Admin(admin_id)       ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS OrderItem (
  order_id   INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  count      INTEGER NOT NULL CHECK (count > 0),
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id)   REFERENCES "Order"(order_id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Payment (
  payment_id      SERIAL PRIMARY KEY,
  order_id        INTEGER NOT NULL UNIQUE,
  admin_id        INTEGER,
  amount          NUMERIC NOT NULL CHECK (amount >= 0),
  payment_method  TEXT    NOT NULL
                  CHECK (payment_method IN ('cash','credit_card','bank_transfer','promptpay')),
  slip_attachment TEXT,
  payment_date    DATE    NOT NULL DEFAULT CURRENT_DATE,
  FOREIGN KEY (order_id) REFERENCES "Order"(order_id)  ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES Admin(admin_id)    ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Report (
  report_id   SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL,
  report_date DATE    NOT NULL DEFAULT CURRENT_DATE,
  report_type TEXT    NOT NULL,
  FOREIGN KEY (order_id) REFERENCES "Order"(order_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Manager_Report (
  manager_id INTEGER NOT NULL,
  report_id  INTEGER NOT NULL,
  PRIMARY KEY (manager_id, report_id),
  FOREIGN KEY (manager_id) REFERENCES Manager(manager_id) ON DELETE CASCADE,
  FOREIGN KEY (report_id)  REFERENCES Report(report_id)   ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cart (
  cart_id     SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL UNIQUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CartItem (
  cart_item_id SERIAL PRIMARY KEY,
  cart_id      INTEGER NOT NULL,
  product_id   INTEGER NOT NULL,
  quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  UNIQUE (cart_id, product_id),
  FOREIGN KEY (cart_id)    REFERENCES Cart(cart_id)        ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_customer  ON "Order"(customer_id);
CREATE INDEX IF NOT EXISTS idx_order_admin      ON "Order"(admin_id);
CREATE INDEX IF NOT EXISTS idx_orderitem_order  ON OrderItem(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_order    ON Payment(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_admin    ON Payment(admin_id);
CREATE INDEX IF NOT EXISTS idx_report_order     ON Report(order_id);
CREATE INDEX IF NOT EXISTS idx_cart_customer    ON Cart(customer_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_cart    ON CartItem(cart_id);
CREATE INDEX IF NOT EXISTS idx_cartitem_product ON CartItem(product_id);
`;

// Init
async function initDB() {
  await pool.query(SCHEMA);
  await pool.query(`
    ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_status_check";
    ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS order_status_check;
    UPDATE "Order"
    SET status = CASE
      WHEN status = 'confirmed' THEN 'payment_completed'
      WHEN status = 'processing' THEN 'shipping_in_progress'
      WHEN status = 'shipped' THEN 'shipping_in_progress'
      WHEN status = 'completed' THEN 'delivered'
      ELSE status
    END;
    ALTER TABLE "Order"
    ADD CONSTRAINT order_status_check
    CHECK (status IN (${ORDER_STATUS_VALUES.map((status) => `'${status}'`).join(', ')}));
  `);

  const bcrypt = require('bcryptjs');

  const adminSeeds = [
    { aname: 'admin@gmail.com', password: 'admin1234' },
  ];

  const managerSeeds = [
    { mname: 'Manager1', email: 'manager@gmail.com', password: 'manager1234' },
  ];

  for (const admin of adminSeeds) {
    const passwordHash = bcrypt.hashSync(admin.password, 10);
    const { rowCount } = await pool.query(
      `UPDATE Admin
       SET password = $2
       WHERE aname = $1`,
      [admin.aname, passwordHash]
    );

    if (rowCount === 0) {
      await pool.query(
        `INSERT INTO Admin (aname, password)
         VALUES ($1, $2)`,
        [admin.aname, passwordHash]
      );
    }
  }

  for (const manager of managerSeeds) {
    const passwordHash = bcrypt.hashSync(manager.password, 10);
    await pool.query(
      `INSERT INTO Manager (mname, email, password)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE
       SET mname = EXCLUDED.mname,
           password = EXCLUDED.password`,
      [manager.mname, manager.email, passwordHash]
    );
  }

  console.log('Schema ready');
}

initDB().catch((err) => {
  console.error('Schema error:', err.message);
  process.exit(1);
});

module.exports = pool;