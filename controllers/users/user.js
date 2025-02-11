const db = require('../models/database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.index = (req, res) => {
    const categoryFilter = req.query.categoria ? parseInt(req.query.categoria) : null; // Convertir a número
    let query = `
      SELECT 
        p.id,
        p.codigo,
        p.productos,
        p.existencia_actual,
        p.precio,
        c.categoria AS categoria_nombre,
        i.url AS imagen_url
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN imagenes i ON p.id = i.producto_id
    `;

    let params = [];

    if (categoryFilter) {
        query += " WHERE c.id = ?";
        params.push(categoryFilter);
    }

    db.all(query, params, (err, productos) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error en la base de datos");
        }

        db.all("SELECT * FROM categorias", (err, categorias) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error en la base de datos");
            }

            let queryCarritoCount = 'SELECT COUNT(*) AS count FROM carrito';
            db.get(queryCarritoCount, (err, row) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error en la base de datos');
                }

                res.render('index', { productos, categorias, selectedCategory: categoryFilter, carritoCount: row.count });
            });
        });
    })
}


exports.addcar = (req, res) => {
    const { id } = req.params;
    db.run(`INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, 1)`,
        [req.user.id, id],
        (err) => {
            if (err) console.error(err);
            res.redirect('/');
        }
    );
};


exports.logout = (req, res) => {
    // Elimina la cookie 'authToken' que contiene el JWT
    res.clearCookie('authToken');

    // Opcionalmente, puedes redirigir al usuario a la página de login o a cualquier otra página
    res.redirect('/login');
}



exports.register = async (req, res) => {
    const { usuario, password } = req.body;
    if (!usuario || !password) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    try {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar en la base de datos
        db.run(
            "INSERT INTO usuarios (usuario, contrasena) VALUES (?, ?)",
            [usuario, hashedPassword],
            function (err) {
                if (err) {
                    console.error("Error al registrar usuario:", err);
                    return res.status(500).send("Error al registrar usuario.");
                }
                res.redirect("/login"); // Redirige al login después del registro
            }
        );
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        res.status(500).send("Error del servidor.");
    }
}


exports.getViewCar = (req, res) => {
    db.all(`SELECT c.id, p.productos, p.precio, c.cantidad FROM carrito c 
            JOIN productos p ON c.producto_id = p.id 
            WHERE c.usuario_id = ?`, [req.user.id], (err, carrito) => {
        console.log(carrito);
        res.render('carrito', { carrito });
    });
};


exports.deteleCar = (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM carrito WHERE id = ? AND usuario_id = ?`, [id, req.user.id], (err) => {
        if (err) console.error(err);
        res.redirect('/carrito');
    });
}


exports.login = (req, res) => {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
        return res.status(400).send("Todos los campos son obligatorios.");
    }

    db.get('SELECT * FROM usuarios WHERE usuario = ?', [usuario], (err, user) => {
        if (err) {
            console.error("Error en la base de datos:", err);
            return res.status(500).send("Error del servidor.");
        }

        if (!user) {
            return res.status(401).send("Usuario o contraseña incorrectos.");
        }

        if (!user.contrasena) {
            return res.status(500).send("Error en la base de datos: contraseña no encontrada.");
        }

        if (bcrypt.compareSync(contrasena, user.contrasena)) {
            const payload = {
                id: user.id,
                usuario: user.usuario,
            };
            const secretKey = 'key';
            const options = { expiresIn: '1h' };

            const token = jwt.sign(payload, secretKey, options);

            res.cookie('authToken', token, { httpOnly: true });
            res.redirect('/');
        } else {
            res.status(401).send("Usuario o contraseña incorrectos.");
        }
    });
};

