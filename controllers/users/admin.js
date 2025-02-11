const db = require('../models/database/db');



exports.addProduct = (req, res) => {
    const { codigo, productos, categoria_id, existencia_actual, precio, imagen_url } = req.body;
    if (!codigo || !productos || !existencia_actual || !precio) {
      return res.status(400).send("Todos los campos obligatorios deben ser completados");
    }
    db.run(
      `INSERT INTO productos (codigo, productos, categoria_id, existencia_actual, precio)
       VALUES (?, ?, ?, ?, ?)`,
      [codigo, productos, categoria_id || null, existencia_actual, precio],
      function(err) {
        if (err) {
          console.error(err);
          return res.status(500).send("Error al insertar el producto");
        }
        const producto_id = this.lastID;
        // Si se proporcionó URL de imagen, se inserta en la tabla de imágenes
        if (imagen_url && imagen_url.trim() !== "") {
          db.run(`INSERT INTO imagenes (producto_id, url) VALUES (?, ?)`, [producto_id, imagen_url], (err) => {
            if (err) {
              console.error(err);
            }
            // Volver al panel administrativo con mensaje de éxito
            db.all("SELECT * FROM categorias", (err, categorias) => {
              if (err) {
                console.error(err);
                return res.status(500).send("Error en la base de datos");
              }
              res.render('admin', { categorias, message: "Producto agregado exitosamente!" });
            });
          });
        } else {
          // Volver al panel administrativo sin imagen
          db.all("SELECT * FROM categorias", (err, categorias) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Error en la base de datos");
            }
            res.render('admin', { categorias, message: "Producto agregado exitosamente!" });
          });
        }
      }
    );
  }


exports.getCategories = (req, res) => {
  db.all("SELECT * FROM categorias", (err, categorias) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error en la base de datos");
    }
    res.render('admin', { categorias, message: null });
  });
}