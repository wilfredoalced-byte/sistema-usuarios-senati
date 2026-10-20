const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(
  path.join(__dirname, 'usuarios.db'),
  (error) => {
    if (error) console.error('Error SQLite:', error.message);
    else console.log('SQLite conectado');
  }
);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE
    )
  `);
});

module.exports = db;
