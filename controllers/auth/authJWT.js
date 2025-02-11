const jwt = require('jsonwebtoken');


function verificarToken(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
        return res.redirect('/login'); // Redirige si no hay token
    }

    const secretKey = 'key'; // Clave secreta para verificar el token

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).send("Token no válido.");
        }

        req.user = decoded; // Guardar los datos del usuario decodificados en la solicitud
        next(); // Continuar con la ejecución del siguiente middleware o ruta
    });
}


module.exports = verificarToken;
  