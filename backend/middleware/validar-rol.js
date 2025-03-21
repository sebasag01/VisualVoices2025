// La función 'tieneRol' verifica si el usuario autenticado posee uno de los roles permitidos.
// 1. Se recibe una lista de roles (...roles).
// 2. Retorna un middleware que revisa el 'rol' obtenido del token (en req.rol).
// 3. Si ese rol no está en la lista de roles permitidos, responde con un error 403 (acceso denegado).
// 4. Si sí coincide, llama a 'next()' para continuar.

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
