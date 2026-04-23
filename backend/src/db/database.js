const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/shop.db';
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) { console.error('Failed to open DB:', err.message); process.exit(1); }
  console.log('📦  SQLite connected → ' + DB_PATH);
});

// Promisified helpers
db.run2 = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    })
    
  );

db.all2 = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
  );

db.get2 = (sql, params = []) =>
  new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)))
  );

db.exec2 = (sql) =>
  new Promise((resolve, reject) =>
    db.exec(sql, (err) => (err ? reject(err) : resolve()))
  );

const SCHEMA = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS Manager (
    manager_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    mname       TEXT    NOT NULL,
    email       TEXT    UNIQUE,
    password    TEXT
  );

  CREATE TABLE IF NOT EXISTS Admin (
    admin_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    aname       TEXT    NOT NULL,
    password    TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Employee (
    employee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ename       TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Customer (
    customer_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    cname        TEXT    NOT NULL,
    email        TEXT    NOT NULL UNIQUE,
    password     TEXT    NOT NULL,
    address      TEXT,
    phone_number TEXT
  );

  CREATE TABLE IF NOT EXISTS Product (
    product_id  INTEGER PRIMARY KEY AUTOINCREMENT,
    pname       TEXT    NOT NULL,
    description TEXT,
    category    TEXT,
    image       TEXT,
    stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    price       REAL    NOT NULL CHECK (price >= 0)
  );

  CREATE TABLE IF NOT EXISTS "Order" (
    order_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id      INTEGER NOT NULL,
    admin_id         INTEGER,
    order_date       TEXT    NOT NULL DEFAULT (DATE('now')),
    status           TEXT    NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','processing','completed','cancelled')),
    total_price      REAL    NOT NULL DEFAULT 0,
    delivery_address TEXT,
    payment_method   TEXT    DEFAULT 'debit'
                             CHECK (payment_method IN ('debit','cod')),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id)    REFERENCES Admin(admin_id)        ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS OrderItem (
    order_id    INTEGER NOT NULL,
    product_id  INTEGER NOT NULL,
    count       INTEGER NOT NULL CHECK (count > 0),
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id)   REFERENCES "Order"(order_id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS Payment (
    payment_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id        INTEGER NOT NULL UNIQUE,
    employee_id     INTEGER,
    amount          REAL    NOT NULL CHECK (amount >= 0),
    payment_method  TEXT    NOT NULL
                            CHECK (payment_method IN ('cash','credit_card','bank_transfer','promptpay')),
    slip_attachment TEXT,
    payment_date    TEXT    NOT NULL DEFAULT (DATE('now')),
    FOREIGN KEY (order_id)    REFERENCES "Order"(order_id)     ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES Employee(employee_id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS Report (
    report_id   INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id    INTEGER NOT NULL,
    report_date TEXT    NOT NULL DEFAULT (DATE('now')),
    report_type TEXT    NOT NULL,
    FOREIGN KEY (order_id) REFERENCES "Order"(order_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS Manager_Report (
    manager_id  INTEGER NOT NULL,
    report_id   INTEGER NOT NULL,
    PRIMARY KEY (manager_id, report_id),
    FOREIGN KEY (manager_id) REFERENCES Manager(manager_id) ON DELETE CASCADE,
    FOREIGN KEY (report_id)  REFERENCES Report(report_id)   ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_order_customer  ON "Order"(customer_id);
  CREATE INDEX IF NOT EXISTS idx_order_admin     ON "Order"(admin_id);
  CREATE INDEX IF NOT EXISTS idx_orderitem_order ON OrderItem(order_id);
  CREATE INDEX IF NOT EXISTS idx_payment_order   ON Payment(order_id);
  CREATE INDEX IF NOT EXISTS idx_report_order    ON Report(order_id);

  CREATE TABLE IF NOT EXISTS Cart (
    cart_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id  INTEGER NOT NULL UNIQUE,
    created_at   TEXT    NOT NULL DEFAULT (DATETIME('now')),
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS CartItem (
    cart_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id      INTEGER NOT NULL,
    product_id   INTEGER NOT NULL,
    quantity     INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    UNIQUE (cart_id, product_id),
    FOREIGN KEY (cart_id)    REFERENCES Cart(cart_id)       ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Product(product_id) ON DELETE RESTRICT
  );

  CREATE INDEX IF NOT EXISTS idx_cart_customer    ON Cart(customer_id);
  CREATE INDEX IF NOT EXISTS idx_cartitem_cart    ON CartItem(cart_id);
  CREATE INDEX IF NOT EXISTS idx_cartitem_product ON CartItem(product_id);
`;

db.exec2(SCHEMA)
  .then(async () => {
    // Backward-compatible migrations for existing DB files.
    async function ensureColumn(table, column, ddl) {
      const cols = await db.all2(`PRAGMA table_info(${table})`);
      if (!cols.some((c) => c.name === column)) {
        await db.run2(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
      }
    }

    await ensureColumn('Manager', 'email', 'email TEXT');
    await ensureColumn('Manager', 'password', 'password TEXT');
    await db.run2('CREATE UNIQUE INDEX IF NOT EXISTS idx_manager_email ON Manager(email)');

    await ensureColumn('Product', 'description', 'description TEXT');
    await ensureColumn('Product', 'category', 'category TEXT');
    await ensureColumn('Product', 'image', 'image TEXT');
    await ensureColumn('Product', 'stock', 'stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)');
    await ensureColumn('Payment', 'slip_attachment', 'slip_attachment TEXT');

    const bcrypt = require('bcrypt');
    //admin
    const hash = await bcrypt.hash('admin1234', 10);
    await db.run2(`
      INSERT INTO Admin (aname, password)
      SELECT ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM Admin WHERE aname = ?
    )
    `, ['admin@gmail.com', hash, 'admin@gmail.com']);
    //manager
    const managerHash = await bcrypt.hash('manager1234', 10);
    await db.run2(`
    INSERT INTO Manager (mname, email, password)
    SELECT ?, ?, ?
    WHERE NOT EXISTS (
     SELECT 1 FROM Manager WHERE email = ?
   )
    `, ['Manager1', 'manager@gmail.com', managerHash, 'manager@gmail.com']);

    console.log('Schema ready');
  })
  .catch((err) => { console.error('Schema error:', err.message); process.exit(1); });

module.exports = db;
