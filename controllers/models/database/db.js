
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile);

// Crear tablas en SQLite (si no existen)
db.serialize(() => {
  // Tabla de categorías
  db.run(`CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoria TEXT NOT NULL
  )`);

  // Tabla de productos
  db.run(`CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL,
      productos TEXT NOT NULL,
      categoria_id INTEGER,
      existencia_actual INTEGER NOT NULL,
      precio REAL NOT NULL,
      FOREIGN KEY (categoria_id) REFERENCES categorias (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS imagenes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      producto_id INTEGER,
      url TEXT,
      FOREIGN KEY (producto_id) REFERENCES productos (id)
  )`);

  db.get(`SELECT COUNT(*) AS count FROM categorias`, (err, row) => {
    if (err) {
      console.error(err);
      return;
    }
    if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO categorias (categoria) VALUES (?)");
      const defaultCategories = ['Camisas', 'Pantalones', 'Zapatos', 'Accesorios'];
      defaultCategories.forEach(cat => {
        stmt.run(cat);
      });
      stmt.finalize();
    }
  });
});

module.exports = db;