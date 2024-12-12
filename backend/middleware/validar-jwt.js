const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
    const token = req.cookies?.token; // Asegúrate de que req.cookies existe

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición',
        });
    }

    try {
        const { uid, rol } = jwt.verify(token, process.env.JWTSECRET);
        req.uid = uid;
        req.rol = rol;
        next();
    } catch (err) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido',
        });
    }
};

module.exports = { validarJWT };
