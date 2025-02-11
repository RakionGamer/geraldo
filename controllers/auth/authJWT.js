const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const token = req.cookies.authToken;
  
    if (!token) {
        res.redirect('/login')
    }
  
    const secretKey = 'key'; // Debe coincidir con la clave utilizada para generar el token
  
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).send("Token no válido.");
        }
        req.user = decoded; // Guardar los datos del usuario decodificados en la solicitud
        next();
    });
  }
  



module.exports = verificarToken;
  