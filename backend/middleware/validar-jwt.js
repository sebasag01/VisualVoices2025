const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(400).json({
            ok: false,
            msg: 'Falta token de autorización',
        });
    }

    try {
        const { uid, rol } = jwt.verify(token, process.env.JWTSECRET); // Decodifica el token
        req.uid = uid;
        req.rol = rol; // Asigna el rol
        console.log(`Rol del usuario autenticado: ${rol}`); // Log para depuración
        next();
    } catch (err) {
        return res.status(400).json({
            ok: false,
            msg: 'Token no válido',
        });
    }
};

module.exports = { validarJWT };
