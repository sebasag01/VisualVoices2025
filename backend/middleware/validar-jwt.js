const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
  const token = req.cookies?.token; // Leer el token de las cookies
  console.log('[DEBUG] Token recibido en validarJWT:', token);

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: 'No hay token en la petición',
    });
  }

  try {
    const { uid, rol } = jwt.verify(token, process.env.JWTSECRET); // Verificar el token
    req.uid = uid; // Añadir el ID del usuario al request
    req.rol = rol; // Añadir el rol del usuario al request
    console.log('[DEBUG] Token verificado, uid:', uid, ', rol:', rol);
    next();
  } catch (err) {
    console.error('[ERROR] Error al verificar el token:', err);
    return res.status(401).json({
      ok: false,
      msg: 'Token no válido',
    });
  }
};


module.exports = { validarJWT };
