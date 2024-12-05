const { response } = require('express');

// Middleware para verificar roles específicos
const tieneRol = (...roles) => {
    return (req, res = response, next) => {
        const { rol } = req;

        if (!roles.includes(rol)) {
            return res.status(403).json({
                ok: false,
                msg: `El servicio requiere uno de estos roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = { tieneRol };
