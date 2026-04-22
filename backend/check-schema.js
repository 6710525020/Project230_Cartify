const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/shop.db');

db.all("PRAGMA table_info(\"Order\")", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Order table columns:');
    console.log(JSON.stringify(rows, null, 2));
  }
  db.close();
});
